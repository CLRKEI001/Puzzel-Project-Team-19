import React, { useState } from "react";
import {
  COLORS, FONTS, PUBLIC_FONT_IMPORT, WARM_PAGE_CSS, CREAM,
  PageHero, Reveal, PuzzlePiece, piecePath, gridEdges, useInView,
  Navbar, Footer, CallToAction, CONTACT_EMAIL, useIsMobile,
} from "../shared/SiteChrome";
// Media sits directly in src/, two folders up from this file
import puzzleDrawing from "../../assets/puzzle-drawing.jpg";   // WIP Puzzle Play drawing from the project brief
import donateClip from "../../assets/donate-clip.mp4";   // children assembling the finished version

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
      maxWidth: 900, margin: "0 auto", scrollMarginTop: 140,
      padding: isMobile ? "32px 24px" : "48px 44px",
      borderRadius: 28,
      background: COLORS.white,
      boxShadow: "0 18px 46px rgba(60,40,20,0.08)",
      borderTop: `6px solid ${accent}`,
      border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={130} color={accent} rotate={20} fillOpacity={0.18} style={{ position: "absolute", top: -30, right: -30 }} />
      <div style={{ position: "relative" }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
          {eyebrow}
        </p>
        <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 14 }}>
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
            boxShadow: `0 6px 20px color-mix(in srgb, ${accent} 25%, transparent)`,
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
            background: "color-mix(in srgb, var(--white) 70%, transparent)", border: `1px dashed color-mix(in srgb, ${accent} 40%, transparent)`,
            fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.65,
          }}>
            {footnote}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- The assembling puzzle ----------------------------------------------
// The black and white Puzzle Play drawing from the brief, cut into a 5 x 4
// jigsaw with the same piece shapes used across the site. Pieces start
// scattered and click into place when the section scrolls into view.
const ROWS = 4;
const COLS = 5;
const PIECES = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = Math.floor(i / COLS);
  const col = i % COLS;
  // Deterministic "random" scatter so it looks the same every visit
  const r = (n) => { const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
  return {
    row, col,
    d: piecePath(gridEdges(row, col, ROWS, COLS)),
    // pushed out from the centre, then jittered, like a tipped-out box
    dx: (col - 2) * 60 + (r(1) - 0.5) * 150,
    dy: (row - 1.5) * 60 + (r(2) - 0.5) * 120,
    rot: (r(3) - 0.5) * 80,
    delay: r(4) * 0.5 + i * 0.03,
  };
});

function AssemblingPuzzle() {
  const [ref, inView] = useInView({ threshold: 0.35 });
  const [scattered, setScattered] = React.useState(false);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const together = reduced || (inView && !scattered);

  // "Mix it up": scatter, then put it back together
  const replay = () => {
    setScattered(true);
    setTimeout(() => setScattered(false), 900);
  };

  return (
    <div ref={ref}>
      <svg viewBox="-40 -40 580 480" role="img"
        aria-label="A black and white drawing of a home and vegetable garden, cut into puzzle pieces that fit together"
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
        <defs>
          {PIECES.map(p => (
            <clipPath key={`c${p.row}${p.col}`} id={`donate-piece-${p.row}-${p.col}`}>
              <path d={p.d} />
            </clipPath>
          ))}
        </defs>
        {PIECES.map(p => (
          <g key={`${p.row}-${p.col}`} transform={`translate(${p.col * 100} ${p.row * 100})`}>
            <g style={{
              transformBox: "fill-box", transformOrigin: "center",
              transform: together ? "translate(0px, 0px) rotate(0deg)" : `translate(${p.dx}px, ${p.dy}px) rotate(${p.rot}deg)`,
              opacity: together ? 1 : 0.9,
              transition: reduced ? "none" : `transform 0.9s cubic-bezier(.2,.9,.25,1.15) ${together ? p.delay : 0}s, opacity 0.6s ease`,
            }}>
              <g style={{ filter: together ? "none" : "drop-shadow(0 6px 8px rgba(60,40,20,0.18))" }}>
                <image href={puzzleDrawing} x={-p.col * 100} y={-p.row * 100} width="500" height="400"
                  preserveAspectRatio="xMidYMid slice" clipPath={`url(#donate-piece-${p.row}-${p.col})`} />
                <path d={p.d} fill="none" stroke="rgba(40,30,20,0.28)" strokeWidth="1.2" />
              </g>
            </g>
          </g>
        ))}
        {/* Frame the finished picture */}
        <rect x="0" y="0" width="500" height="400" fill="none" stroke="rgba(40,30,20,0.35)" strokeWidth="2"
          style={{ opacity: together ? 1 : 0, transition: "opacity 0.6s ease 1.4s" }} />
      </svg>
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <button onClick={replay} className="mix-btn">Mix it up again</button>
      </div>
    </div>
  );
}

