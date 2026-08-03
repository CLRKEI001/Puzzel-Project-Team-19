import React from "react";
import { COLORS, FONT_IMPORT, PuzzlePiece, SectionHeading, Navbar, Footer, CallToAction } from "./SiteChrome";

function HowHero() {
  return (
    <section style={{
      paddingTop: 84,
      background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={150} color={COLORS.teal} rotate={-12} style={{ position: "absolute", top: 50, right: -40 }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "72px 40px", position: "relative" }}>
        <span style={{
          display: "inline-block", padding: "7px 16px", borderRadius: 20,
          background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
          fontSize: 12, fontWeight: 800, color: COLORS.teal, marginBottom: 24,
        }}>
          Platform overview
        </span>
        <h1 style={{
          fontFamily: "'Nunito', sans-serif", fontSize: "clamp(34px, 4.4vw, 56px)",
          fontWeight: 900, color: COLORS.ink, lineHeight: 1.08,
          letterSpacing: "-0.03em", marginBottom: 20,
        }}>
          How The PuzzleBox works
        </h1>
        <p style={{ fontSize: 17, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 760 }}>
          From registration to research — a step-by-step walkthrough of the full screening process.
        </p>
      </div>
    </section>
  );
}

// The six-stage screening journey
const JOURNEY = [
  {
    title: "Register & verify credentials",
    color: COLORS.teal,
    desc: "Users register with their email and professional registration number — a SACE number for educators, HPCSA number for psychologists. The system verifies credentials before granting access. Admins and data analysts are added by the organisation administrator.",
  },
  {
    title: "Complete training modules",
    color: COLORS.pink,
    desc: "Before accessing screening features, users complete the digital training modules covering puzzle facilitation techniques, observation methods and how to interact with children during assessments. Quizzes ensure knowledge retention.",
  },
  {
    title: "Facilitate the puzzle activity",
    color: COLORS.purple,
    desc: "The educator guides the child through a structured puzzle activity using the Puzzle Play module. Lesson plans are available in English, Afrikaans and isiXhosa. The activity can run offline — data is stored locally and synced when connectivity is restored.",
  },
  {
    title: "Capture screening observations",
    color: COLORS.orange,
    desc: "The educator completes a structured digital form capturing timing, planning, sequencing and completion data. Observational notes are recorded in real time, and all inputs are mapped automatically to the predefined developmental domains.",
  },
  {
    title: "Psychologist reviews & interprets",
    color: COLORS.teal,
    desc: "The assigned psychologist accesses the submitted screening data via their dashboard. They review domain scores, observational notes and timing data, then add their clinical interpretation. Comparative screenings are enabled only after a minimum two-month interval.",
  },
  {
    title: "Results, alerts & research output",
    color: COLORS.pink,
    desc: "The results dashboard generates child-specific summaries and flags potential developmental concerns. Anonymised, aggregated data flows to the Research & Analytics module, where data analysts can explore trends and export to Excel for further analysis.",
  },
];

function JourneySection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <SectionHeading
          eyebrow="The screening journey"
          title="Six stages from onboarding to research output"
        />

        <div style={{ position: "relative" }}>
          {JOURNEY.map((stage, i) => {
            const isLast = i === JOURNEY.length - 1;
            return (
              <div key={stage.title} style={{ display: "flex", gap: 26, position: "relative" }}>
                {/* Numbered marker + connecting line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: stage.color, color: COLORS.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Nunito', sans-serif", fontSize: 17, fontWeight: 900,
                    boxShadow: `0 4px 14px ${stage.color}55`, zIndex: 1,
                  }}>
                    {i + 1}
                  </div>
                  {!isLast && (
                    <div style={{ width: 2, flex: 1, background: COLORS.border, minHeight: 28 }} />
                  )}
                </div>

                {/* Stage content */}
                <div style={{ paddingBottom: isLast ? 0 : 34, flex: 1 }}>
                  <h3 style={{
                    fontFamily: "'Nunito', sans-serif", fontSize: 19, fontWeight: 900,
                    color: COLORS.ink, marginBottom: 10, paddingTop: 9,
                  }}>
                    {stage.title}
                  </h3>
                  <p style={{ fontSize: 14.5, color: COLORS.inkMid, lineHeight: 1.75 }}>{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// What each role sees — reinforces the tiered access rule
const ROLE_ACCESS = [
  {
    role: "Educators & primary healthcare",
    tier: "Tier 1",
    color: COLORS.teal,
    bg: COLORS.tealLight,
    sees: ["A single global screening score", "Lesson plans and puzzle activities", "Their assigned learners and session history", "Training modules and certification"],
  },
  {
    role: "Psychologists",
    tier: "Tier 2",
    color: COLORS.purple,
    bg: COLORS.purpleLight,
    sees: ["Domain and construct-level scores", "Flagged learners and clinical alerts", "Comparative analysis across sessions", "Report generation and referral letters"],
  },
  {
    role: "Administrators & analysts",
    tier: "Admin",
    color: COLORS.pink,
    bg: COLORS.pinkLight,
    sees: ["Anonymised aggregate data only", "User management and role assignment", "Excel export for research", "POPIA compliance oversight"],
  },
];

function RoleAccessSection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.surface, position: "relative", overflow: "hidden" }}>
      <PuzzlePiece size={120} color={COLORS.orange} rotate={22} style={{ position: "absolute", bottom: -20, right: -30 }} />
      <div style={{ maxWidth: 1300, margin: "auto", position: "relative" }}>
        <SectionHeading
          eyebrow="Access by role"
          title="Everyone sees exactly what they need — and nothing more"
          lead="Access to screening results is tiered by professional role. Educators receive a single overall screening score to guide referral, while domain-level interpretation is reserved for qualified psychologists."
          maxWidth={820}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 22 }}>
          {ROLE_ACCESS.map(r => (
            <div key={r.role} style={{
              padding: "30px 28px", borderRadius: 20,
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
              borderTop: `4px solid ${r.color}`, transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{
                display: "inline-block", padding: "4px 13px", borderRadius: 16,
                background: r.bg, color: r.color, fontSize: 11, fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14,
              }}>
                {r.tier}
              </span>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 900, color: COLORS.ink, marginBottom: 16 }}>{r.role}</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {r.sees.map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: COLORS.inkMid, marginBottom: 10, lineHeight: 1.6 }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", background: r.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2,
                    }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke={r.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Built for South African classrooms
const FEATURES = [
  { title: "Works offline", color: COLORS.teal, desc: "Screening sessions run without connectivity. Data is stored locally on the device and synced automatically once a connection is restored." },
  { title: "Three languages", color: COLORS.pink, desc: "Every instruction, lesson plan and training video is available in English, Afrikaans and isiXhosa — administered in the child's home language." },
  { title: "POPIA compliant", color: COLORS.purple, desc: "Child data is anonymised at capture. Research and analytics only ever access aggregated datasets, governed by HPCSA-aligned ethical standards." },
];

function FeaturesSection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          eyebrow="Designed for the context"
          title="Built for South African classrooms"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: "30px 26px", borderRadius: 18,
              background: COLORS.surface, borderTop: `4px solid ${f.color}`,
            }}>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks({ onNavigateToLogin, onNavigate }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to HowItWorks"));

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Navbar current="how" onNavigate={go} onLoginClick={onNavigateToLogin} />
      <HowHero />
      <JourneySection />
      <RoleAccessSection />
      <FeaturesSection />
      <CallToAction onNavigate={go} onLoginClick={onNavigateToLogin} />
      <Footer onNavigate={go} onLoginClick={onNavigateToLogin} />
    </div>
  );
}