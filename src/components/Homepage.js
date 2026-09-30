import React, { useState, useEffect } from "react";
import {
  COLORS, ON_DARK, FONTS, PUBLIC_FONT_IMPORT, CREAM, WARM_YELLOW, Reveal, PuzzlePiece, PuzzlePhoto, SectionHeading, Navbar, Footer, CallToAction, piecePath, gridEdges, useInView, useIsMobile, PIECE_BODY, PIECE_PAD, PIECE_VIEWBOX,
} from "./SiteChrome";
// Hero footage lives in src/lib so webpack bundles it.
// hero-puzzle.mp4 = desktop (1280x960), hero-puzzle-mobile.mp4 = phones (720x540, ~3 MB)
import heroVideo from "../hero-puzzle.mp4";
import heroVideoMobile from "../hero-puzzle-mobile.mp4";
import heroPoster from "../hero-poster.jpg";
// Stills taken from the session footage, used as photos down the page
import momentClassroom from "../moment-classroom.jpg";

// NOTE — site structure (sponsor feedback, Aug 2026)
// This file is now the home page of THE PUZZLE PROJECT (the organisation).
// The screener-specific parts that used to live here moved to their own
// pages:  the "who can administer" tiers → PuzzleBoxHome.js,  the donation
// form → DonatePage.js.  `Hero` (with the impact-stats strip) and the
// assemble/float animation CSS are exported so The Puzzle Box home page can
// reuse them with its own copy.

// The four developmental domains the screener measures, rendered as a real
// 2x2 jigsaw: each piece's tabs slot into the neighbouring piece's sockets.
// Pieces slide in from four directions on load, then float gently.
// Hovering a piece lifts it out of the puzzle and reveals its description.
//
// row/col place the piece in the grid; `edges` describe its four sides, where
// 1 = tab (knob), -1 = blank (socket), 0 = flat outer border. Tabs and blanks
// are mirrored between neighbours so the pieces genuinely fit together.
const DOMAINS = [
  {
    key: "cognitive", label: "Cognitive", color: COLORS.teal,
    row: 0, col: 0, edges: { top: 0, right: 1, bottom: 1, left: 0 },
    from: "translate(-70px, -70px)",
    desc: "Thinking, attention, planning, memory and early number concepts.",
  },
  {
    key: "language", label: "Language", color: COLORS.pink,
    row: 0, col: 1, edges: { top: 0, right: 0, bottom: 1, left: -1 },
    from: "translate(70px, -70px)",
    desc: "Understanding spoken instructions and using language accurately.",
  },
  {
    key: "finemotor", label: "Fine Motor", color: COLORS.orange,
    row: 1, col: 0, edges: { top: -1, right: 1, bottom: 0, left: 0 },
    from: "translate(-70px, 70px)",
    desc: "Hand-eye coordination, pencil control and motor planning.",
  },
  {
    key: "social", label: "Social & Emotional", color: COLORS.purple,
    row: 1, col: 1, edges: { top: -1, right: 0, bottom: 0, left: -1 },
    from: "translate(70px, 70px)",
    desc: "Understanding feelings, getting along with peers, making fair choices.",
  },
];

