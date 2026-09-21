import React, { useState } from "react";
import {
  COLORS, FONT_IMPORT, PuzzlePiece, Navbar, Footer, CallToAction, CONTACT_EMAIL, useIsMobile,
} from "./SiteChrome";

// ---------------------------------------------------------------------------
// Donate (sponsor wireframe — "Donate", The Puzzle Project logo)
//
// Two donation blocks on one page:
//   • The Puzzle Box Screener — the existing preset amounts + custom amount
//     ("R50 covers one full screener session").
//   • Puzzle Play — its own set of four amounts plus a custom "R" amount, and
//     a note that sums above R25 000 can include branding (to be negotiated).
//
// PLACEHOLDER: the four Puzzle Play preset amounts were left blank on the
// wireframe — they mirror the screener presets until the sponsor confirms.
// ---------------------------------------------------------------------------

const SCREENER_AMOUNTS = [50, 150, 500, 1000];
const PLAY_AMOUNTS = [50, 150, 500, 1000];
const SCREENER_SESSION_COST = 50;   // R50 covers one full screener session
const BRANDING_THRESHOLD = 25000;   // "For sums above R25 000 branding can be included"

const fmt = (n) => `R${Number(n).toLocaleString("en-ZA")}`;

function DonationCard({ id, eyebrow, title, intro, amounts, defaultAmount, accent, sessionCost, footnote }) {
  const [selected, setSelected] = useState(defaultAmount);
  const [custom, setCustom] = useState("");
  const isMobile = useIsMobile(640);

  const chooseAmount = (amt) => { setSelected(amt); setCustom(""); };
  const amountToGive = custom ? Number(custom) : selected;
  const sessions = sessionCost && amountToGive ? Math.floor(amountToGive / sessionCost) : 0;

  return (
    <div id={id} style={{
      maxWidth: 900, margin: "0 auto",
      padding: isMobile ? "32px 24px" : "48px 44px",
      borderRadius: 24,
      background: `linear-gradient(135deg, ${COLORS.tealLight} 0%, ${COLORS.purpleLight} 100%)`,
      border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={130} color={accent} rotate={20} fillOpacity={0.18} style={{ position: "absolute", top: -30, right: -30 }} />
      <div style={{ position: "relative" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
          {eyebrow}
        </p>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 14 }}>
          {title}
        </h2>
        <p style={{ fontSize: 15.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 600, marginBottom: 28 }}>
          {intro}
        </p>

        {/* Preset amounts */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {amounts.map(amt => {
            const isActive = !custom && selected === amt;
            return (
              <button key={amt} onClick={() => chooseAmount(amt)} aria-pressed={isActive} style={{
                padding: "13px 28px", borderRadius: 12,
                background: isActive ? accent : COLORS.white,
                color: isActive ? COLORS.white : COLORS.ink,
                border: `1.5px solid ${isActive ? accent : COLORS.border}`,
                fontSize: 15, fontWeight: 800, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = accent; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = COLORS.border; }}
              >
                {fmt(amt)}
              </button>
            );
          })}
        </div>

        {/* Custom amount + donate */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="number"
            min="10"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Custom amount (R)"
            aria-label={`Custom donation amount in rand for ${title}`}
            style={{
              flex: 1, minWidth: 220, padding: "14px 18px", borderRadius: 12,
              border: `1.5px solid ${custom ? accent : COLORS.border}`,
              background: COLORS.white, fontSize: 15, fontFamily: "inherit",
              color: COLORS.ink, outline: "none",
            }}
          />
          <button style={{
            padding: "14px 34px", borderRadius: 12,
            background: accent, color: COLORS.white,
            border: "none", fontSize: 15, fontWeight: 800,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            boxShadow: `0 6px 20px ${accent}40`,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Donate now
          </button>
        </div>

        {/* Live impact of the chosen amount (screener only) */}
        {sessions > 0 && (
          <p style={{ fontSize: 13.5, color: COLORS.inkMid, marginTop: 18, fontWeight: 600 }}>
            {fmt(amountToGive)} funds{" "}
            <strong style={{ color: accent }}>
              {sessions} full screener session{sessions === 1 ? "" : "s"}
            </strong>.
          </p>
        )}

        {footnote && (
          <div style={{
            marginTop: 22, padding: "14px 18px", borderRadius: 12,
            background: "rgba(255,255,255,0.7)", border: `1px dashed ${accent}66`,
            fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.65,
          }}>
            {footnote}
          </div>
        )}
      </div>
    </div>
  );
}

function DonateHero() {
  const isMobile = useIsMobile(640);
  return (
    <section style={{
      paddingTop: 84,
      background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={150} color={COLORS.teal} rotate={-12} style={{ position: "absolute", top: 50, right: -40 }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: isMobile ? "48px 20px 40px" : "72px 40px 56px", position: "relative" }}>
        <span style={{
          display: "inline-block", padding: "7px 16px", borderRadius: 20,
          background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
          fontSize: 12, fontWeight: 800, color: COLORS.teal, marginBottom: 24,
        }}>
          Make a difference
        </span>
        <h1 style={{
          fontFamily: "'Nunito', sans-serif", fontSize: "clamp(34px, 4.4vw, 56px)",
          fontWeight: 900, color: COLORS.ink, lineHeight: 1.08,
          letterSpacing: "-0.03em", marginBottom: 20,
        }}>
          Donate
        </h1>
        <p style={{ fontSize: 17, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 680 }}>
          Choose where your donation goes — The Puzzle Box Screener or Puzzle Play — and help us reach more children across South Africa.
        </p>
      </div>
    </section>
  );
}

export default function DonatePage({ onNavigate, onNavigateToLogin }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to DonatePage"));
  const isMobile = useIsMobile(640);

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Navbar site="tpp" current="donate" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
      <DonateHero />

      <section style={{ padding: isMobile ? "40px 20px 24px" : "56px 40px 32px", background: COLORS.surface }}>
        <DonationCard
          id="donate-puzzle-box"
          eyebrow="The Puzzle Box Screener"
          title="Support a child's future"
          intro="Every donation helps us screen more children and train more educators. R50 covers one full screener session."
          amounts={SCREENER_AMOUNTS}
          defaultAmount={150}
          accent={COLORS.teal}
          sessionCost={SCREENER_SESSION_COST}
        />
      </section>

      <section style={{ padding: isMobile ? "24px 20px 56px" : "32px 40px 90px", background: COLORS.surface }}>
        <DonationCard
          id="donate-puzzle-play"
          eyebrow="Puzzle Play"
          title="Put puzzles in more classrooms"
          intro="Every donation helps us bring Puzzle Play puzzles and lesson plans to more learners and educators."
          amounts={PLAY_AMOUNTS}
          defaultAmount={150}
          accent={COLORS.pink}
          footnote={
            <>
              <strong>Corporate & major donors:</strong> for sums above {fmt(BRANDING_THRESHOLD)} branding can be included. Terms to be negotiated —{" "}
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Puzzle Play — branding partnership")}`}
                style={{ color: COLORS.pink, fontWeight: 700 }}>
                get in touch
              </a>.
            </>
          }
        />
      </section>

      <CallToAction />
      <Footer site="tpp" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}
