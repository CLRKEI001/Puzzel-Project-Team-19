import React from "react";
import {
  COLORS, FONTS, PUBLIC_FONT_IMPORT, PuzzlePiece, SectionHeading, piecePath, gridEdges, Navbar, Footer, CallToAction, CONTACT_EMAIL, useIsMobile,
} from "../shared/SiteChrome";
import Doodle from "../shared/Doodle";
// Bundled from src/ (compressed to ~3 MB), so webpack serves it with the build
import puzzlePlayVideo from "../../assets/puzzleplay_video.mp4";

// ---------------------------------------------------------------------------
// Puzzle Play — the second product site (sponsor wireframes PPlay p1, PP p2,
// PP p3). Navigation: How it works · Purchase · Login.
//
//   PuzzlePlayHome      PPlay p1  logo + nav, introductory text (marked TBC)
//   PuzzlePlayHow       linked from the nav; no wireframe yet → draft outline
//   PuzzlePlayPurchase  PP p2     four termly puzzles + lesson plans
//   PuzzlePlayLogin     PP p3     record results against the CAPS curriculum
//                                 and see graphic results — "to be developed"
// ---------------------------------------------------------------------------

// One puzzle + lesson plan per school term (PP p2). Image slots are "TBC".
export const PLAY_PUZZLES = [
  { key: "shapes",     term: 1, name: "Shapes",     pieces: 4,  color: COLORS.teal },
  { key: "soccer",     term: 2, name: "Soccer",     pieces: 12, color: COLORS.pink },
  { key: "farm",       term: 3, name: "Farm",       pieces: 24, color: COLORS.orange },
  { key: "underwater", term: 4, name: "Underwater", pieces: 30, color: COLORS.purple },
];

// Shared page frame for the Puzzle Play site
function PlayShell({ current, onNavigate, onNavigateToLogin, children }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to a Puzzle Play page"));
  const login = onNavigateToLogin || (() => go("pp-login"));
  return (
    <div style={{ fontFamily: FONTS.body }}>
      <style>{PUBLIC_FONT_IMPORT}</style>
      <Navbar site="pp" current={current} onNavigate={go} onLoginClick={() => login()} />
      {children(go)}
      <CallToAction />
      <Footer site="pp" onNavigate={go} onLoginClick={() => login()} />
    </div>
  );
}

// Consistent page container — every section lines up on the same left edge
function Wrap({ children, style = {} }) {
  const isMobile = useIsMobile(640);
  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: isMobile ? "0 22px" : "0 40px", ...style }}>
      {children}
    </div>
  );
}

// The four termly puzzles, snapped together as one 2 x 2 jigsaw
function PuzzleCluster({ size = 400 }) {
  const rows = 2, cols = 2;
  return (
    <svg viewBox="-28 -28 256 256" width={size} height={size} role="img"
      aria-label="Four puzzle pieces — Shapes, Soccer, Farm and Underwater"
      className="pp-cluster" style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}>
      {PLAY_PUZZLES.map((pz, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        return (
          <g key={pz.key} transform={`translate(${c * 100} ${r * 100})`}>
           <g className="pp-piece" style={{ animationDelay: `${i * 0.12}s` }}>
            <path d={piecePath(gridEdges(r, c, rows, cols))} fill={pz.color}
              stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
            <text x="50" y="44" textAnchor="middle" fill="#fff" fillOpacity="0.8"
              style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONTS.body }}>
              Term {pz.term}
            </text>
            <text x="50" y="62" textAnchor="middle" fill="#fff"
              style={{ fontSize: 15, fontWeight: 900, fontFamily: FONTS.heading }}>
              {pz.name}
            </text>
           </g>
          </g>
        );
      })}
    </svg>
  );
}

// COLORS are CSS variables, so mix them with transparency instead of appending hex alpha
const tint = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