function DomainPuzzle() {
  const [hovered, setHovered] = useState(null);
  const active = DOMAINS.find(d => d.key === hovered);
  const isMobile = useIsMobile(480);

  // Rendered size of one piece body — shrinks on narrow phones so the
  // 2x2 grid (BODY_PX * 2 wide) never forces horizontal scroll.
  const BODY_PX = isMobile ? 108 : 148;
  const SCALE = BODY_PX / PIECE_BODY;
  const PAD_PX = PIECE_PAD * SCALE;                       // room the tabs need
  const SVG_PX = (PIECE_BODY + PIECE_PAD * 2) * SCALE;
  const labelSize = isMobile ? 12 : 14.5;

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 440, margin: "0 auto" }}>
      {/* The assembled jigsaw. Pieces are absolutely positioned so their tabs
          overlap into the neighbouring sockets rather than sitting in a grid. */}
      <div style={{
        position: "relative", width: BODY_PX * 2, height: BODY_PX * 2,
        margin: "0 auto", overflow: "visible",
      }}>
        {DOMAINS.map((d, i) => {
          const isHovered = hovered === d.key;
          return (
            <div key={d.key}
              className="domain-piece"
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                "--from": d.from,
                animationDelay: `${0.25 + i * 0.18}s, ${1.6 + i * 0.6}s`,
                position: "absolute",
                left: d.col * BODY_PX, top: d.row * BODY_PX,
                width: BODY_PX, height: BODY_PX,
                cursor: "pointer",
                zIndex: isHovered ? 5 : 1,
              }}
            >
              <div style={{
                position: "relative", width: "100%", height: "100%",
                transition: "transform 0.25s ease, opacity 0.25s ease",
                transform: isHovered ? "translateY(-10px) scale(1.05)" : "none",
                opacity: hovered && !isHovered ? 0.45 : 1,
              }}>
                <svg
                  width={SVG_PX} height={SVG_PX} viewBox={PIECE_VIEWBOX}
                  style={{
                    position: "absolute", left: -PAD_PX, top: -PAD_PX,
                    overflow: "visible", pointerEvents: "none",
                    filter: `drop-shadow(0 8px 20px ${d.color}45)`,
                  }}
                >
                  <path d={piecePath(d.edges)} fill={d.color} />
                </svg>
                <span style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: FONTS.heading, fontWeight: 900,
                  fontSize: labelSize, color: ON_DARK, textAlign: "center",
                  lineHeight: 1.2, pointerEvents: "none", padding: isMobile ? "0 14px" : "0 22px",
                  textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                }}>
                  {d.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Description panel — swaps as you hover each piece */}
      <div style={{
        marginTop: 20, minHeight: 78, padding: "16px 20px",
        borderRadius: 14, textAlign: "center", background: COLORS.white,
        border: `1px solid ${active ? active.color + "55" : COLORS.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        transition: "border-color 0.25s ease",
      }}>
        {active ? (
          <>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: active.color, marginBottom: 5 }}>
              {active.label} development
            </p>
            <p style={{ fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.6 }}>{active.desc}</p>
          </>
        ) : (
          <p style={{ fontSize: 13, color: COLORS.inkFaint, lineHeight: 1.6, paddingTop: 12 }}>
            One screener. Four developmental domains.<br />Hover a piece to explore.
          </p>
        )}
      </div>
    </div>
  );
}

// Animation CSS shared by every page that shows the four-domain puzzle
export const HOME_ANIMATION_CSS = `
  @keyframes assemble {
    from { opacity: 0; transform: var(--from) scale(0.8); }
    to { opacity: 1; transform: translate(0, 0) scale(1); }
  }
  @keyframes gentle-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }
  .domain-piece {
    opacity: 0;
    animation: assemble 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards,
               gentle-float 5s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .domain-piece { animation: none; opacity: 1; }
  }
`;

const TPP_HERO = {
  badge: "South African NGO initiative",
  lead: "The Puzzle Project is a South African non-profit bringing structured early childhood developmental screening to every school — regardless of location or connectivity.",
};

// Light hero — soft background, brand colours, split layout.
// `badge` / `lead` / `actions` let The Puzzle Box home page reuse it with its own copy.
// actions: [{ label, onClick, primary? }]
export function Hero({ badge = TPP_HERO.badge, lead = TPP_HERO.lead, actions = [] }) {
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile(860);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 120); return () => clearTimeout(t); }, []);

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `all 0.6s ease ${delay}s`,
  });

  return (
    <section style={{
      paddingTop: 84,
      background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Soft colour washes */}
      <div style={{ position: "absolute", top: -120, right: -80, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,155,141,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -140, left: -100, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(107,47,138,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        maxWidth: 1300, margin: "0 auto",
        padding: isMobile ? "44px 20px 0" : "72px 40px 0",
        width: "100%",
        position: "relative", zIndex: 1,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
        gap: isMobile ? 40 : 56, alignItems: "center",
      }}>
        {/* Left — message */}
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 16px", borderRadius: 20,
            background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
            fontSize: 12, fontWeight: 800, color: COLORS.teal,
            letterSpacing: "0.04em", marginBottom: 26,
            ...fadeUp(0.05),
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.teal }} />
            {badge}
          </div>

          <h1 style={{
            fontFamily: FONTS.heading,
            fontSize: "clamp(34px, 4.4vw, 58px)",
            fontWeight: 900, color: COLORS.ink,
            lineHeight: 1.08, letterSpacing: "-0.03em",
            marginBottom: 22, ...fadeUp(0.15),
          }}>
            No child left behind —<br />
            <span style={{ color: COLORS.teal }}>early screening,</span> every school.
          </h1>

          <p style={{
            fontSize: "clamp(15px, 1.7vw, 18px)",
            color: COLORS.inkMid,
            maxWidth: 520, lineHeight: 1.75, marginBottom: 34,
            marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0,
            ...fadeUp(0.25),
          }}>
            {lead}
          </p>

          <div style={{
            display: "flex", gap: 14, flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-start",
            ...fadeUp(0.35),
          }}>
            {actions.map(a => (
              <button key={a.label} onClick={a.onClick} style={{
                padding: "14px 32px", borderRadius: 12,
                background: a.primary ? COLORS.teal : COLORS.white,
                color: a.primary ? COLORS.white : COLORS.ink,
                border: a.primary ? "none" : `1.5px solid ${COLORS.border}`,
                fontSize: 15, fontWeight: a.primary ? 800 : 700,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              }}
                onMouseEnter={e => {
                  if (a.primary) { e.currentTarget.style.background = COLORS.tealDark; }
                  else { e.currentTarget.style.borderColor = COLORS.teal; e.currentTarget.style.color = COLORS.teal; }
                }}
                onMouseLeave={e => {
                  if (a.primary) { e.currentTarget.style.background = COLORS.teal; }
                  else { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.ink; }
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right — the four-domain puzzle (kept for The Puzzle Box home page) */}
        <div style={{ ...fadeUp(0.3) }}>
          <DomainPuzzle />
        </div>
      </div>

      {/* Impact counter strip — 4-across on desktop, 2x2 grid on mobile */}
      <div style={{
        maxWidth: 1300, margin: isMobile ? "36px auto 0" : "56px auto 0",
        padding: isMobile ? "0 20px" : "0 40px",
        position: "relative", zIndex: 1, ...fadeUp(0.5),
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(160px, 1fr))",
          borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`,
        }}>
          {[
            { value: "295+", label: "Children screened" },
            { value: "4", label: "Partner schools" },
            { value: "3", label: "Languages" },
            { value: "4", label: "Developmental domains" },
          ].map((s, i) => {
            const cols = isMobile ? 2 : 4;
            const isFirstInRow = i % cols === 0;
            const isSecondRowOrLater = isMobile && i >= cols;
            return (
              <div key={s.label} style={{
                padding: isMobile ? "20px 14px" : "26px 20px", textAlign: "center",
                borderLeft: isFirstInRow ? "none" : `1px solid ${COLORS.border}`,
                borderTop: isSecondRowOrLater ? `1px solid ${COLORS.border}` : "none",
              }}>
                <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: COLORS.teal, fontFamily: FONTS.heading, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: COLORS.inkFaint, marginTop: 7, fontWeight: 600 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// THE PUZZLE PROJECT HOME PAGE (reworked, Sep 2026)
// Goal: feel human, not corporate. Real footage and photos from sessions,
// warm cream backgrounds, softer shapes, and sections that ease in as you
// scroll. Content and navigation targets are unchanged from the sponsor
// wireframes; only the layout and feel changed.
// ===========================================================================

// ---- 1. Hero: full-bleed footage, centred message ------------------------
export function VideoHero({ actions = [] }) {
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile(860);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
    return () => clearTimeout(t);
  }, []);

  const rise = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  return (
    <section style={{
      position: "relative", minHeight: "100svh", width: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", background: "#1d1a17",
    }}>
      <video
        ref={videoRef}
        key={isMobile ? "mobile" : "desktop"}
        src={isMobile ? heroVideoMobile : heroVideo}
        poster={heroPoster}
        preload="auto"
        autoPlay muted loop playsInline
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.04)" }}
      />

      {/* Even shade across the frame so centred text reads anywhere */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(20,14,8,0.55) 0%, rgba(20,14,8,0.35) 55%, rgba(20,14,8,0.6) 100%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1, width: "100%", maxWidth: 980,
        padding: isMobile ? "130px 22px 90px" : "150px 40px 110px",
        textAlign: "center", color: ON_DARK,
      }}>
        <p style={{
          fontFamily: FONTS.heading, fontSize: 12, fontWeight: 800,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: WARM_YELLOW, marginBottom: 16, ...rise(0.1),
        }}>
          One piece at a time
        </p>

        <h1 style={{
          fontFamily: FONTS.heading, fontWeight: 900,
          fontSize: "clamp(38px, 6.4vw, 84px)", lineHeight: 1.04,
          letterSpacing: "-0.03em", marginBottom: 22,
          textShadow: "0 2px 24px rgba(0,0,0,0.35)", ...rise(0.2),
        }}>
          Every child deserves<br />to be{" "}
          <span style={{ position: "relative", whiteSpace: "nowrap" }}>
            seen.
            <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"
              style={{ position: "absolute", left: 0, bottom: "-0.12em", width: "100%", height: "0.3em", overflow: "visible" }}>
              <path d="M3 13 C 40 4, 90 18, 130 9 S 185 6, 197 11"
                fill="none" stroke={WARM_YELLOW} strokeWidth="5" strokeLinecap="round" className="scribble" />
            </svg>
          </span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 1.6vw, 19px)", lineHeight: 1.7, maxWidth: 580,
          margin: "0 auto 32px", color: "rgba(255,255,255,0.9)", ...rise(0.35),
        }}>
          We're a South African non-profit using puzzles to spot developmental needs early,
          in every school, in every language, whether or not there's signal.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", ...rise(0.5) }}>
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick} className={a.primary ? "hero-btn hero-btn--primary" : "hero-btn"}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden="true" className="scroll-cue" style={{
        position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)",
        width: 26, height: 42, borderRadius: 14, border: "2px solid rgba(255,255,255,0.7)",
        zIndex: 1, ...rise(0.9),
      }}>
        <span style={{ position: "absolute", top: 8, left: "50%", width: 4, height: 8, marginLeft: -2, borderRadius: 2, background: ON_DARK }} />
      </div>
    </section>
  );
}

