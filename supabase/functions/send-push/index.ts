// supabase/functions/validate-consent-form/index.ts
//
// Reads an uploaded consent form (photo, scan, or PDF — printed OR
// handwritten) and checks whether every required field looks filled in,
// using Google's Gemini API (free tier available).
//
// Called from ChildrenTable.js and TeacherHome.js via:
//   supabase.functions.invoke("validate-consent-form", { body: { fileUrl, fileType } });
//
// Returns { valid: boolean, missingFields: string[], notes: string }.
// Does NOT write to the database — the caller saves the result.
//
// Deploy with JWT verification OFF (this app signs in with Firebase, which
// Supabase's gateway can't verify):
//   supabase functions deploy validate-consent-form --no-verify-jwt
// Secrets:
//   supabase secrets set GEMINI_API_KEY=...        (from aistudio.google.com)
//   optional: GEMINI_MODEL (defaults to gemini-3.8-flash)

// @ts-ignore -- Deno remote import isn't resolved by a local TS toolchain
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// @ts-ignore -- Deno global
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
// @ts-ignore -- Deno global
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.8-flash";
// @ts-ignore -- Deno global
const FALLBACK_MODEL = Deno.env.get("GEMINI_FALLBACK_MODEL") ?? "gemini-flash-latest";

const REQUIRED_FIELDS = [
  "child's full name",
  "child's date of birth or age",
  "school name",
  "parent or guardian's full name",
  "parent or guardian's signature",
  "date signed",
  "the consent statement itself ticked, circled, initialled, or otherwise marked as agreed to",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function mediaTypeFor(fileType: string | undefined, fileUrl: string): string {
  const t = (fileType || "").toLowerCase();
  if (t.includes("pdf") || fileUrl.toLowerCase().endsWith(".pdf")) return "application/pdf";
  if (t.includes("png")) return "image/png";
  if (t.includes("webp")) return "image/webp";
  if (t.includes("gif")) return "image/gif";
  return "image/jpeg";
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Upstream failures come back as a normal 200 result (valid:false + the real
// reason in notes) so the app can show WHY, instead of a generic "non-2xx".
const fail = (msg: string) => {
  console.error(msg);
  return json({ valid: false, missingFields: [], notes: "Verification failed: " + msg });
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!GEMINI_API_KEY) return fail("GEMINI_API_KEY secret is not set on this Edge Function");

  let fileUrl: string, fileType: string | undefined;
  try {
    ({ fileUrl, fileType } = await req.json());
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!fileUrl) return json({ error: "fileUrl is required" }, 400);

  let base64: string;
  try {
    const fileResp = await fetch(fileUrl);
    if (!fileResp.ok) throw new Error(`fetch failed: ${fileResp.status}`);
    const bytes = new Uint8Array(await fileResp.arrayBuffer());
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    base64 = btoa(binary);
  } catch (err) {
    return fail("Could not fetch the uploaded file: " + (err as Error).message);
  }

  const mediaType = mediaTypeFor(fileType, fileUrl);

  const prompt =
    `This is a scanned or photographed child-development-screening consent form — it may be a printed form, or entirely handwritten. ` +
    `Check whether EACH of the following required fields is actually filled in (handwriting counts, so does a tick/circle/initial for the consent statement — it does not need to be typed). ` +
    `A blank template with empty fields is NOT filled in.\n` +
    REQUIRED_FIELDS.map((f, i) => `${i + 1}. ${f}`).join("\n") +
    `\n\nRespond with ONLY a JSON object in exactly this shape:\n` +
    `{"valid": boolean, "missingFields": string[], "notes": string}\n` +
    `"valid" is true only if every field above is filled in. "missingFields" lists (in plain language, not the numbers) exactly which fields are blank, illegible, or missing — empty array if none. "notes" is one short sentence explaining the result.`;

  try {
    const body = JSON.stringify({
      contents: [
        { parts: [{ inline_data: { mime_type: mediaType, data: base64 } }, { text: prompt }] },
      ],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    });

    // Gemini sometimes answers 429/503 ("high demand"). Retry a few times with
    // a short backoff, then fall back to a second model before giving up.
    const models = [GEMINI_MODEL, FALLBACK_MODEL].filter((m, i, a) => m && a.indexOf(m) === i);
    let resp: Response | undefined;
    let data: any;
    outer: for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": GEMINI_API_KEY }, body }
        );
        data = await resp.json();
        if (resp.ok) break outer;
        if (resp.status !== 429 && resp.status !== 503) break; // not transient: try next model
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    if (!resp || !resp.ok) {
      return fail("Gemini API error: " + (data?.error?.message || resp?.statusText));
    }

    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: { text?: string }) => p.text || "")
      .join("");
    let parsed: { valid: boolean; missingFields: string[]; notes: string };
    try {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : text);
    } catch {
      return fail("Could not parse the verification result: " + text.slice(0, 200));
    }

    return json({
      valid: Boolean(parsed.valid),
      missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
    });
  } catch (err) {
    return fail("Verification request failed: " + (err as Error).message);
  }
});