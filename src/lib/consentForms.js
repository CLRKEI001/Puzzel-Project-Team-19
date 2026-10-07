// consentForms.js
//
// Shared upload + AI verification + save flow for consent forms, used by
// both ChildrenTable.js (Student Records' consent panel) and
// TeacherHome.js (the "Add New Student" flow, so a form can be attached
// right when a child is created). Keeping this in one place means there's
// exactly one path that writes consent_verified — never two components
// quietly disagreeing about what counts as "verified".
//
// The actual reading of the form (does it look filled in, even if
// handwritten) happens server-side in the validate-consent-form Edge
// Function, which calls an AI vision model — see that function's header
// comment for the required Supabase secret (ANTHROPIC_API_KEY).

import { supabase } from "../supabaseClient";

export const CONSENT_BUCKET = "consent-forms";

// Mirrors the Edge Function's own REQUIRED_FIELDS list — kept here too so
// the UI can show "what this form needs" before anything is even uploaded
// (see the Download Consent Form template), not only after a rejection.
export const REQUIRED_CONSENT_FIELDS = [
  "Child's full name",
  "Child's date of birth or age",
  "School name",
  "Parent or guardian's full name",
  "Parent or guardian's signature",
  "Date signed",
  "The consent statement itself ticked, circled, initialled, or otherwise marked as agreed to",
];

// Uploads the file, asks the Edge Function to verify it, and saves the
// result onto the child's row — one call does the whole round trip so
// every caller behaves identically. Throws on upload failure (nothing to
// save yet); a verification failure is NOT thrown — it comes back as
// valid:false with notes explaining why, since "the AI check itself broke"
// should still let the teacher see what was uploaded and retry, rather
// than losing the file.
export async function uploadAndVerifyConsentForm({ childId, file }) {
  if (!childId) throw new Error("A child record is required before a consent form can be attached.");
  if (!file) throw new Error("No file selected.");

  const path = `${childId}/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from(CONSENT_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadErr) throw new Error("Could not upload the consent form — " + uploadErr.message);

  const { data: pub } = supabase.storage.from(CONSENT_BUCKET).getPublicUrl(path);
  const fileUrl = pub.publicUrl;

  let verification = { valid: false, missingFields: [], notes: "" };
  try {
    const { data, error: fnErr } = await supabase.functions.invoke("validate-consent-form", {
      body: { fileUrl, fileType: file.type },
    });
    if (fnErr) throw fnErr;
    verification = {
      valid: Boolean(data?.valid),
      missingFields: Array.isArray(data?.missingFields) ? data.missingFields : [],
      notes: data?.notes || "",
    };
  } catch (err) {
    // The upload itself succeeded — don't lose that. Surface this as "not
    // verified yet" with an explanation, rather than throwing the upload
    // away because the verification step couldn't run (e.g. the
    // ANTHROPIC_API_KEY secret isn't set yet on a fresh deploy).
    verification = {
      valid: false,
      missingFields: [],
      notes: "Could not automatically verify this form — " + (err?.message || "the verification service is unavailable") + ". A reviewer will need to check it manually before a screening can start.",
    };
  }

  const nowIso = new Date().toISOString();
  const { error: saveErr } = await supabase
    .from("children")
    .update({
      consent_form_url: fileUrl,
      consent_file_name: file.name,
      consent_uploaded_at: nowIso,
      consent_verified: verification.valid,
      consent_verification_notes: verification.notes,
      consent_verified_at: nowIso,
    })
    .eq("id", childId);
  if (saveErr) throw new Error("Uploaded, but could not save the record — " + saveErr.message);

  return {
    url: fileUrl,
    fileName: file.name,
    fileType: file.type,
    uploadedAt: nowIso,
    valid: verification.valid,
    missingFields: verification.missingFields,
    notes: verification.notes,
  };
}

// ── Manual review fallback ───────────────────────────────────────────
// When the AI check can't run because the service is overloaded / rate
// limited / unavailable ("high demand", 429, 503 ...), the teacher can send
// the already-uploaded form to the admin dashboard instead. The admin opens
// the file and accepts or rejects it.
const OVERLOAD_RE = /high demand|overload|too many requests|rate.?limit|quota|unavailable|try again later|\b(429|503)\b|could not automatically verify/i;

export function isOverloadNote(notes) {
  return OVERLOAD_RE.test(notes || "");
}

export async function requestManualConsentReview({ childId, requestedBy }) {
  const { error } = await supabase
    .from("children")
    .update({
      consent_review_status: "pending",
      consent_review_requested_at: new Date().toISOString(),
      consent_review_requested_by: requestedBy || null,
      consent_reviewed_by: null,
      consent_reviewed_at: null,
      consent_review_note: null,
    })
    .eq("id", childId);
  if (error) throw new Error("Could not send the form for manual review — " + error.message);
}

export async function resolveManualConsentReview({ childId, approve, reviewer, note }) {
  const nowIso = new Date().toISOString();
  const patch = {
    consent_review_status: approve ? "approved" : "rejected",
    consent_reviewed_by: reviewer || null,
    consent_reviewed_at: nowIso,
    consent_review_note: note || null,
  };
  if (approve) {
    patch.consent_verified = true;
    patch.consent_verified_at = nowIso;
    patch.consent_verification_notes = "Manually approved by an admin" + (note ? " — " + note : "");
  } else {
    patch.consent_verified = false;
    patch.consent_verification_notes = "Rejected by an admin" + (note ? " — " + note : "") + ". Please upload a corrected form.";
  }
  const { error } = await supabase.from("children").update(patch).eq("id", childId);
  if (error) throw new Error(error.message);
  return patch;
}