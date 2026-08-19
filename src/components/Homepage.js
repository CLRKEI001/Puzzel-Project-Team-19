import React, { useState, useEffect } from "react";
import {
  COLORS, FONT_IMPORT, PuzzlePiece, PuzzlePhoto, SectionHeading, Navbar, Footer, CallToAction,
  piecePath, gridEdges, useInView, PIECE_BODY, PIECE_PAD, PIECE_VIEWBOX,
} from "./SiteChrome";

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

const BODY_PX = 148;                                    // rendered size of one piece body
const SCALE = BODY_PX / PIECE_BODY;
const PAD_PX = PIECE_PAD * SCALE;                       // room the tabs need
const SVG_PX = (PIECE_BODY + PIECE_PAD * 2) * SCALE;

function DomainPuzzle() {
  const [hovered, setHovered] = useState(null);
  const active = DOMAINS.find(d => d.key === hovered);

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
                zIndex: isHovered ? 10 : 1,
              }}
            >
              <div style={{
  position: "relative",
  width: "100%",
  height: "100%",
  transition: "transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease",
  transform: isHovered
    ? "translateY(-12px) scale(1.08)"
    : "translateY(0) scale(1)",
  opacity: hovered && !isHovered ? 0.4 : 1,
  filter: isHovered
    ? `drop-shadow(0 14px 25px ${d.color}70)`
    : `drop-shadow(0 8px 20px ${d.color}45)`,
}}>
                <svg
  width={SVG_PX}
  height={SVG_PX}
  viewBox={PIECE_VIEWBOX}
  style={{
    position: "absolute",
    left: -PAD_PX,
    top: -PAD_PX,
    overflow: "visible",
    pointerEvents: "none",
  }}
>
                  <path d={piecePath(d.edges)} fill={d.color} />
                </svg>
                <span style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Nunito', sans-serif", fontWeight: 900,
                  fontSize: 14.5, color: COLORS.white, textAlign: "center",
                  lineHeight: 1.2, pointerEvents: "none", padding: "0 22px",
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

