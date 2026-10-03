import React from "react";
import {
  COLORS, FONTS, PUBLIC_FONT_IMPORT, WARM_PAGE_CSS, CREAM, WARM_YELLOW,
  PuzzlePiece, PuzzlePhoto, SectionHeading, PageHero, Reveal,
  Navbar, Footer, CallToAction, useIsMobile,
} from "./SiteChrome";
// Portrait from The Puzzle Project brief (March 2026).
// Confirm with Gary that it can be used on the public site before going live.
import gladysPortrait from "../gladys-khayalethu.jpg";

// About page, reworked to match the warmer home page: cream backgrounds,
// centred header, softer cards and sections that fade in on scroll.
// All copy is unchanged from the previous version except the page title.

// ---- Where it starts: the portrait from the project brief -----------------
function WhereItStarts() {
  const isMobile = useIsMobile(860);
  return (
    <section style={{ padding: isMobile ? "60px 22px 70px" : "90px 40px 110px", background: COLORS.white, overflow: "hidden" }}>
      <div style={{
        maxWidth: 1100, margin: "auto", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "0.85fr 1.15fr",
        gap: isMobile ? 40 : 80, alignItems: "center",
      }}>
        <Reveal>
          <figure style={{
            background: COLORS.white, padding: "14px 14px 18px", borderRadius: 10, margin: "0 auto",
            maxWidth: isMobile ? 330 : 420, transform: "rotate(-2deg)",
            boxShadow: "0 22px 50px rgba(60,40,20,0.16)", border: `1px solid ${COLORS.border}`,
          }}>
            <img src={gladysPortrait}
              alt="Nomhamha Gladys Mfundisi waving, with the hills and homes of Khayalethu behind her"
              loading="lazy"
              style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 6, display: "block" }} />
            <figcaption style={{ marginTop: 14, textAlign: "center" }}>
              <span style={{ display: "block", fontFamily: FONTS.heading, fontSize: 16, fontWeight: 800, color: COLORS.ink }}>
                Nomhamha Gladys Mfundisi
              </span>
              <span style={{ fontSize: 13.5, color: COLORS.inkMid }}>Khayalethu, Eastern Cape</span>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={0.12} style={{ textAlign: isMobile ? "center" : "left" }}>
          <p style={{ color: COLORS.teal, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 14, fontSize: 12 }}>
            Where it starts
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(28px, 3.6vw, 46px)", color: COLORS.ink, lineHeight: 1.1, marginBottom: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
            It starts in places like{" "}
            <span style={{ position: "relative", whiteSpace: "nowrap", zIndex: 0 }}>
              Khayalethu
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"
                style={{ position: "absolute", left: 0, bottom: "-0.08em", width: "100%", height: "0.26em", overflow: "visible", zIndex: -1 }}>
                <path d="M3 13 C 40 4, 90 18, 130 9 S 185 6, 197 11" fill="none" stroke={WARM_YELLOW} strokeWidth="7" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          {/* Placeholder copy: check the wording with Gary */}
          <p style={{ color: COLORS.inkMid, lineHeight: 1.85, marginBottom: 16, fontSize: 16.5, maxWidth: 520, marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0 }}>
            In rural communities across the Eastern Cape, children grow up surrounded by family,
            neighbours and teachers who want the best for them, but far from the specialists who
            could spot a developmental need early.
          </p>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.85, fontSize: 16.5, maxWidth: 520, marginLeft: isMobile ? "auto" : 0, marginRight: isMobile ? "auto" : 0 }}>
            The Puzzle Project is built for those communities: simple, playful tools that work in
            their languages and in their classrooms.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ---- The challenge: big numbers, no boxes --------------------------------
const PROBLEM_STATS = [
  { value: "1 : 12 000", label: "Psychologist-to-child ratio in rural South Africa", color: COLORS.teal },
  { value: "70%", label: "Of children never receive a formal developmental screen", color: COLORS.pink },
  { value: "Age 5–6", label: "Critical window for early intervention", color: COLORS.purple },
];

