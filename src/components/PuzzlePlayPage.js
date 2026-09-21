import React from "react";
import {
  COLORS, FONT_IMPORT, PuzzlePiece, PuzzlePhoto, SectionHeading, Navbar, Footer, CallToAction,
  CONTACT_EMAIL, useIsMobile,
} from "./SiteChrome";

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
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Navbar site="pp" current={current} onNavigate={go} onLoginClick={() => login()} />
      {children(go)}
      <CallToAction />
      <Footer site="pp" onNavigate={go} onLoginClick={() => login()} />
    </div>
  );
}

function PlayHero({ badge, title, lead, children, accent = COLORS.pink }) {
  const isMobile = useIsMobile(640);
  return (
    <section style={{
      paddingTop: 84,
      background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={150} color={accent} rotate={12} style={{ position: "absolute", top: 50, right: -40 }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: isMobile ? "48px 20px 40px" : "72px 40px 56px", position: "relative" }}>
        <span style={{
          display: "inline-block", padding: "7px 16px", borderRadius: 20,
          background: COLORS.pinkLight, border: "1px solid rgba(232,23,93,0.25)",
          fontSize: 12, fontWeight: 800, color: COLORS.pink, marginBottom: 24,
        }}>
          {badge}
        </span>
        <h1 style={{
          fontFamily: "'Nunito', sans-serif", fontSize: "clamp(34px, 4.4vw, 56px)",
          fontWeight: 900, color: COLORS.ink, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 20,
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 17, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 700 }}>{lead}</p>
        {children}
      </div>
    </section>
  );
}

// "Full text to be confirmed" marker used where the wireframe says TBC
function TbcNote({ children }) {
  return (
    <div style={{
      marginTop: 24, padding: "12px 16px", borderRadius: 12, display: "inline-block",
      background: COLORS.orangeLight, border: "1px dashed rgba(242,101,34,0.5)",
      fontSize: 13, color: COLORS.inkMid, lineHeight: 1.6,
    }}>
      <strong style={{ color: COLORS.orange }}>To be confirmed · </strong>{children}
    </div>
  );
}

function PuzzleGrid({ onEnquire }) {
  const isMobile = useIsMobile(640);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: isMobile ? 18 : 24 }}>
      {PLAY_PUZZLES.map((pz, i) => (
        <div key={pz.key} style={{
          padding: "24px 22px", borderRadius: 20, background: COLORS.white,
          border: `1px solid ${COLORS.border}`, borderTop: `4px solid ${pz.color}`,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            {/* Image slot — add `src` once the puzzle artwork is ready */}
            <PuzzlePhoto
              size={150}
              label="Image TBC"
              alt={`${pz.name} puzzle`}
              color={pz.color}
              edges={{ top: 0, right: i % 2 === 0 ? 1 : -1, bottom: 1, left: 0 }}
            />
          </div>
          <span style={{
            alignSelf: "flex-start", padding: "3px 12px", borderRadius: 14, marginBottom: 10,
            background: `${pz.color}1F`, color: pz.color,
            fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Term {pz.term}
          </span>
          <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 900, color: COLORS.ink, marginBottom: 6 }}>{pz.name}</h3>
          <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.65, marginBottom: 18, flex: 1 }}>
            {pz.pieces} piece puzzle + lesson plan
          </p>
          {onEnquire && (
            <button onClick={() => onEnquire(pz)} style={{
              padding: "11px 20px", borderRadius: 10, background: pz.color, color: COLORS.white,
              border: "none", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}>
              Enquire to purchase
            </button>
          )}
        </div>
      ))}
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
            badge="Puzzle Play"
            title="Puzzle Play"
            lead="Nationwide puzzle development for Grades 0 to 7 — digital lesson plans, multilingual instructional videos and training quizzes that help educators run puzzle-based activities in the classroom."
          >
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 32 }}>
              <button onClick={() => go("pp-how")} style={{
                padding: "14px 32px", borderRadius: 12, background: COLORS.white, color: COLORS.ink,
                border: `1.5px solid ${COLORS.border}`, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>
                See how it works
              </button>
              <button onClick={() => go("pp-purchase")} style={{
                padding: "14px 32px", borderRadius: 12, background: COLORS.pink, color: COLORS.white,
                border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>
                Purchase
              </button>
            </div>
            <TbcNote>The full Puzzle Play introduction is still being written.</TbcNote>
          </PlayHero>

          <section style={{ padding: isMobile ? "56px 20px" : "90px 40px", background: COLORS.white }}>
            <div style={{ maxWidth: 1300, margin: "0 auto" }}>
              <SectionHeading
                eyebrow="Four terms, four puzzles"
                title="A new puzzle and lesson plan every term"
                lead="Each term brings a new puzzle — a little bigger each time — with a lesson plan to go with it."
              />
              <PuzzleGrid />
            </div>
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
            badge="Platform overview"
            title="How Puzzle Play works"
            lead="From choosing the puzzle to seeing your learners' progress."
          >
            <TbcNote>This outline is a draft — the full description is still to be provided.</TbcNote>
          </PlayHero>
          <section style={{ padding: isMobile ? "56px 20px" : "90px 40px", background: COLORS.white }}>
            <div style={{ maxWidth: 1300, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {steps.map(st => (
                <div key={st.n} style={{ padding: "26px 24px", borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderTop: `4px solid ${st.color}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: st.color, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: "'Nunito', sans-serif", marginBottom: 14 }}>{st.n}</div>
                  <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>{st.title}</h3>
                  <p style={{ fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.65 }}>{st.desc}</p>
                </div>
              ))}
            </div>
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
            badge="Purchase"
            title="Purchase"
            lead="One puzzle and lesson plan for each school term."
          />
          <section style={{ padding: isMobile ? "48px 20px 64px" : "72px 40px 96px", background: COLORS.surface }}>
            <div style={{ maxWidth: 1300, margin: "0 auto" }}>
              <PuzzleGrid onEnquire={enquire} />
              <p style={{ fontSize: 12.5, color: COLORS.inkFaint, marginTop: 24, lineHeight: 1.6 }}>
                There is no online checkout yet — purchase requests are handled by email. Prices to be confirmed.
              </p>
            </div>
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
            badge="Login"
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
              <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>
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