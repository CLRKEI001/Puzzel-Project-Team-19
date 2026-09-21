import React, { useState, useEffect } from "react";
import {
  COLORS, FONT_IMPORT, PuzzlePiece, PuzzlePhoto, SectionHeading, Navbar, Footer, CallToAction,
  piecePath, gridEdges, useInView, useIsMobile, PIECE_BODY, PIECE_PAD, PIECE_VIEWBOX,
} from "./SiteChrome";

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
                  fontFamily: "'Nunito', sans-serif", fontWeight: 900,
                  fontSize: labelSize, color: COLORS.white, textAlign: "center",
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
            fontFamily: "'Nunito', sans-serif",
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

        {/* Right — the four-domain puzzle */}
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
                <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: COLORS.teal, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: COLORS.inkFaint, marginTop: 7, fontWeight: 600 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Our mission — three pillars
const PILLARS = [
  { title: "Identify early", color: COLORS.teal, desc: "Catch developmental concerns before they become barriers to learning, using structured evidence-based screening tools." },
  { title: "Reach every child", color: COLORS.pink, desc: "Multilingual and designed to work in low-connectivity environments across all nine provinces." },
  { title: "Protect with ethics", color: COLORS.purple, desc: "All child data is anonymised, POPIA-compliant and governed by strict ethical standards aligned with HPCSA guidelines." },
];