function ProblemSection() {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="The challenge"
            title="The problem we solve"
            lead="In South Africa, the shortage of educational psychologists — particularly in rural and peri-urban areas — means that many children with cognitive or developmental challenges go unidentified until they fall significantly behind their peers. Early intervention is proven to dramatically improve long-term outcomes, yet access to screening remains inequitable."
            maxWidth={760}
          />
        </Reveal>
        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? 34 : 0, marginTop: 10,
        }}>
          {PROBLEM_STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.12} style={{
              textAlign: "center", padding: isMobile ? 0 : "10px 30px",
              borderLeft: !isMobile && i > 0 ? `1.5px dashed ${COLORS.border}` : "none",
            }}>
              <div style={{ fontFamily: FONTS.heading, fontSize: "clamp(34px, 4vw, 50px)", fontWeight: 900, color: stat.color, marginBottom: 10, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                {stat.value}
              </div>
              <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Founding story: photo, words and a big quote ------------------------
function FoundingStory() {
  const isMobile = useIsMobile(860);
  return (
    <section style={{ padding: isMobile ? "70px 22px" : "110px 40px", background: CREAM, overflow: "hidden" }}>
      <div style={{
        maxWidth: 1150, margin: "auto", display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr",
        gap: isMobile ? 40 : 72, alignItems: "center",
      }}>
        <Reveal style={{ display: "flex", justifyContent: "center" }}>
          {/* Founder photo: add src="/images/gary-king.jpg" once the photo exists */}
          <PuzzlePhoto
            size={isMobile ? 240 : 340}
            label="Photo of Gary King"
            alt="Gary King, founder of The Puzzle Project"
            color={COLORS.maroon}
            style={{ filter: "drop-shadow(0 16px 36px rgba(60,40,20,0.16))" }}
          />
        </Reveal>

        <Reveal delay={0.1} style={{ textAlign: isMobile ? "center" : "left" }}>
          <p style={{ color: COLORS.teal, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 14, fontSize: 12 }}>
            How it began
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(28px, 3.4vw, 44px)", color: COLORS.ink, lineHeight: 1.12, marginBottom: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Founding story
          </h2>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.85, marginBottom: 16, fontSize: 16 }}>
            Gary King founded The Puzzle Project after a 12-piece puzzle sparked an idea during his work as a movie director in the rural Eastern Cape: what if a single puzzle could screen broad areas of a child's development needing support?
          </p>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.85, fontSize: 16 }}>
            And so began a journey with Dr Rivca Marais and Dr Jennifer Jansen to explore what that simple puzzle could become — a play-based screening protocol built around puzzle activities that children engage with naturally. The digital platform was developed to scale this protocol across South Africa.
          </p>
        </Reveal>
      </div>

      {/* Pull quote, given room of its own */}
      <Reveal style={{ maxWidth: 820, margin: isMobile ? "56px auto 0" : "84px auto 0", textAlign: "center", position: "relative" }}>
        <span aria-hidden="true" style={{ fontFamily: FONTS.heading, fontSize: 120, lineHeight: 0.6, color: WARM_YELLOW, display: "block", height: 50 }}>“</span>
        <p style={{ fontFamily: FONTS.heading, fontSize: "clamp(22px, 2.8vw, 34px)", fontWeight: 800, color: COLORS.ink, lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: 18 }}>
          No child should be left behind simply because their school couldn't afford a psychologist.
        </p>
        <p style={{ fontSize: 14, color: COLORS.teal, fontWeight: 800 }}>Gary King, Founder</p>
      </Reveal>
    </section>
  );
}

// ---- Team: faces (initials for now), no card borders ---------------------
const TEAM = [
  { initials: "GK", name: "Gary King", role: "Founder & project sponsor", color: COLORS.teal, bg: COLORS.tealLight, image: "/gary-king.jpg", imageAlt: "Gary King", imageFit: "cover", imagePosition: "center" },
  { initials: "RM", name: "Dr Rivca Marais", role: "Lead psychologist & clinical advisor", color: COLORS.pink, bg: COLORS.pinkLight, image: "/rivca.jpeg", imageAlt: "Rivca Marais", imageFit: "cover", imagePosition: "center 20%" },
  { initials: "JJ", name: "Dr Jennifer Jansen", role: "Research & development", color: COLORS.purple, bg: COLORS.purpleLight, image: "/jenny.jpeg", imageAlt: "Jennifer Jansen", imageFit: "cover", imagePosition: "center 30%" },
  { initials: "SF", name: "Ms Satara Ferreira", role: "Education", color: COLORS.maroon, bg: COLORS.maroonLight, image: "/satara.jpeg", imageAlt: "Satara Ferreira", imageFit: "cover", imagePosition: "center 20%" },
  { initials: "T19", name: "UCT INF3003W Team 19", role: "Platform design & development", color: COLORS.teal, bg: COLORS.tealLight, image: "/uct-seal.jpg", imageAlt: "University of Cape Town seal", imageFit: "contain", imagePosition: "center" },
  { initials: "UCT", name: "UCT INF3011F Team 11 and Team 18", role: "Academic supervisors & advisors", color: COLORS.purple, bg: COLORS.purpleLight, image: "/uct-seal.jpg", imageAlt: "University of Cape Town seal", imageFit: "contain", imagePosition: "center" },
];