export const VIDEO_HERO_CSS = `
  @keyframes draw-scribble { from { stroke-dashoffset: 260; } to { stroke-dashoffset: 0; } }
  .scribble { stroke-dasharray: 260; stroke-dashoffset: 260; animation: draw-scribble 0.9s ease 0.9s forwards; }
  @keyframes cue { 0% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(12px); } }
  .scroll-cue span { animation: cue 1.8s ease-in-out infinite; }
  .hero-btn {
    padding: 14px 30px; border-radius: 999px; font-family: inherit; font-size: 15px;
    font-weight: 800; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    background: rgba(255,255,255,0.12); color: #fff; border: 1.5px solid rgba(255,255,255,0.7);
    backdrop-filter: blur(6px);
  }
  .hero-btn:hover { background: #fff; color: #1d1a17; transform: translateY(-2px) rotate(-1deg); }
  .hero-btn--primary { background: ${WARM_YELLOW}; color: #1d1a17; border-color: ${WARM_YELLOW}; }
  .hero-btn--primary:hover { background: #fff; border-color: #fff; }
  .snapshot { transition: transform 0.35s ease; }
  .snapshot:hover { transform: rotate(0deg) translateY(-6px) scale(1.02) !important; }
  .soft-card { transition: transform 0.25s ease; }
  .soft-card:hover { transform: translateY(-6px); }
  @media (prefers-reduced-motion: reduce) {
    .scribble { animation: none; stroke-dashoffset: 0; }
    .scroll-cue span { animation: none; }
    .hero-btn:hover, .snapshot:hover, .soft-card:hover { transform: none !important; }
  }
`;