function Mission() {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          align="center"
          eyebrow="Our mission"
          title="Three pillars that guide everything we build"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {PILLARS.map(p => (
            <div key={p.title} style={{
              padding: "32px 28px", borderRadius: 18,
              background: COLORS.surface, borderTop: `4px solid ${p.color}`,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 19, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.75 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Our story
function OurStory({ onNavigate }) {
  const isMobile = useIsMobile(860);
  return (
    <section style={{ background: COLORS.surface, padding: isMobile ? "56px 20px" : "90px 40px", position: "relative", overflow: "hidden" }}>
      {!isMobile && (
        <PuzzlePiece size={140} color={COLORS.purple} rotate={-10} style={{ position: "absolute", top: -30, left: -40 }} />
      )}
      <div style={{
        maxWidth: 1300, margin: "auto", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 40 : 64, alignItems: "center", position: "relative",
      }}>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <p style={{ color: COLORS.teal, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14, fontSize: 12 }}>
            Our story
          </p>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(26px, 3.2vw, 40px)", color: COLORS.ink, lineHeight: 1.14, marginBottom: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
            What if puzzles could make a difference?
          </h2>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, marginBottom: 16, fontSize: 15.5 }}>
            For Gary King, the question arrived while producing a film in the rural Eastern Cape, where he witnessed the challenges facing young children growing up with limited access to educational and developmental resources.
          </p>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, marginBottom: 24, fontSize: 15.5 }}>
            That question became the foundation of the Puzzle Project. Gary brought together psychologists, educators, researchers and community partners to develop a scientifically rigorous, culturally responsive screening solution designed specifically for South African children.
          </p>
          <button onClick={() => onNavigate("about")} style={{
            padding: "12px 26px", borderRadius: 11,
            background: COLORS.white, color: COLORS.teal,
            border: `1.5px solid ${COLORS.teal}`, fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.teal; e.currentTarget.style.color = COLORS.white; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.white; e.currentTarget.style.color = COLORS.teal; }}
          >
            Learn more about us
          </button>
        </div>

        {/* Photo cluster — drop real image paths into `src` when photography is ready */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          position: "relative", minHeight: isMobile ? 260 : 400,
        }}>
          <PuzzlePhoto
            size={isMobile ? 210 : 300}
            label="Founder photo"
            alt="Gary King, founder of The Puzzle Project"
            color={COLORS.teal}
            edges={{ top: 0, right: 1, bottom: 1, left: 0 }}
            style={{ filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.12))" }}
            /* src="/images/gary-king.jpg" */
          />
          <PuzzlePhoto
            size={isMobile ? 128 : 185}
            label="Classroom"
            alt="Children using the Puzzle Box in a classroom"
            color={COLORS.purple}
            edges={{ top: -1, right: 0, bottom: 0, left: 0 }}
            style={{
              position: "absolute",
              right: isMobile ? -4 : 8, bottom: isMobile ? 14 : 34,
              filter: "drop-shadow(0 10px 26px rgba(0,0,0,0.12))",
            }}
            /* src="/images/classroom.jpg" */
          />
        </div>
      </div>
    </section>
  );
}

// What we do — the three core modules
const WHAT_WE_DO = [
  { title: "Puzzle Play module", desc: "Digital lesson plans, multilingual instructional videos and training quizzes for educators to facilitate puzzle-based activities.", color: COLORS.pink, page: "pp-home" },
  { title: "Screening module", desc: "The Puzzle Box Screener — structured digital assessment forms with timers, observational input and domain-based evaluation.", color: COLORS.teal, page: "pb-home" },
  { title: "Research & analytics", desc: "Anonymised data dashboards and Excel export for researchers, policy makers and project sponsors.", color: COLORS.purple },
];

function WhatWeDo({ onNavigate }) {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "56px 20px" : "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          eyebrow="What we do"
          title="A single digital ecosystem connecting play, screening and research"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {WHAT_WE_DO.map(item => (
            <div key={item.title} style={{
              padding: "30px 26px", borderRadius: 18,
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              position: "relative", overflow: "hidden", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: item.color }} />
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.7 }}>{item.desc}</p>
              {item.page && (
                <button onClick={() => onNavigate(item.page)} style={{
                  marginTop: 16, background: "none", border: "none", padding: 0, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: item.color,
                }}>
                  Explore {item.page === "pb-home" ? "The Puzzle Box" : "Puzzle Play"} →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- The Puzzle Project Vision, built as one interlocking jigsaw ----------
// Six pieces in a 3x2 grid, each carrying one strand of the wider project.
// The pieces are laid out as percentages so the whole puzzle scales with the
// container, and they fly in from their own side of the page and lock together
// when the section scrolls into view.
const VISION_ITEMS = [
  { title: "The Puzzle Box", desc: "ECD developmental screening\nfor 5 to 6 year olds.", color: COLORS.teal, page: "pb-home", row: 0, col: 0, edges: { top: 0, right: 1, bottom: 1, left: 0 } },
  { title: "Puzzle Play", desc: "Nationwide puzzle development\nfor Grades 0 to 7.", color: COLORS.pink, page: "pp-home", row: 0, col: 1, edges: { top: 0, right: 1, bottom: 1, left: -1 } },
  { title: "Puzzle TV", desc: "An educational TV show\ntaking development into\nhomes.", color: COLORS.purple, row: 0, col: 2, edges: { top: 0, right: 0, bottom: 1, left: -1 } },
  { title: "Puzzle App", desc: "Puzzles for all — a digital\nplatform, everywhere.", color: COLORS.orange, row: 1, col: 0, edges: { top: -1, right: 1, bottom: 0, left: 0 } },
  { title: "Puzzle Production", desc: "Design, production and\ndistribution, creating jobs\nthrough printing and recycling.", color: COLORS.maroon, row: 1, col: 1, edges: { top: -1, right: 1, bottom: 0, left: -1 } },
  { title: "Puzzle Data Analysis", desc: "Recording the shifts that\npuzzles make.", color: COLORS.teal, row: 1, col: 2, edges: { top: -1, right: 0, bottom: 0, left: -1 } },
];

const VISION_COLS = 3;
const VISION_ROWS = 2;

function VisionSection({ onNavigate }) {
  const [ref, inView] = useInView();
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
                onClick={item.page ? () => onNavigate(item.page) : undefined}
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
                  <path d={piecePath(edges)} fill={item.color} />
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
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 900,
                    color: COLORS.white,
                    fontSize: isMobile ? "clamp(12px, 2vw, 18px)" : "clamp(14px, 1.3vw, 22px)",
                    lineHeight: 1.15,
                    marginBottom: isMobile ? 4 : 6,
                    textShadow: "0 1px 6px rgba(0,0,0,0.25)",
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
                    color: "rgba(255,255,255,0.92)",
                    maxWidth: "82%",
                    margin: 0,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
// Short pointer to the dedicated Donate page (the full donation form now lives
// in DonatePage.js — see the sponsor's "Donate" wireframe).
function SupportBand({ onNavigate }) {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "48px 20px" : "70px 40px", background: COLORS.surface }}>
      <div style={{
        maxWidth: 900, margin: "auto", textAlign: "center",
        padding: isMobile ? "32px 24px" : "44px 44px", borderRadius: 24,
        background: `linear-gradient(135deg, ${COLORS.tealLight} 0%, ${COLORS.purpleLight} 100%)`,
        border: `1px solid ${COLORS.border}`,
      }}>
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 12 }}>
          Make a difference
        </p>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 12 }}>
          Support a child's future
        </h2>
        <p style={{ fontSize: 15.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 24px" }}>
          Donate towards The Puzzle Box Screener or Puzzle Play and help us reach more children and train more educators.
        </p>
        <button onClick={() => onNavigate("donate")} style={{
          padding: "14px 34px", borderRadius: 12, background: COLORS.teal, color: COLORS.white,
          border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 6px 20px rgba(0,155,141,0.25)",
        }}>
          Donate
        </button>
      </div>
    </section>
  );
}

export default function Homepage({ onNavigateToLogin, onNavigate }) {
  // Falls back gracefully if a navigation handler was not supplied
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to Homepage"));

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{`
        ${FONT_IMPORT}
        ${HOME_ANIMATION_CSS}
      `}</style>
      <Navbar site="tpp" current="home" onNavigate={go} onLoginClick={onNavigateToLogin} />
      <Hero actions={[
        { label: "Explore The Puzzle Box", primary: true, onClick: () => go("pb-home") },
        { label: "Explore Puzzle Play", onClick: () => go("pp-home") },
      ]} />
      <Mission />
      <OurStory onNavigate={go} />
      <WhatWeDo onNavigate={go} />
      <VisionSection onNavigate={go} />
      <SupportBand onNavigate={go} />
      <CallToAction />
      <Footer site="tpp" onNavigate={go} onLoginClick={onNavigateToLogin} />
    </div>
  );
}
