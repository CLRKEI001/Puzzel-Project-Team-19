import React from "react";
import {
  COLORS, FONT_IMPORT, PuzzlePiece, SectionHeading, Navbar, Footer, CallToAction, useIsMobile,
} from "./SiteChrome";
import { Hero, HOME_ANIMATION_CSS } from "./Homepage";

// ---------------------------------------------------------------------------
// The Puzzle Box — screener home page (sponsor wireframes TPB p1 + p2)
//
//   p1  Puzzle Box logo, nav "How it works · Training · Purchase · Login",
//       then the impact-stats strip (295+ / 4 / 3 / 4).
//   p2  "A tiered system for education and clinical contexts" — each tier
//       card leads to sign-up / login for that tier.
//
// `onAccess(tier, mode)` is supplied by App.js and opens the Login screen
// pre-set to that tier ("1" | "2") and mode ("register" | "login").
// ---------------------------------------------------------------------------

const TIERS = [
  {
    tier: 1,
    label: "Tier 1",
    title: "Teachers & Primary Healthcare",
    color: COLORS.teal,
    bg: COLORS.tealLight,
    desc: "For preschool teachers and selected primary healthcare practitioners who have completed The Puzzle Box Screener training. This level produces a single global screening score to support early identification and inform referral decisions.",
  },
  {
    tier: 2,
    label: "Tier 2",
    title: "Psychologists",
    color: COLORS.purple,
    bg: COLORS.purpleLight,
    desc: "Reserved for psychologists who have completed The Puzzle Box Screener training. This level supports interpretation at domain and construct level, including pattern recognition across domains and informed referral decision-making.",
  },
];

function TiersSection({ onNavigate, onAccess }) {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "90px 40px", background: COLORS.surface, position: "relative", overflow: "hidden" }}>
      {!isMobile && (
        <PuzzlePiece size={110} color={COLORS.teal} rotate={-15} style={{ position: "absolute", top: 40, right: -30 }} />
      )}
      <div style={{ maxWidth: 1300, margin: "auto", position: "relative" }}>
        <SectionHeading
          eyebrow="Who can administer"
          title="A tiered system for education and clinical contexts"
          lead="The Puzzle Box Screener is designed for children aged 5 years 0 months to 6 years 11 months, with two levels of administration to support appropriate use in clinical, educational, home-based and community outreach settings."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {TIERS.map(t => (
            <div key={t.label} style={{
              padding: "32px 30px", borderRadius: 20,
              background: COLORS.white, borderTop: `4px solid ${t.color}`,
              border: `1px solid ${COLORS.border}`,
              display: "flex", flexDirection: "column",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{
                alignSelf: "flex-start",
                display: "inline-block", padding: "4px 14px", borderRadius: 16,
                background: t.bg, color: t.color,
                fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                {t.label}
              </span>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>{t.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.75, marginBottom: 24, flex: 1 }}>{t.desc}</p>

              {/* Sponsor feedback: each tier card is the entry point to sign-up / login */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => onAccess(t.tier, "register")} style={{
                  padding: "12px 24px", borderRadius: 11, background: t.color, color: COLORS.white,
                  border: `1.5px solid ${t.color}`, fontSize: 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                  aria-label={`Sign up as ${t.title} (${t.label})`}
                >
                  Sign up
                </button>
                <button onClick={() => onAccess(t.tier, "login")} style={{
                  padding: "12px 24px", borderRadius: 11, background: COLORS.white, color: t.color,
                  border: `1.5px solid ${t.color}`, fontSize: 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.bg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = COLORS.white; }}
                  aria-label={`Log in as ${t.title} (${t.label})`}
                >
                  Log in
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <button onClick={() => onNavigate("pb-training")} style={{
            padding: "13px 28px", borderRadius: 12,
            background: COLORS.teal, color: COLORS.white,
            border: "none", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.tealDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.teal; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            View training requirements
          </button>
        </div>
      </div>
    </section>
  );
}

export default function PuzzleBoxHome({ onNavigate, onNavigateToLogin, onAccess }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to PuzzleBoxHome"));
  const access = onAccess || ((tier, mode) => onNavigateToLogin && onNavigateToLogin({ tier, mode }));

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        ${HOME_ANIMATION_CSS}
      `}</style>
      <Navbar site="pb" current="pb-home" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
      <Hero
        badge="The Puzzle Box Screener"
        lead="A structured, play-based developmental screener for children aged 5 to 6 years — administered by trained teachers, primary healthcare practitioners and psychologists, regardless of location or connectivity."
        actions={[{ label: "See how it works", onClick: () => go("pb-how") }]}
      />
      <TiersSection onNavigate={go} onAccess={access} />
      <CallToAction />
      <Footer site="pb" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}