const PLAY_CSS = `
  @keyframes pp-pop { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-8px) rotate(-3deg); } }
  .pp-cluster { filter: drop-shadow(0 22px 34px rgba(110,30,60,.22)); animation: pp-float 7s ease-in-out infinite; }
  .pp-piece { opacity: 0; animation: pp-pop .7s ease forwards; transform-box: fill-box; }
  .pp-btn { transition: transform .18s ease, box-shadow .18s ease; }
  .pp-btn:hover { transform: translateY(-2px); }
  .pp-card { transition: transform .25s ease, box-shadow .25s ease; }
  .pp-card:hover { transform: translateY(-6px); box-shadow: 0 22px 44px rgba(60,20,40,.13) !important; }
  @media (prefers-reduced-motion: reduce) { .pp-cluster, .pp-piece { animation: none; opacity: 1; } .pp-btn:hover, .pp-card:hover { transform: none; } }
`;

// Hero used by every Puzzle Play page. Pass `art` for the split layout with the
// puzzle cluster (home); without it the hero is a compact centred header.

function PlayHero({ title, lead, children, eyebrow, art, accent = COLORS.pink }) {
  const isMobile = useIsMobile(860);
  const split = !!art && !isMobile;
  return (
    <section style={{
      paddingTop: 120, position: "relative", overflow: "hidden",
      background: `radial-gradient(900px 420px at 88% 0%, rgba(232,23,93,0.10), transparent 60%),
                   radial-gradient(700px 380px at 0% 100%, rgba(26,148,128,0.10), transparent 60%),
                   linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
    }}>
      <style>{PLAY_CSS}</style>
      <PuzzlePiece size={90} color={COLORS.teal} rotate={-14} fillOpacity={0.12} style={{ position: "absolute", bottom: 20, left: "44%" }} />
      <PuzzlePiece size={70} color={COLORS.orange} rotate={22} fillOpacity={0.14} style={{ position: "absolute", top: 150, right: "4%" }} />
      <Wrap style={{ position: "relative" }}>
        <div style={{
          display: "grid", gridTemplateColumns: split ? "1.1fr 0.9fr" : "1fr",
          alignItems: "center", gap: split ? 40 : 28,
          padding: isMobile ? "28px 0 56px" : (art ? "40px 0 88px" : "40px 0 72px"),
          textAlign: !art && !isMobile ? "left" : "left",
        }}>
          <div>
            {eyebrow && (
              <p style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: COLORS.maroon, marginBottom: 18 }}>
                {eyebrow}
              </p>
            )}
            <h1 style={{
              fontFamily: FONTS.heading, fontSize: art ? "clamp(44px, 6.2vw, 84px)" : "clamp(36px, 4.6vw, 60px)",
              fontWeight: 900, color: COLORS.ink, lineHeight: 1.02, letterSpacing: "-0.035em", marginBottom: 22,
            }}>
              {title}
            </h1>
            <p style={{ fontSize: art ? 19 : 17.5, color: COLORS.inkMid, lineHeight: 1.7, maxWidth: 560 }}>{lead}</p>
            {children}
          </div>
          {art && (
            <div style={{ display: "flex", justifyContent: "center", padding: isMobile ? "10px 0 0" : "0 20px 0 0" }}>
              {art}
            </div>
          )}
        </div>
      </Wrap>
    </section>
  );
}

// Quiet "to be confirmed" note (the sponsor's copy is still being written)
function TbcNote({ children }) {
  return (
    <p style={{ marginTop: 26, fontSize: 13, color: COLORS.inkFaint, lineHeight: 1.6, fontStyle: "italic" }}>
      <span style={{ color: COLORS.orange, fontWeight: 800, fontStyle: "normal" }}>To be confirmed · </span>{children}
    </p>
  );
}

function PuzzleGrid({ onEnquire }) {
  const isMobile = useIsMobile(640);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: isMobile ? 18 : 26 }}>
      {PLAY_PUZZLES.map((pz, i) => (
        <div key={pz.key} className="pp-card" style={{
          borderRadius: 24, background: COLORS.white, overflow: "hidden",
          border: `1px solid ${COLORS.border}`, boxShadow: "0 4px 22px rgba(60,20,40,0.06)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            background: `linear-gradient(160deg, ${tint(pz.color, 22)}, ${tint(pz.color, 6)})`,
            padding: "26px 0 18px", display: "flex", justifyContent: "center",
          }}>
            <svg viewBox="-28 -28 156 156" width={150} height={150} role="img" aria-label={`${pz.name} puzzle, ${pz.pieces} pieces`}
              style={{ overflow: "visible", transform: `rotate(${i % 2 ? 6 : -6}deg)`, filter: `drop-shadow(0 10px 16px ${tint(pz.color, 35)})` }}>
              <path d={piecePath({ top: -1, right: 1, bottom: 1, left: i % 2 ? 1 : -1 })} fill={pz.color} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
              <text x="50" y="58" textAnchor="middle" fill="#fff" style={{ fontSize: 40, fontWeight: 900, fontFamily: FONTS.heading }}>{pz.pieces}</text>
              <text x="50" y="76" textAnchor="middle" fill="#fff" fillOpacity="0.85"
                style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", fontFamily: FONTS.body }}>PIECES</text>
            </svg>
          </div>
          <div style={{ padding: "22px 24px 26px", display: "flex", flexDirection: "column", flex: 1 }}>
            <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: pz.color, marginBottom: 6 }}>
              Term {pz.term}
            </p>
            <h3 style={{ fontFamily: FONTS.heading, fontSize: 24, fontWeight: 900, color: COLORS.ink, letterSpacing: "-0.02em", marginBottom: 8 }}>{pz.name}</h3>
            <p style={{ fontSize: 14.5, color: COLORS.inkMid, lineHeight: 1.65, marginBottom: onEnquire ? 20 : 0, flex: 1 }}>
              {pz.pieces}-piece puzzle with its own lesson plan
            </p>
            {onEnquire && (
              <button className="pp-btn" onClick={() => onEnquire(pz)} style={{
                padding: "12px 20px", borderRadius: 12, background: pz.color, color: "#fff",
                border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>
                Enquire to purchase
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const PLAY_FEATURES = [
  { icon: "books", color: COLORS.teal,   title: "Digital lesson plans", desc: "A ready-to-use plan for every puzzle, built for the classroom." },
  { icon: "video", color: COLORS.pink,   title: "Multilingual videos",  desc: "Instructional videos that show educators how to run each activity." },
  { icon: "tick", color: COLORS.purple, title: "Training quizzes",     desc: "Short quizzes that help educators feel confident before they start." },
];


function PuzzlePlayVideo() {
  const isMobile = useIsMobile(860);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      {/* Decorative pink shape behind video */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: isMobile ? 100 : 140,
          height: isMobile ? 100 : 140,
          borderRadius: "50%",
          background: tint(COLORS.pink, 18),
          top: -18,
          right: -18,
          zIndex: 0,
        }}
      />

      {/* Decorative teal shape */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: isMobile ? 75 : 100,
          height: isMobile ? 75 : 100,
          borderRadius: "50%",
          background: tint(COLORS.teal, 18),
          bottom: -16,
          left: -16,
          zIndex: 0,
        }}
      />

      {/* Video card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,

          overflow: "hidden",

          borderRadius: 24,

          background: COLORS.white,

          border: `1px solid ${COLORS.border}`,

          boxShadow:
            "0 24px 55px rgba(60,20,40,0.16)",

          padding: 7,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Puzzle Play in action"
          style={{
            display: "block",
            width: "100%",

            aspectRatio: "16 / 10",

            objectFit: "cover",

            borderRadius: 18,

            background: COLORS.surface,
          }}
        >
          <source
            src={puzzlePlayVideo}
            type="video/mp4"
          />

          Your browser does not support video playback.
        </video>
      </div>

      {/* Small label */}
      <div
        style={{
          position: "absolute",
          zIndex: 2,

          left: isMobile ? 14 : 22,
          bottom: isMobile ? 14 : 20,

          display: "inline-flex",
          alignItems: "center",
          gap: 7,

          padding: "7px 12px",

          borderRadius: 999,

          background: "rgba(255,255,255,0.90)",

          boxShadow:
            "0 4px 14px rgba(0,0,0,0.10)",

          fontFamily: FONTS.heading,
          fontSize: 10,
          fontWeight: 800,

          color: COLORS.ink,

          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: COLORS.pink,
          }}
        />

        Puzzle Play in action
      </div>
    </div>
  );
}
// ---- PPlay p1 — home --------------------------------------------------------
export function PuzzlePlayHome(props) {
  const isMobile = useIsMobile(640);
  return (
    <PlayShell current="pp-home" {...props}>
      {(go) => (
        <>
          <PlayHero
            eyebrow="Grades 0 to 7 · Nationwide"
            title="Puzzle Play"
            lead="Nationwide puzzle development for Grades 0 to 7 — digital lesson plans, multilingual instructional videos and training quizzes that help educators run puzzle-based activities in the classroom."
            art={<PuzzlePlayVideo />}
          >
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 34 }}>
              <button className="pp-btn" onClick={() => go("pp-purchase")} style={{
                padding: "15px 34px", borderRadius: 14, background: COLORS.pink, color: "#fff",
                border: "none", fontSize: 15.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 10px 24px rgba(232,23,93,0.28)",
              }}>
                Purchase
              </button>
              <button className="pp-btn" onClick={() => go("pp-how")} style={{
                padding: "15px 34px", borderRadius: 14, background: "transparent", color: COLORS.ink,
                border: `1.5px solid ${COLORS.ink}`, fontSize: 15.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>
                See how it works
              </button>
            </div>
            <TbcNote>The full Puzzle Play introduction is still being written.</TbcNote>
          </PlayHero>

          <section style={{ padding: isMobile ? "56px 0" : "88px 0 40px", background: COLORS.white }}>
            <Wrap>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: isMobile ? 24 : 40 }}>
                {PLAY_FEATURES.map(f => (
                  <div key={f.title} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                      background: tint(f.color, 14), display: "flex", alignItems: "center", justifyContent: "center",
                    }}><Doodle name={f.icon} size={34} /></div>
                    <div>
                      <h3 style={{ fontFamily: FONTS.heading, fontSize: 17, fontWeight: 900, color: COLORS.ink, marginBottom: 4 }}>{f.title}</h3>
                      <p style={{ fontSize: 14.5, color: COLORS.inkMid, lineHeight: 1.65 }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Wrap>
          </section>

          <section style={{ padding: isMobile ? "40px 0 64px" : "64px 0 104px", background: COLORS.white }}>
            <Wrap>
              <SectionHeading
                eyebrow="Four terms, four puzzles"
                title="A new puzzle and lesson plan every term"
                lead="Each term brings a new puzzle — a little bigger each time — with a lesson plan to go with it."
              />
              <PuzzleGrid />
            </Wrap>
          </section>
        </>
      )}
    </PlayShell>
  );
}

// ---- How it works (draft outline; no wireframe yet) -------------------------
export function PuzzlePlayHow(props) {
  const isMobile = useIsMobile(640);
  const steps = [
    { n: "1", color: COLORS.teal, title: "Choose the term's puzzle", desc: "Each term has its own puzzle and lesson plan — Shapes, Soccer, Farm and Underwater — with more pieces as the year goes on." },
    { n: "2", color: COLORS.pink, title: "Run the lesson plan", desc: "Educators follow the lesson plan to facilitate the puzzle activity with their class." },
    { n: "3", color: COLORS.purple, title: "Record and see results", desc: "Log in to record each learner's results against the CAPS curriculum and view them as graphs. (Being developed.)" },
  ];
  return (
    <PlayShell current="pp-how" {...props}>
      {() => (
        <>
          <PlayHero
            title="How Puzzle Play works"
            lead="From choosing the puzzle to seeing your learners' progress."
          >
            <TbcNote>This outline is a draft — the full description is still to be provided.</TbcNote>
          </PlayHero>
          <section style={{ padding: isMobile ? "56px 0" : "90px 0", background: COLORS.white }}>
            <Wrap style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 22 }}>
              {steps.map(st => (
                <div key={st.n} style={{ padding: "26px 24px", borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderTop: `4px solid ${st.color}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: st.color, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: FONTS.heading, marginBottom: 14 }}>{st.n}</div>
                  <h3 style={{ fontFamily: FONTS.heading, fontSize: 16, fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>{st.title}</h3>
                  <p style={{ fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.65 }}>{st.desc}</p>
                </div>
              ))}
            </Wrap>
          </section>
        </>
      )}
    </PlayShell>
  );
}