function TeamSection() {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <Reveal>
          <SectionHeading align="center" eyebrow="Our team" title="Built and maintained by a multidisciplinary team" maxWidth={640} />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? "34px 16px" : "48px 30px" }}>
          {TEAM.map((member, i) => (
            <Reveal key={member.name} delay={(i % 3) * 0.1} style={{ textAlign: "center" }}>
              <div className="wiggle" style={{
                width: isMobile ? 84 : 104, height: isMobile ? 84 : 104, borderRadius: "50%", background: member.bg,
                position: "relative", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontFamily: FONTS.heading,
                fontSize: member.initials.length > 2 ? 20 : 28, fontWeight: 900, color: member.color,
                border: `3px solid ${COLORS.white}`, boxShadow: `0 0 0 3px ${member.bg}`,
              }}>
                {member.initials}
                {member.image && <img
                  src={member.image}
                  alt={member.imageAlt}
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: member.imageFit, background: COLORS.white }}
                />}
              </div>
              <h3 style={{ fontFamily: FONTS.heading, fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>{member.name}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.5 }}>{member.role}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Research background: two side-by-side notes ------------------------
const RESEARCH = [
  {
    title: "Play-based developmental assessment",
    color: COLORS.teal,
    desc: "The puzzle activities are adapted from standardised developmental milestone checklists used in clinical practice, mapped to domains including planning, sequencing, fine motor and problem-solving.",
  },
  {
    title: "Longitudinal tracking",
    color: COLORS.purple,
    desc: "The system enforces a minimum 2-month interval between comparative screenings, aligned with research showing meaningful developmental change occurs over this period in early childhood.",
  },
];

function ResearchSection() {
  const isMobile = useIsMobile(760);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: CREAM }}>
      <div style={{ maxWidth: 1100, margin: "auto" }}>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Evidence base"
            title="Research background"
            lead="The screening protocol is grounded in peer-reviewed developmental psychology research."
            maxWidth={600}
          />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 22 }}>
          {RESEARCH.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <div className="soft-card" style={{ height: "100%", padding: isMobile ? "30px 26px" : "38px 36px", borderRadius: 28, background: COLORS.white }}>
                <PuzzlePiece size={40} color={item.color} fillOpacity={1} rotate={i ? 12 : -10} style={{ marginBottom: 18 }} />
                <h3 style={{ fontFamily: FONTS.heading, fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Partners: a simple row, logos drop into the circles -----------------
const PARTNERS = [
  { name: "SACE", role: "Credentialing authority for educators" },
  { name: "HPCSA", role: "Professional body for psychologists" },
  { name: "UCT", role: "Academic development partner" },
];

function PartnersSection() {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <Reveal>
          <SectionHeading align="center" eyebrow="Working together" title="Our partners & funders" />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 30 : 40 }}>
          {PARTNERS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1} style={{ textAlign: "center" }}>
              {/* Partner logo placeholder: swap for an <img> when logos are available */}
              <div style={{
                width: 120, height: 120, borderRadius: "50%", background: CREAM,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontFamily: FONTS.heading, fontWeight: 900,
                fontSize: 22, color: COLORS.inkMid,
              }}>
                {p.name}
              </div>
              <h3 style={{ fontFamily: FONTS.heading, fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>{p.name}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.55 }}>{p.role}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function About({ onNavigateToLogin, onNavigate }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to About"));

  return (
    <div style={{ fontFamily: FONTS.body }}>
      <style>{`${PUBLIC_FONT_IMPORT}${WARM_PAGE_CSS}`}</style>
      <Navbar site="tpp" current="about" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
      <PageHero
        eyebrow="About The Puzzle Project"
        title="The people behind"
        highlight="the puzzles"
        lead="The Puzzle Project is a South African non-profit organisation dedicated to ensuring that every child has access to early developmental screening — regardless of where they live or go to school."
      />
      <WhereItStarts />
      <ProblemSection />
      <FoundingStory />
      <TeamSection />
      <ResearchSection />
      <PartnersSection />
      <CallToAction />
      <Footer site="tpp" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}