// ---- 2. Why we exist: plain-language statement ----------------------------

function WhyWeExist() {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ background: CREAM, padding: isMobile ? "70px 22px" : "110px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 18 }}>
            Why we exist
          </p>
          <h2 style={{
            fontFamily: FONTS.heading, fontWeight: 800, color: COLORS.ink,
            fontSize: "clamp(24px, 3.4vw, 42px)", lineHeight: 1.25, letterSpacing: "-0.02em",
            maxWidth: 860, margin: "0 auto",
          }}>
            Too often, a child's developmental needs are only noticed once they're already
            struggling at school. We want to catch them early, with something{" "}
            <span style={{ color: COLORS.teal }}>every child already loves.</span>
          </h2>
        </Reveal>

      </div>
    </section>
  );
}

// ---- 3. What guides us: three pillars, no boxes --------------------------
const PILLARS = [
  { n: "01", title: "Identify early", color: COLORS.teal, desc: "Catch developmental concerns before they become barriers to learning, using structured evidence-based screening tools." },
  { n: "02", title: "Reach every child", color: COLORS.pink, desc: "Multilingual and designed to work in low-connectivity environments across all nine provinces." },
  { n: "03", title: "Protect with ethics", color: COLORS.purple, desc: "All child data is anonymised, POPIA-compliant and governed by strict ethical standards aligned with HPCSA guidelines." },
];