// ---- PP p2 — purchase -------------------------------------------------------
export function PuzzlePlayPurchase(props) {
  const isMobile = useIsMobile(640);
  const enquire = (pz) => {
    const subject = `Puzzle Play — ${pz.name} (Term ${pz.term})`;
    const body = `Hello,\n\nI would like to purchase the Puzzle Play ${pz.name} puzzle (${pz.pieces} piece puzzle + lesson plan, Term ${pz.term}).\n\nName:\nSchool / organisation:\nQuantity:\nContact number:\n`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <PlayShell current="pp-purchase" {...props}>
      {() => (
        <>
          <PlayHero
            title="Purchase"
            lead="One puzzle and lesson plan for each school term."
          />
          <section style={{ padding: isMobile ? "48px 0 64px" : "72px 0 96px", background: COLORS.surface }}>
            <Wrap>
              <PuzzleGrid onEnquire={enquire} />
              <p style={{ fontSize: 12.5, color: COLORS.inkFaint, marginTop: 24, lineHeight: 1.6 }}>
                There is no online checkout yet — purchase requests are handled by email. Prices to be confirmed.
              </p>
            </Wrap>
          </section>
        </>
      )}
    </PlayShell>
  );
}

// ---- PP p3 — login (to be developed) ---------------------------------------
export function PuzzlePlayLogin(props) {
  const isMobile = useIsMobile(640);
  return (
    <PlayShell current="pp-login" {...props}>
      {(go) => (
        <>
          <PlayHero
            title="Puzzle Play login"
            lead="A place to record the results of individual learners based on the CAPS curriculum, and to see those results as graphs."
          />
          <section style={{ padding: isMobile ? "48px 20px 72px" : "72px 40px 110px", background: COLORS.surface }}>
            <div style={{
              maxWidth: 640, margin: "0 auto", textAlign: "center",
              padding: isMobile ? "36px 24px" : "52px 48px", borderRadius: 24,
              background: COLORS.white, border: `1px solid ${COLORS.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}>
              <span style={{
                display: "inline-block", padding: "5px 16px", borderRadius: 16, marginBottom: 18,
                background: COLORS.orangeLight, color: COLORS.orange,
                fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
              }}>
                To be developed
              </span>
              <h2 style={{ fontFamily: FONTS.heading, fontSize: 26, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>
                Coming soon
              </h2>
              <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.75, marginBottom: 28 }}>
                Puzzle Play login isn't available yet. When it is, you'll be able to capture each learner's results against the CAPS curriculum and get graphic results.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => go("pp-home")} style={{
                  padding: "13px 28px", borderRadius: 12, background: COLORS.pink, color: COLORS.white,
                  border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                }}>
                  Back to Puzzle Play
                </button>
                <button onClick={() => go("pp-purchase")} style={{
                  padding: "13px 28px", borderRadius: 12, background: COLORS.white, color: COLORS.pink,
                  border: `1.5px solid ${COLORS.pink}`, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                }}>
                  Purchase
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </PlayShell>
  );
}