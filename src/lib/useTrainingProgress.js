import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { mapTrainingCertificateRow } from "./mappers";

// Per-user training progress — see supabase/migrations/015_training_course_tables.sql
// and 018_training_certificate_approval.sql for training_progress /
// training_certificates. Mirrors the shape of useTrainingModules.js /
// useTrainingQuestions.js: a small hook the member-facing Training flow
// (MemberArea.js) reads and writes directly.
//
// Certificates are admin-approved, not automatic: once every published
// module is quiz_passed, issueCertificateIfEligible files a "pending"
// request — it does NOT mark the trainee certified. An admin reviews and
// approves it from AdminHome.js's "Training Certifications" screen
// (which flips status to "approved" and sets issued_at). Only then does
// TrainingCertificate render for the trainee — see the certificate.status
// check in MemberArea.js.

function mapProgressRow(row) {
  return {
    moduleId: row.module_id,
    status: row.status, // "viewed" | "quiz_passed"
    bestScorePercent: row.best_score_percent,
    viewedAt: row.viewed_at,
    quizPassedAt: row.quiz_passed_at,
  };
}

export function useTrainingProgress(userId) {
  const [progress, setProgress] = useState(null); // null = loading; else Map(moduleId -> row)
  const [certificate, setCertificate] = useState(undefined); // undefined = loading, null = none yet
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [{ data, error: err }, { data: certRow }] = await Promise.all([
      supabase.from("training_progress").select("*").eq("user_id", userId),
      supabase.from("training_certificates").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (err) {
      // Table not migrated yet, or offline — don't block the training
      // content itself on progress tracking; just show nothing tracked.
      setError("Your progress isn't being saved right now — you can still complete the modules.");
      setProgress(new Map());
      setCertificate(null);
      return;
    }
    setError("");
    const map = new Map();
    (data || []).forEach((row) => map.set(row.module_id, mapProgressRow(row)));
    setProgress(map);
    setCertificate(certRow ? mapTrainingCertificateRow(certRow) : null);
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const markViewed = useCallback(async (moduleId) => {
    if (!userId || !moduleId) return;
    // Upsert without downgrading an existing "quiz_passed" status back to "viewed".
    const existing = progress?.get(moduleId);
    if (existing) return; // already have a row (viewed or passed) — nothing to do
    const { error: err } = await supabase
      .from("training_progress")
      .upsert({ user_id: userId, module_id: moduleId, status: "viewed" }, { onConflict: "user_id,module_id", ignoreDuplicates: true });
    if (!err) refresh();
  }, [userId, progress, refresh]);

  const recordQuizResult = useCallback(async (moduleId, { percent, passed }) => {
    if (!userId || !moduleId) return;
    const existing = progress?.get(moduleId);
    const bestScorePercent = Math.max(percent, existing?.bestScorePercent || 0);
    const payload = {
      user_id: userId,
      module_id: moduleId,
      status: passed ? "quiz_passed" : (existing?.status || "viewed"),
      best_score_percent: bestScorePercent,
      quiz_passed_at: passed ? new Date().toISOString() : existing?.quizPassedAt || null,
    };
    const { error: err } = await supabase
      .from("training_progress")
      .upsert(payload, { onConflict: "user_id,module_id" });
    if (!err) refresh();
  }, [userId, progress, refresh]);

  // Files a *pending* certificate request once every published module is
  // quiz_passed — it does not issue anything by itself. ignoreDuplicates
  // means an existing row (pending OR already approved) is left exactly
  // as-is, so this is safe to call on every render without re-opening an
  // approved certificate back to pending.
  const issueCertificateIfEligible = useCallback(async (publishedModuleIds, userEmail, userName) => {
    if (!userId || certificate || !progress) return;
    const allPassed = publishedModuleIds.length > 0 && publishedModuleIds.every((id) => progress.get(id)?.status === "quiz_passed");
    if (!allPassed) return;
    const { error: err } = await supabase
      .from("training_certificates")
      .upsert(
        { user_id: userId, user_email: userEmail || null, user_name: userName || null, status: "pending" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    if (!err) refresh();
  }, [userId, certificate, progress, refresh]);

  return {
    progress: progress || new Map(),
    loading: progress === null,
    certificate,
    certificateLoading: certificate === undefined,
    error,
    markViewed,
    recordQuizResult,
    issueCertificateIfEligible,
    refresh,
  };
}