function Pillars() {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ background: COLORS.white, padding: isMobile ? "64px 22px" : "100px 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <SectionHeading align="center" eyebrow="What guides us" title="Three things we won't compromise on" />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 36 : 48 }}>
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12} style={{ textAlign: isMobile ? "center" : "left" }}>
              <span style={{ fontFamily: FONTS.heading, fontWeight: 900, fontSize: 44, color: p.color, lineHeight: 1, display: "block", marginBottom: 12 }}>
                {p.n}
              </span>
              <h3 style={{ fontFamily: FONTS.heading, fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.75 }}>{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- 4. Our story: told like a story -------------------------------------
function OurStory({ onNavigate }) {
  const isMobile = useIsMobile(860);
  return (
    <section style={{ background: CREAM, padding: isMobile ? "70px 22px" : "110px 40px", overflow: "hidden" }}>
      <div style={{
        maxWidth: 1150, margin: "0 auto", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 44 : 72, alignItems: "center",
      }}>
        {/* Photos first on desktop so the story reads beside them */}
        <Reveal style={{ position: "relative", minHeight: isMobile ? 280 : 420, order: isMobile ? 2 : 1 }}>
          <PuzzlePhoto
            size={isMobile ? 230 : 330}
            src={momentClassroom}
            alt="Children holding up a puzzle during a Puzzle Play session"
            edges={{ top: 0, right: 1, bottom: 1, left: 0 }}
            style={{ filter: "drop-shadow(0 16px 36px rgba(60,40,20,0.18))", display: "block", margin: isMobile ? "0 auto" : 0 }}
          />
          <PuzzlePhoto
            size={isMobile ? 130 : 190}
            label="Founder photo"
            alt="Gary King, founder of The Puzzle Project"
            color={COLORS.purple}
            edges={{ top: -1, right: 0, bottom: 0, left: -1 }}
            style={{ position: "absolute", right: isMobile ? 0 : 10, bottom: isMobile ? -10 : 0, filter: "drop-shadow(0 10px 26px rgba(60,40,20,0.16))" }}
            /* src="/images/gary-king.jpg" once the founder photo is ready */
          />
        </Reveal>

        <Reveal delay={0.1} style={{ order: isMobile ? 1 : 2, textAlign: isMobile ? "center" : "left" }}>
          <p style={{ color: COLORS.teal, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 14, fontSize: 12 }}>
            How it started
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(28px, 3.4vw, 44px)", color: COLORS.ink, lineHeight: 1.12, marginBottom: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
            "What if puzzles could make a difference?"
          </h2>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.85, marginBottom: 16, fontSize: 16 }}>
            For Gary King, the question arrived while producing a film in the rural Eastern Cape, where he saw
            the challenges facing young children growing up with limited access to educational and developmental resources.
          </p>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.85, marginBottom: 28, fontSize: 16 }}>
            That question became The Puzzle Project. Gary brought together psychologists, educators, researchers
            and community partners to build a scientifically rigorous, culturally responsive screening tool made for South African children.
          </p>
          <button onClick={() => onNavigate("about")} className="hero-btn" style={{ background: COLORS.ink, borderColor: COLORS.ink }}>
            Read our story
          </button>
        </Reveal>
      </div>
    </section>
  );
}