function EveryPiece() {
  const isMobile = useIsMobile(860);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: COLORS.white, overflow: "hidden" }}>
      <div style={{
        maxWidth: 1150, margin: "auto", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
        gap: isMobile ? 40 : 70, alignItems: "center",
      }}>
        <AssemblingPuzzle />
        <Reveal style={{ textAlign: isMobile ? "center" : "left" }}>
          <p style={{ color: COLORS.teal, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 14, fontSize: 12 }}>
            Every piece counts
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(28px, 3.4vw, 44px)", color: COLORS.ink, lineHeight: 1.12, marginBottom: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Your donation is a piece of the puzzle
          </h2>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, fontSize: 16, marginBottom: 14 }}>
            This is a work-in-progress Puzzle Play puzzle: a home and vegetable garden scene
            for learning about seasons, counting and animals.
          </p>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, fontSize: 16 }}>
            Donations help us finish puzzles like this one, get them into classrooms, and screen
            more children with The Puzzle Box.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---- From drawing to classroom: the real clip -----------------------------
function InTheirHands() {
  const isMobile = useIsMobile(860);
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: CREAM }}>
      <div style={{
        maxWidth: 1150, margin: "auto", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "0.95fr 1.05fr",
        gap: isMobile ? 36 : 70, alignItems: "center",
      }}>
        <Reveal style={{ order: isMobile ? 2 : 1, textAlign: isMobile ? "center" : "left" }}>
          <p style={{ color: COLORS.pink, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 14, fontSize: 12 }}>
            From drawing to classroom
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(28px, 3.4vw, 44px)", color: COLORS.ink, lineHeight: 1.12, marginBottom: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
            And this is where it ends up
          </h2>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, fontSize: 16, marginBottom: 28 }}>
            The same garden scene, finished and in children's hands. Choose where your donation goes below.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
            <button onClick={() => jump("donate-puzzle-box")} className="jump-btn" style={{ background: COLORS.teal }}>The Puzzle Box Screener</button>
            <button onClick={() => jump("donate-puzzle-play")} className="jump-btn" style={{ background: COLORS.pink }}>Puzzle Play</button>
          </div>
        </Reveal>

        <Reveal delay={0.1} style={{ order: isMobile ? 1 : 2 }}>
          <div style={{
            borderRadius: 26, overflow: "hidden", aspectRatio: "4 / 3",
            boxShadow: "0 22px 50px rgba(60,40,20,0.16)", transform: "rotate(1.5deg)",
            border: `8px solid ${COLORS.white}`,
          }}>
            <video src={donateClip} autoPlay muted loop playsInline preload="metadata"
              aria-label="Children fitting pieces into the finished garden puzzle"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const DONATE_CSS = `
  .mix-btn { background: none; border: 1.5px dashed rgba(60,40,20,0.3); color: ${COLORS.inkMid};
    padding: 9px 18px; border-radius: 999px; cursor: pointer; font-family: inherit;
    font-size: 14px; font-weight: 700; transition: border-color 0.2s ease, color 0.2s ease; }
  .mix-btn:hover { border-color: ${COLORS.teal}; color: ${COLORS.teal}; }
  .jump-btn { color: #fff; border: none; padding: 13px 24px; border-radius: 999px; cursor: pointer;
    font-family: inherit; font-size: 14.5px; font-weight: 800; transition: transform 0.2s ease; }
  .jump-btn:hover { transform: translateY(-2px) rotate(-1deg); }
  @media (prefers-reduced-motion: reduce) { .jump-btn:hover { transform: none; } }
`;

export default function DonatePage({ onNavigate, onNavigateToLogin }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to DonatePage"));
  const isMobile = useIsMobile(640);

  return (
    <div style={{ fontFamily: FONTS.body }}>
      <style>{`${PUBLIC_FONT_IMPORT}${WARM_PAGE_CSS}${DONATE_CSS}`}</style>
      <Navbar site="tpp" current="donate" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
      <PageHero
        eyebrow="Make a difference"
        title="Be a piece of"
        highlight="the puzzle"
        lead="Choose where your donation goes, The Puzzle Box Screener or Puzzle Play, and help us reach more children across South Africa."
      />
      <EveryPiece />
      <InTheirHands />

      <section style={{ padding: isMobile ? "10px 20px 24px" : "10px 40px 32px", background: CREAM, scrollMarginTop: 130 }}>
        <Reveal>
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
        </Reveal>
      </section>

      <section style={{ padding: isMobile ? "24px 20px 64px" : "32px 40px 100px", background: CREAM }}>
        <Reveal>
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
              <strong>Corporate & major donors:</strong> for sums above {fmt(BRANDING_THRESHOLD)} branding can be included. Terms to be negotiated, so{" "}
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Puzzle Play — branding partnership")}`}
                style={{ color: COLORS.pink, fontWeight: 700 }}>
                get in touch
              </a>.
            </>
          }
        />
        </Reveal>
      </section>

      <CallToAction />
      <Footer site="tpp" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}