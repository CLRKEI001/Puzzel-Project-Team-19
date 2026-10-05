// supabase/functions/validate-consent-form/index.ts
//
// Reads an uploaded consent form (photo, scan, or PDF — printed OR
// handwritten) and checks whether every required field actually looks
// filled in. Called right after a teacher uploads a consent form, from
// ChildrenTable.js and TeacherHome.js's "Add New Student" flow:
//
//   supabase.functions.invoke("validate-consent-form", {
//     body: { fileUrl, fileType },
//   });
//
// Returns { valid: boolean, missingFields: string[], notes: string }.
// Does NOT write to the database itself — the caller saves the result onto
// the child's row (consent_verified / consent_verification_notes /
// consent_verified_at, migration 028) so every caller's write goes through
// the same place and the function itself stays a pure "read this image"
// step.
//
// Deploy: supabase functions deploy validate-consent-form
// Secrets (set once, never shipped to the browser):
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Optional: ANTHROPIC_MODEL (defaults to claude-sonnet-4-5-20250929) —
// override if your account's available model id differs.

// @ts-ignore -- Deno remote import isn't resolved by a local TS toolchain
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5-20250929";

// What the printed consent form (see public/puzzlebox-consent-form.pdf)
// actually asks for — kept here, not just in the prompt, so a field name
// changing is a one-line edit and both the prompt and the JSON schema below
// stay in sync.
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }
  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured on this Edge Function" }),
      { status: 500, headers: corsHeaders }
    );
  }

  let fileUrl: string, fileType: string | undefined;
  try {
    ({ fileUrl, fileType } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: corsHeaders });
  }
  if (!fileUrl) {
    return new Response(JSON.stringify({ error: "fileUrl is required" }), { status: 400, headers: corsHeaders });
  }

  // Fetch the just-uploaded file from Supabase Storage's public URL and
  // base64-encode it for Anthropic's image/document content blocks.
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
    return new Response(
      JSON.stringify({ error: "Could not fetch the uploaded file: " + (err as Error).message }),
      { status: 502, headers: corsHeaders }
    );
  }

  const mediaType = mediaTypeFor(fileType, fileUrl);
  const isPdf = mediaType === "application/pdf";

  const prompt =
    `This is a scanned or photographed child-development-screening consent form — it may be a printed form, or entirely handwritten. ` +
    `Check whether EACH of the following required fields is actually filled in (handwriting counts, so does a tick/circle/initial for the consent statement — it does not need to be typed):\n` +
    REQUIRED_FIELDS.map((f, i) => `${i + 1}. ${f}`).join("\n") +
    `\n\nRespond with ONLY a JSON object, no other text, in exactly this shape:\n` +
    `{"valid": boolean, "missingFields": string[], "notes": string}\n` +
    `"valid" is true only if every field above is filled in. "missingFields" lists (in plain language, not the numbers) exactly which of the fields above are blank, illegible, or missing — empty array if none. "notes" is one short sentence explaining the result.`;

  const content: Record<string, unknown>[] = [
    {
      type: isPdf ? "document" : "image",
      source: { type: "base64", media_type: mediaType, data: base64 },
    },
    { type: "text", text: prompt },
  ];

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content }],
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: "Anthropic API error: " + (data?.error?.message || resp.statusText) }),
        { status: 502, headers: corsHeaders }
      );
    }

    const text = (data?.content || []).map((b: { text?: string }) => b.text || "").join("");
    let parsed: { valid: boolean; missingFields: string[]; notes: string };
    try {
      // The model is asked for JSON only, but strip any stray fencing/prose
      // defensively rather than trust that instruction held perfectly.
      const match = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : text);
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse the verification result", raw: text }),
        { status: 502, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        valid: Boolean(parsed.valid),
        missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
        notes: typeof parsed.notes === "string" ? parsed.notes : "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Verification request failed: " + (err as Error).message }),
      { status: 502, headers: corsHeaders }
    );
  }
});