import React from "react";
import { COLORS } from "./SiteChrome";

// A simple on-screen certificate shown once a trainee has viewed every
// published module and passed its quiz (see useTrainingProgress's
// issueCertificateIfEligible, and training_certificates in
// supabase/migrations/015_training_course_tables.sql).
export default function TrainingCertificate({ name, tierLabel, issuedAt }) {
  const date = issuedAt
    ? new Date(issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div
      style={{
        marginTop: 28, borderRadius: 20, padding: "40px 36px", textAlign: "center",
        background: `linear-gradient(160deg, ${COLORS.tealLight} 0%, ${COLORS.white} 70%)`,
        border: `2px solid ${COLORS.teal}`, position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 6 }}>🏆</div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 10 }}>
        Certificate of Completion
      </div>
      <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: COLORS.ink, margin: "0 0 6px" }}>
        {name || "Trainee"}
      </h2>
      <p style={{ fontSize: 14, color: COLORS.inkMid, margin: "0 0 18px" }}>
        has completed The PuzzleBox training course{tierLabel ? ` — ${tierLabel}` : ""}
      </p>
      {date && <p style={{ fontSize: 12.5, color: COLORS.inkFaint, margin: 0 }}>Issued {date}</p>}
    </div>
  );
}