// ---- 5. What we do: soft tinted cards ------------------------------------
// COLORS.pinkLight/tealLight/purpleLight (var(--pink-lt) etc.) are pastel
// tints that stay pale on purpose in dark mode too — that's fine for a small
// badge, but as a big card background it turns into a glaring light patch
// with near-invisible text (COLORS.ink flips light in dark mode). cardTint()
// mixes the accent colour toward COLORS.white instead of a literal white, so
// it lands on the same soft pastel in light mode but a muted dark tone in
// dark mode — letting the existing theme-aware ink text stay legible either way.
const cardTint = (color) => `color-mix(in srgb, ${color} 10%, ${COLORS.white})`;

const WHAT_WE_DO = [
  { title: "Puzzle Play", desc: "Lesson plans, multilingual videos and training quizzes so educators can run puzzle-based activities in class.", color: COLORS.pink, bg: cardTint(COLORS.pink), page: "pp-home", cta: "Explore Puzzle Play" },
  { title: "The Puzzle Box", desc: "Our screener: structured assessments with timers, observation notes and results across four developmental domains.", color: COLORS.teal, bg: cardTint(COLORS.teal), page: "pb-home", cta: "Explore The Puzzle Box" },
  { title: "Research and insight", desc: "Anonymised dashboards and exports for researchers, policy makers and project sponsors.", color: COLORS.purple, bg: cardTint(COLORS.purple) },
];