// Light hero — soft background, brand colours, split layout
function Hero({ onLoginClick, onNavigate }) {
  const [visible, setVisible] = useState(false);
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
        maxWidth: 1300, margin: "0 auto", padding: "72px 40px 0", width: "100%",
        position: "relative", zIndex: 1,
        display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center",
      }}>
        {/* Left — message */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 16px", borderRadius: 20,
            background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
            fontSize: 12, fontWeight: 800, color: COLORS.teal,
            letterSpacing: "0.04em", marginBottom: 26,
            ...fadeUp(0.05),
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.teal }} />
            South African NGO initiative
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
            ...fadeUp(0.25),
          }}>
            The Puzzle Project is a South African non-profit bringing structured early childhood developmental screening to every school — regardless of location or connectivity.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", ...fadeUp(0.35) }}>

            <button onClick={() => onNavigate("how")} style={{
              padding: "14px 32px", borderRadius: 12,
              background: COLORS.white, color: COLORS.ink,
              border: `1.5px solid ${COLORS.border}`, fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.teal; e.currentTarget.style.color = COLORS.teal; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.ink; }}
            >
              See how it works
            </button>
          </div>
        </div>

        {/* Right — the four-domain puzzle */}
        <div style={{ ...fadeUp(0.3) }}>
          <DomainPuzzle />
        </div>
      </div>

      {/* Impact counter strip */}
      <div style={{ maxWidth: 1300, margin: "56px auto 0", padding: "0 40px", position: "relative", zIndex: 1, ...fadeUp(0.5) }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`,
        }}>
          {[
            { value: "295+", label: "Children screened" },
            { value: "4", label: "Partner schools" },
            { value: "3", label: "Languages" },
            { value: "4", label: "Developmental domains" },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: "26px 20px", textAlign: "center",
              borderLeft: i === 0 ? "none" : `1px solid ${COLORS.border}`,
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.teal, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: COLORS.inkFaint, marginTop: 7, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
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
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
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
  return (
    <section style={{ background: COLORS.surface, padding: "90px 40px", position: "relative", overflow: "hidden" }}>
      <PuzzlePiece size={140} color={COLORS.purple} rotate={-10} style={{ position: "absolute", top: -30, left: -40 }} />
      <div style={{ maxWidth: 1300, margin: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", position: "relative" }}>
        <div>
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", minHeight: 400 }}>
          <PuzzlePhoto
            size={300}
            label="Founder photo"
            alt="Gary King, founder of The Puzzle Project"
            color={COLORS.teal}
            edges={{ top: 0, right: 1, bottom: 1, left: 0 }}
            style={{ filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.12))" }}
            /* src="/images/gary-king.jpg" */
          />
          <PuzzlePhoto
            size={185}
            label="Classroom"
            alt="Children using the Puzzle Box in a classroom"
            color={COLORS.purple}
            edges={{ top: -1, right: 0, bottom: 0, left: 0 }}
            style={{ position: "absolute", right: 8, bottom: 34, filter: "drop-shadow(0 10px 26px rgba(0,0,0,0.12))" }}
            /* src="/images/classroom.jpg" */
          />
        </div>
      </div>
    </section>
  );
}

// What we do — the three core modules
const WHAT_WE_DO = [
  { title: "Puzzle Play module", desc: "Digital lesson plans, multilingual instructional videos and training quizzes for educators to facilitate puzzle-based activities.", color: COLORS.pink },
  { title: "Screening module", desc: "The PuzzleBox Screener — structured digital assessment forms with timers, observational input and domain-based evaluation.", color: COLORS.teal },
  { title: "Research & analytics", desc: "Anonymised data dashboards and Excel export for researchers, policy makers and project sponsors.", color: COLORS.purple },
];

function WhatWeDo() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
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
  { title: "The Puzzle Box", desc: "ECD developmental screening for 5 to 6 year olds.", color: COLORS.teal },
  { title: "Puzzle Play", desc: "Nationwide puzzle development for Grades 0 to 7.", color: COLORS.pink },
  { title: "Puzzle TV", desc: "An educational TV show taking development into homes.", color: COLORS.purple },
  { title: "Puzzle App", desc: "Puzzles for all — a digital platform, everywhere.", color: COLORS.orange },
  { title: "Puzzle Production", desc: "Design, production and distribution, creating jobs through printing and recycling.", color: COLORS.maroon },
  { title: "Puzzle Data Analysis", desc: "Recording the shifts that puzzles make.", color: COLORS.teal },
];

const VISION_COLS = 3;
const VISION_ROWS = 2;

function VisionSection() {
  const [ref, inView] = useInView();

  return (
    <section style={{ padding: "90px 40px 100px", background: COLORS.white, overflow: "hidden" }}>
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
          position: "relative", width: "100%", maxWidth: 880,
          margin: "0 auto", aspectRatio: `${VISION_COLS} / ${VISION_ROWS}`,
        }}>
          {VISION_ITEMS.map((item, i) => {
            const row = Math.floor(i / VISION_COLS);
            const col = i % VISION_COLS;
            const edges = gridEdges(row, col, VISION_ROWS, VISION_COLS);

            // Each piece drifts in from its own corner of the layout
            const dx = (col - (VISION_COLS - 1) / 2) * 160;
            const dy = (row - (VISION_ROWS - 1) / 2) * 190;

            return (
              <div key={item.title}
                style={{
                  position: "absolute",
                  left: `${(col / VISION_COLS) * 100}%`,
                  top: `${(row / VISION_ROWS) * 100}%`,
                  width: `${100 / VISION_COLS}%`,
                  height: `${100 / VISION_ROWS}%`,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translate(0, 0) scale(1)" : `translate(${dx}px, ${dy}px) scale(0.82)`,
                  transition: `opacity 0.6s ease ${i * 0.09}s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.09}s`,
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
                  position: "absolute", inset: "17%",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  textAlign: "center", pointerEvents: "none",
                }}>
                  <h3 style={{
                    fontFamily: "'Nunito', sans-serif", fontWeight: 900, color: COLORS.white,
                    fontSize: "clamp(11px, 1.45vw, 18px)", lineHeight: 1.2, marginBottom: 8,
                    textShadow: "0 1px 6px rgba(0,0,0,0.25)",
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: "clamp(8.5px, 0.95vw, 12.5px)", lineHeight: 1.5,
                    color: "rgba(255,255,255,0.9)",
                    maxWidth: "65%", margin: "0 auto",
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
function TiersSection({ onNavigate }) {
  const tiers = [
    {
      label: "Tier 1",
      title: "Teachers & Primary Healthcare",
      color: COLORS.teal,
      bg: COLORS.tealLight,
      desc: "For preschool teachers and selected primary healthcare practitioners who have completed PuzzleBox Screener training. This level produces a single global screening score to support early identification and inform referral decisions.",
    },
    {
      label: "Tier 2",
      title: "Psychologists",
      color: COLORS.purple,
      bg: COLORS.purpleLight,
      desc: "Reserved for psychologists who have completed PuzzleBox Screener training. This level supports interpretation at domain and construct level, including pattern recognition across domains and informed referral decision-making.",
    },
  ];

  return (
    <section style={{ padding: "90px 40px", background: COLORS.surface, position: "relative", overflow: "hidden" }}>
      <PuzzlePiece size={110} color={COLORS.teal} rotate={-15} style={{ position: "absolute", top: 40, right: -30 }} />
      <div style={{ maxWidth: 1300, margin: "auto", position: "relative" }}>
        <SectionHeading
          eyebrow="Who can administer"
          title="A tiered system for education and clinical contexts"
          lead="The PuzzleBox Screener is designed for children aged 5 years 0 months to 6 years 11 months, with two levels of administration to support appropriate use in clinical, educational, home-based and community outreach settings."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {tiers.map(tier => (
            <div key={tier.label} style={{
              padding: "32px 30px", borderRadius: 20,
              background: COLORS.white, borderTop: `4px solid ${tier.color}`,
              border: `1px solid ${COLORS.border}`,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{
                display: "inline-block", padding: "4px 14px", borderRadius: 16,
                background: tier.bg, color: tier.color,
                fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                {tier.label}
              </span>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>{tier.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.75 }}>{tier.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <button onClick={() => onNavigate("training")} style={{
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

// Donation section — preset amounts plus custom entry
const AMOUNTS = [50, 150, 500, 1000];

function DonationSection() {
  const [selected, setSelected] = useState(150);
  const [custom, setCustom] = useState("");

  const chooseAmount = (amt) => { setSelected(amt); setCustom(""); };
  const amountToGive = custom ? Number(custom) : selected;
  const sessions = amountToGive ? Math.floor(amountToGive / 50) : 0;

  return (
    <section id="donate" style={{ padding: "90px 40px", background: COLORS.white, scrollMarginTop: 84 }}>
      <div style={{
        maxWidth: 900, margin: "auto", padding: "48px 44px", borderRadius: 24,
        background: `linear-gradient(135deg, ${COLORS.tealLight} 0%, ${COLORS.purpleLight} 100%)`,
        border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden",
      }}>
        <PuzzlePiece size={130} color={COLORS.teal} rotate={20} fillOpacity={0.18} style={{ position: "absolute", top: -30, right: -30 }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 12 }}>
            Make a difference
          </p>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 14 }}>
            Support a child's future
          </h2>
          <p style={{ fontSize: 15.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 600, marginBottom: 28 }}>
            Every donation helps us screen more children and train more educators. R50 covers one full screener session.
          </p>

          {/* Preset amounts */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            {AMOUNTS.map(amt => {
              const isActive = !custom && selected === amt;
              return (
                <button key={amt} onClick={() => chooseAmount(amt)} style={{
                  padding: "13px 28px", borderRadius: 12,
                  background: isActive ? COLORS.teal : COLORS.white,
                  color: isActive ? COLORS.white : COLORS.ink,
                  border: `1.5px solid ${isActive ? COLORS.teal : COLORS.border}`,
                  fontSize: 15, fontWeight: 800, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = COLORS.teal; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = COLORS.border; }}
                >
                  R{amt.toLocaleString("en-ZA")}
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
              style={{
                flex: 1, minWidth: 220, padding: "14px 18px", borderRadius: 12,
                border: `1.5px solid ${custom ? COLORS.teal : COLORS.border}`,
                background: COLORS.white, fontSize: 15, fontFamily: "inherit",
                color: COLORS.ink, outline: "none",
              }}
            />
            <button style={{
              padding: "14px 34px", borderRadius: 12,
              background: COLORS.teal, color: COLORS.white,
              border: "none", fontSize: 15, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
              boxShadow: "0 6px 20px rgba(0,155,141,0.25)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = COLORS.tealDark; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = COLORS.teal; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Donate now
            </button>
          </div>

          {/* Live impact of the chosen amount */}
          {sessions > 0 && (
            <p style={{ fontSize: 13.5, color: COLORS.inkMid, marginTop: 18, fontWeight: 600 }}>
              R{amountToGive.toLocaleString("en-ZA")} funds{" "}
              <strong style={{ color: COLORS.teal }}>
                {sessions} full screener session{sessions === 1 ? "" : "s"}
              </strong>.
            </p>
          )}
        </div>
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
      `}</style>
      <Navbar current="home" onNavigate={go} onLoginClick={onNavigateToLogin} />
      <Hero onLoginClick={onNavigateToLogin} onNavigate={go} />
      <Mission />
      <OurStory onNavigate={go} />
      <WhatWeDo />
      <VisionSection />
      <TiersSection onNavigate={go} />
      <DonationSection />
      <CallToAction onNavigate={go} onLoginClick={onNavigateToLogin} />
      <Footer onNavigate={go} onLoginClick={onNavigateToLogin} />
    </div>
  );
}