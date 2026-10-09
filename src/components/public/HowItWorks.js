import React from "react";
import {
  COLORS, FONTS, PUBLIC_FONT_IMPORT, WARM_PAGE_CSS, CREAM,
  PuzzlePiece, SectionHeading, PageHero, Reveal,
  Navbar, Footer, CallToAction, useIsMobile,
} from "../shared/SiteChrome";

// How It Works, reworked to match the warmer home page.
// Journey is a zigzag timeline on desktop and a single column on phones.
// All copy is unchanged from the previous version except the page title.

// ---- The six-stage screening journey -------------------------------------
const JOURNEY = [
  {
    title: "Register & verify credentials",
    color: COLORS.teal,
    desc: "Users register with their email and professional registration number — a SACE number for educators, HPCSA number for psychologists. The system verifies credentials before granting access. Admins and data analysts are added by the organisation administrator.",
  },
  {
    title: "Complete training modules",
    color: COLORS.pink,
    desc: "Before accessing screening features, users unlock the digital training modules with their login and the Product number supplied with their screener, then complete modules covering puzzle facilitation techniques, observation methods and how to interact with children during assessments. Quizzes ensure knowledge retention.",
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

function StageCard({ stage, i }) {
  return (
    <div className="soft-card" style={{ background: COLORS.white, borderRadius: 24, padding: "26px 28px", boxShadow: "0 8px 26px rgba(60,40,20,0.06)" }}>
      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: stage.color, marginBottom: 8 }}>
        Step {i + 1}
      </p>
      <h3 style={{ fontFamily: FONTS.heading, fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10, lineHeight: 1.25 }}>
        {stage.title}
      </h3>
      <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.75 }}>{stage.desc}</p>
    </div>
  );
}

function StageMarker({ stage, i }) {
  return (
    <div className="wiggle" style={{
      width: 52, height: 52, borderRadius: "50%", background: stage.color, color: COLORS.white,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONTS.heading, fontSize: 20, fontWeight: 900,
      border: `4px solid ${CREAM}`, boxShadow: `0 6px 16px color-mix(in srgb, ${stage.color} 33%, transparent)`,
      position: "relative", zIndex: 1, flexShrink: 0,
    }}>
      {i + 1}
    </div>
  );
}

function JourneySection() {
  const isMobile = useIsMobile(860);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: CREAM }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <Reveal>
          <SectionHeading align="center" eyebrow="The screening journey" title="Six stages from onboarding to research output" maxWidth={620} />
        </Reveal>

        <div style={{ position: "relative" }}>
          {/* The dashed line the steps hang off */}
          <div aria-hidden="true" style={{
            position: "absolute", top: 26, bottom: 26,
            left: isMobile ? 25 : "50%", marginLeft: isMobile ? 0 : -1,
            borderLeft: `2.5px dashed rgba(60,40,20,0.18)`,
          }} />

          {JOURNEY.map((stage, i) => {
            const left = i % 2 === 0;
            if (isMobile) {
              return (
                <Reveal key={stage.title} style={{ display: "flex", gap: 18, marginBottom: i === JOURNEY.length - 1 ? 0 : 26 }}>
                  <StageMarker stage={stage} i={i} />
                  <div style={{ flex: 1 }}><StageCard stage={stage} i={i} /></div>
                </Reveal>
              );
            }
            return (
              <Reveal key={stage.title} style={{
                display: "grid", gridTemplateColumns: "1fr 90px 1fr", alignItems: "center",
                marginBottom: i === JOURNEY.length - 1 ? 0 : 34,
              }}>
                <div>{left && <StageCard stage={stage} i={i} />}</div>
                <div style={{ display: "flex", justifyContent: "center" }}><StageMarker stage={stage} i={i} /></div>
                <div>{!left && <StageCard stage={stage} i={i} />}</div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---- What each role sees: reinforces the tiered access rule --------------
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
  const isMobile = useIsMobile(860);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1150, margin: "auto" }}>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Access by role"
            title="Everyone sees exactly what they need — and nothing more"
            lead="Access to screening results is tiered by professional role. Educators receive a single overall screening score to guide referral, while domain-level interpretation is reserved for qualified psychologists."
            maxWidth={760}
          />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 22 }}>
          {ROLE_ACCESS.map((r, i) => (
            <Reveal key={r.role} delay={i * 0.12}>
              <div className="soft-card" style={{ height: "100%", padding: isMobile ? "30px 26px" : "36px 32px", borderRadius: 28, background: r.bg }}>
                <span style={{
                  display: "inline-block", padding: "5px 14px", borderRadius: 999,
                  background: COLORS.white, color: r.color, fontSize: 11.5, fontWeight: 800,
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
                }}>
                  {r.tier}
                </span>
                <h3 style={{ fontFamily: FONTS.heading, fontSize: 21, fontWeight: 800, color: COLORS.ink, marginBottom: 18 }}>{r.role}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {r.sees.map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, color: COLORS.inkMid, marginBottom: 12, lineHeight: 1.55 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", background: COLORS.white,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                      }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                          <path d="M1 4l2.5 2.5L9 1" stroke={r.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Built for South African classrooms ----------------------------------
const FEATURES = [
  { title: "Works offline", color: COLORS.teal, desc: "Screening sessions run without connectivity. Data is stored locally on the device and synced automatically once a connection is restored." },
  { title: "Three languages", color: COLORS.pink, desc: "Every instruction, lesson plan and training video is available in English, Afrikaans and isiXhosa — administered in the child's home language." },
  { title: "POPIA compliant", color: COLORS.purple, desc: "Child data is anonymised at capture. Research and analytics only ever access aggregated datasets, governed by HPCSA-aligned ethical standards." },
];

function FeaturesSection() {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: CREAM }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <Reveal>
          <SectionHeading align="center" eyebrow="Designed for the context" title="Built for South African classrooms" />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 36 : 48 }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.12} style={{ textAlign: "center" }}>
              <PuzzlePiece size={58} color={f.color} fillOpacity={1} rotate={[-10, 8, -4][i % 3]} style={{ margin: "0 auto 18px", display: "block" }} />
              <h3 style={{ fontFamily: FONTS.heading, fontSize: 21, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 320, margin: "0 auto" }}>{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks({ onNavigateToLogin, onNavigate }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to HowItWorks"));

  return (
    <div style={{ fontFamily: FONTS.body }}>
      <style>{`${PUBLIC_FONT_IMPORT}${WARM_PAGE_CSS}`}</style>
      <Navbar site="pb" current="pb-how" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
      <PageHero
        eyebrow="
        
        "
        title="How it"
        highlight="works"
        lead="From registration to research — a step-by-step walkthrough of the full screening process."
      />
      <JourneySection />
      <RoleAccessSection />
      <FeaturesSection />
      <CallToAction />
      <Footer site="pb" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}