function WhatWeDo({ onNavigate }) {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ background: COLORS.white, padding: isMobile ? "64px 22px" : "100px 40px" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <Reveal>
          <SectionHeading align="center" eyebrow="What we do" title="Play, screening and research, all connected" maxWidth={640} />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 22 }}>
          {WHAT_WE_DO.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <div className="soft-card" style={{
                height: "100%", padding: isMobile ? "30px 26px" : "38px 32px", borderRadius: 28,
                background: item.bg, display: "flex", flexDirection: "column",
              }}>
                <PuzzlePiece size={46} color={item.color} fillOpacity={1} rotate={-8} style={{ marginBottom: 20 }} />
                <h3 style={{ fontFamily: FONTS.heading, fontSize: 22, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.7, flex: 1 }}>{item.desc}</p>
                {item.page && (
                  <button onClick={() => onNavigate(item.page)} style={{
                    marginTop: 22, alignSelf: "flex-start", background: "none", border: "none", padding: 0,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 800, color: item.color,
                  }}>
                    {item.cta} →
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- 6. The Puzzle Project Vision, built as one interlocking jigsaw ----------
// Six pieces in a 3x2 grid, each carrying one strand of the wider project.
// The pieces are laid out as percentages so the whole puzzle scales with the
// container, and they fly in from their own side of the page and lock together
// when the section scrolls into view.
//
// Only The Puzzle Box is live. The other pieces are flagged `inDevelopment`:
// they use a lighter tint of their colour, dark text, and show an
// "In Development" tooltip on hover.

// Pastel tint of a theme colour. The theme colours are CSS variables, so the
// mixing is done by the browser with color-mix. amount 0 = original, 1 = white.
// Mixes toward COLORS.white (var(--white)) rather than a literal "white" —
// in light mode --white is #fff so this looks identical to before, but in
// dark mode --white is a dark navy, so these pieces come out as a muted dark
// tone instead of a glaring pale patch, and the title/desc text on top (which
// already reads its colour from the theme-aware COLORS.ink) stays legible in
// both themes instead of going near-invisible.
const lighten = (color, amount = 0.5) =>
  `color-mix(in srgb, ${color} ${Math.round((1 - amount) * 100)}%, ${COLORS.white})`;

const VISION_ITEMS = [
  { title: "The Puzzle Box", desc: "ECD developmental screening\nfor 5 to 6 year olds.", color: COLORS.teal, page: "pb-home", row: 0, col: 0, edges: { top: 0, right: 1, bottom: 1, left: 0 } },
   {title: "Puzzle Play", desc: "Nationwide puzzle development\nfor Grades 0 to 7.", color: COLORS.pink, page: "pp-home", row: 0, col: 1, edges: { top: 0, right: 1, bottom: 1, left: -1 } },
  { title: "Puzzle TV", desc: "An educational TV show\ntaking development into\nhomes.", color: lighten(COLORS.purple), inDevelopment: true, row: 0, col: 2, edges: { top: 0, right: 0, bottom: 1, left: -1 } },
  { title: "Puzzle App", desc: "Puzzles for all — a digital\nplatform, everywhere.", color: lighten(COLORS.orange), inDevelopment: true, row: 1, col: 0, edges: { top: -1, right: 1, bottom: 0, left: 0 } },
  { title: "Puzzle Production", desc: "Design, production and\ndistribution, creating jobs\nthrough printing and recycling.", color: lighten(COLORS.maroon), inDevelopment: true, row: 1, col: 1, edges: { top: -1, right: 1, bottom: 0, left: -1 } },
  { title: "Puzzle Data Analysis", desc: "Recording the shifts that\npuzzles make.", color: lighten(COLORS.teal), inDevelopment: true, row: 1, col: 2, edges: { top: -1, right: 0, bottom: 0, left: -1 } },
];

const VISION_COLS = 3;
const VISION_ROWS = 2;

function VisionSection({ onNavigate }) {
  const [ref, inView] = useInView();
  const [devHover, setDevHover] = useState(null);
  // Below this width the 3x2 layout leaves each piece too narrow to read
  // comfortably, so we transpose to a taller 2x3 grid instead.
  const isMobile = useIsMobile(640);
  const cols = isMobile ? 2 : VISION_COLS;
  const rows = isMobile ? 3 : VISION_ROWS;

  return (
    <section style={{ padding: isMobile ? "56px 20px 60px" : "90px 40px 100px", background: COLORS.white, overflow: "hidden" }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          align="center"
          eyebrow="The bigger picture"
          title="The Puzzle Project Vision"
          lead="Puzzles are going to help change the lives of all the people of our continent. The Puzzle Box is just one piece of a much larger project."
          maxWidth={620}
        />

        {/* The assembled jigsaw */}
        <div ref={ref} style={{
          position: "relative", width: "100%", maxWidth: 1100,
          margin: "0 auto", aspectRatio: isMobile ? `${cols} / ${rows}` : "1.6 / 1",
          padding: isMobile ? "0" : "0 18px",
        }}>
          {VISION_ITEMS.map((item, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const edges = gridEdges(row, col, rows, cols);

            // Each piece drifts in from its own corner of the layout
            const dx = (col - (cols - 1) / 2) * (isMobile ? 70 : 160);
            const dy = (row - (rows - 1) / 2) * (isMobile ? 90 : 190);

            return (
              <div key={item.title}
                onMouseEnter={item.inDevelopment ? () => setDevHover(item.title) : undefined}
                onMouseLeave={item.inDevelopment ? () => setDevHover(null) : undefined}
                onClick={item.page ? () => onNavigate(item.page) : item.inDevelopment ? () => setDevHover(devHover === item.title ? null : item.title) : undefined}
                onKeyDown={item.page ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigate(item.page); } } : undefined}
                role={item.page ? "link" : undefined}
                tabIndex={item.page ? 0 : undefined}
                aria-label={item.page ? `Go to ${item.title}` : undefined}
                style={{
                  cursor: item.page ? "pointer" : "default",
                  position: "absolute",
                  left: `${(col / cols) * 100}%`,
                  top: `${(row / rows) * 100}%`,
                  width: `${100 / cols}%`,
                  height: `${100 / rows}%`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translate(0, 0) scale(1)" : `translate(${dx}px, ${dy}px) scale(0.82)`,
                  transition: `opacity 0.6s ease ${i * 0.09}s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.09}s`,
                  padding: isMobile ? "0" : "0 6px",
                }}
              >
                {/* The piece itself, overflowing its cell so tabs reach into neighbours */}
                <svg
                  viewBox={PIECE_VIEWBOX} preserveAspectRatio="none"
                  style={{
                    position: "absolute", left: "-28%", top: "-28%",
                    width: "156%", height: "156%", overflow: "visible",
                  }}
                >
                  <path d={piecePath(edges)} style={{ fill: item.color }} fillOpacity={item.inDevelopment ? 0.7 : 1} />
                </svg>

                {/* Label, inset so it clears the knobs and sockets */}
                <div style={{
                  position: "absolute",
                  inset: isMobile ? "18% 8% 18% 8%" : "20% 10% 18% 10%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  pointerEvents: "none",
                  maxWidth: "86%",
                  margin: "0 auto",
                }}>
                  <h3 style={{
                    fontFamily: FONTS.heading,
                    fontWeight: 900,
                    color: item.inDevelopment ? COLORS.ink : ON_DARK,
                    fontSize: isMobile ? "clamp(12px, 2vw, 18px)" : "clamp(14px, 1.3vw, 22px)",
                    lineHeight: 1.15,
                    marginBottom: isMobile ? 4 : 6,
                    textShadow: item.inDevelopment ? "none" : "0 1px 6px rgba(0,0,0,0.25)",
                    maxWidth: "82%",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: isMobile ? "clamp(8px, 1.4vw, 11px)" : "clamp(9.5px, 0.82vw, 12.5px)",
                    lineHeight: 1.35,
                    color: item.inDevelopment ? COLORS.inkMid : "rgba(255,255,255,0.92)",
                    maxWidth: "82%",
                    margin: 0,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}>
                    {item.desc}
                  </p>
                </div>

                {item.inDevelopment && devHover === item.title && (
                  <div role="tooltip" style={{
                    position: "absolute", left: "50%", top: isMobile ? "8%" : "10%",
                    transform: "translateX(-50%)", zIndex: 5, pointerEvents: "none",
                    background: COLORS.dark, color: "#fff", fontFamily: FONTS.heading,
                    fontSize: 12, fontWeight: 800, letterSpacing: 0.3, whiteSpace: "nowrap",
                    padding: "6px 12px", borderRadius: 999, boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                  }}>
                    In Development
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
// ---- 7. Support: warm, personal ask --------------------------------------
function SupportBand({ onNavigate }) {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ background: CREAM, padding: isMobile ? "64px 22px" : "100px 40px" }}>
      <Reveal>
        <div style={{
          maxWidth: 820, margin: "0 auto", borderRadius: 32, background: COLORS.white,
          boxShadow: "0 20px 50px rgba(60,40,20,0.10)", position: "relative", overflow: "hidden",
        }}>
          <PuzzlePiece size={120} color={COLORS.pink} rotate={-14} style={{ position: "absolute", top: -34, right: -30 }} />
          <PuzzlePiece size={90} color={COLORS.teal} rotate={18} style={{ position: "absolute", bottom: -30, left: -24 }} />
          <div style={{ padding: isMobile ? "40px 26px" : "60px 56px", textAlign: "center", position: "relative" }}>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.pink, marginBottom: 12 }}>
              Make a difference
            </p>
            <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 14 }}>
              Help a child get seen sooner
            </h2>
            <p style={{ fontSize: 16, color: COLORS.inkMid, lineHeight: 1.75, marginBottom: 26, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              Your donation goes towards The Puzzle Box Screener and Puzzle Play, reaching more children and training more educators.
            </p>
            <button onClick={() => onNavigate("donate")} className="hero-btn hero-btn--primary">
              Donate
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Homepage({ onNavigateToLogin, onNavigate }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to Homepage"));

  return (
    <div style={{ fontFamily: FONTS.body }}>
      <style>{`
        ${PUBLIC_FONT_IMPORT}
        ${HOME_ANIMATION_CSS}
        ${VIDEO_HERO_CSS}
      `}</style>
      <Navbar site="tpp" current="home" overlay onNavigate={go} onLoginClick={onNavigateToLogin} />
      <VideoHero actions={[
        { label: "Explore The Puzzle Box", primary: true, onClick: () => go("pb-home") },
        { label: "Explore Puzzle Play", onClick: () => go("pp-home") },
      ]} />
      <WhyWeExist />
      <Pillars />
      <OurStory onNavigate={go} />
      <VisionSection onNavigate={go} />
      <WhatWeDo onNavigate={go} />
      <SupportBand onNavigate={go} />
      <CallToAction />
      <Footer site="tpp" onNavigate={go} onLoginClick={onNavigateToLogin} />
    </div>
  );
}