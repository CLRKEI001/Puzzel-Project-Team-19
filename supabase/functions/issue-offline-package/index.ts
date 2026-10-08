// supabase/functions/issue-offline-package/index.ts
//
// Two actions, both called by src/offline/offlineVault.js:
//
//   download (default)  Verified educators only. Bundles the screener content
//                       and the educator's consent-verified children, encrypts
//                       it with a fresh AES-256 key, records a 7-day licence
//                       and returns { key, payload, iv, licence }.
//
//   status              Called after each offline sync. Records the sync time
//                       and says whether the licence was cancelled.
//
// Login is Firebase, so the caller's Firebase ID token arrives in the
// x-firebase-token header and is verified here against Google's public keys.
// Deploy with JWT verification OFF (the Supabase gateway can't check a
// Firebase token; this function does it itself).

import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";

const FIREBASE_PROJECT = "puzzle-project-3b369";
const LICENCE_DAYS = 7;
const ALLOWED_ROLES = ["educator"];

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-firebase-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const toB64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

// Returns the Firebase user ID, or throws
async function verifyFirebase(req: Request): Promise<string> {
  const token = req.headers.get("x-firebase-token");
  if (!token) throw new Error("missing token");
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT}`,
    audience: FIREBASE_PROJECT,
  });
  if (!payload.sub) throw new Error("no subject");
  return payload.sub;
}

async function buildScreener(uid: string, teacher: { email: string; name: string }) {
  const [meta, sections, questions, scoreTables, bands, children] = await Promise.all([
    admin.from("screener_meta").select("version, instructions, scoring_legend").eq("id", 1).maybeSingle(),
    admin.from("screener_sections").select("id, sort_order, title, description, domain, is_puzzle_timer_section").order("sort_order"),
    admin.from("screener_questions")
      .select("id, section_id, sort_order, label, instruction, to_pass, domain_override, scoring_type, needs_confirmation, checklist_options")
      .order("sort_order"),
    admin.from("screener_score_tables").select("id, question_id, age, sort_order, score, min_value, max_value").order("sort_order"),
    admin.from("screener_interpretation_bands").select("id, age, sort_order, band_key, label, min_score, max_score").order("sort_order"),
    // Only this educator's children whose consent form has been verified,
    // the same rule the online screener applies before a screening can start.
    admin.from("children")
      .select("id, name, student_number, school, school_id, age, age_months, gender, language, child_identities(full_name)")
      .eq("teacher_uid", uid)
      .eq("consent_verified", true)
      .order("name"),
  ]);

  for (const r of [meta, sections, questions, scoreTables, bands, children]) {
    if (r.error) throw r.error;
  }

  return {
    version: meta.data?.version ?? "1.0",
    instructions: meta.data?.instructions ?? "",
    scoringLegend: meta.data?.scoring_legend ?? [],
    sections: sections.data,
    questions: questions.data,
    scoreTables: scoreTables.data,
    interpretationBands: bands.data,
    children: (children.data ?? []).map(({ child_identities, ...c }: any) => ({
      ...c,
      full_name: Array.isArray(child_identities) ? child_identities[0]?.full_name ?? null : child_identities?.full_name ?? null,
    })),
    // The registered email is what the database checks uploads against
    // (teacher_email must match users.email), so offline screenings use it.
    teacher,
    packagedAt: new Date().toISOString(),
  };
}

async function handleDownload(uid: string, body: { deviceId?: string }) {
  const deviceId = String(body.deviceId || "").slice(0, 100);
  if (!deviceId) return json({ error: "Missing device ID." }, 400);

  const { data: user, error: userErr } = await admin
    .from("users").select("id, name, email, role, is_verified").eq("id", uid).maybeSingle();
  if (userErr) throw userErr;

  if (!user || !ALLOWED_ROLES.includes(user.role ?? "")) {
    return json({ error: "The offline screener is only available to educators." }, 403);
  }
  if (!user.is_verified) {
    return json({ error: "Your account hasn't been approved yet, so the offline screener isn't available." }, 403);
  }

  const examiner = user.name || user.email || "Educator";
  const screener = await buildScreener(uid, { email: (user.email || "").toLowerCase(), name: examiner });

  // Fresh key for every download
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(screener)),
  );
  const rawKey = await crypto.subtle.exportKey("raw", key);

  const expiresAt = new Date(Date.now() + LICENCE_DAYS * 86_400_000).toISOString();

  const { data: licence, error: licErr } = await admin
    .from("offline_licences")
    .insert({ user_id: uid, examiner, device_id: deviceId, expires_at: expiresAt })
    .select("id, examiner, expires_at")
    .single();
  if (licErr) throw licErr;

  return json({
    key: toB64(rawKey),
    payload: toB64(cipher),
    iv: toB64(iv),
    // userId lets the app refuse to open this licence for anyone else signed in on the device
    licence: { id: licence.id, userId: uid, examiner: licence.examiner, expiresAt: licence.expires_at },
  });
}

async function handleStatus(uid: string, body: { licenceId?: string; markSynced?: boolean }) {
  if (!body.licenceId) return json({ error: "Missing licence ID." }, 400);

  const { data: licence, error } = await admin
    .from("offline_licences").select("id, revoked").eq("id", body.licenceId).eq("user_id", uid).maybeSingle();
  if (error) throw error;

  // A licence that no longer exists counts as cancelled. The app only wipes
  // the device once every captured result has uploaded, so nothing is lost.
  if (!licence) return json({ revoked: true });

  if (body.markSynced) {
    await admin.from("offline_licences").update({ last_synced_at: new Date().toISOString() }).eq("id", licence.id);
  }
  return json({ revoked: licence.revoked });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let uid: string;
  try {
    uid = await verifyFirebase(req);
  } catch {
    return json({ error: "Please sign in again to use the offline screener." }, 401);
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "status") return await handleStatus(uid, body);
    return await handleDownload(uid, body);
  } catch (e) {
    console.error("issue-offline-package:", e);
    return json({ error: "Something went wrong preparing the offline screener. Try again in a minute." }, 500);
  }
});
