import React from "react";
import { COLORS, FONT_IMPORT, PuzzlePiece, PuzzlePhoto, SectionHeading, Navbar, Footer, CallToAction } from "./SiteChrome";

function AboutHero() {
  return (
    <section style={{
      paddingTop: 84,
      background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={150} color={COLORS.purple} rotate={18} style={{ position: "absolute", top: 60, right: -40 }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "72px 40px 72px", position: "relative" }}>
        <span style={{
          display: "inline-block", padding: "7px 16px", borderRadius: 20,
          background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
          fontSize: 12, fontWeight: 800, color: COLORS.teal, marginBottom: 24,
        }}>
          About The Puzzle Project
        </span>
        <h1 style={{
          fontFamily: "'Nunito', sans-serif", fontSize: "clamp(34px, 4.4vw, 56px)",
          fontWeight: 900, color: COLORS.ink, lineHeight: 1.08,
          letterSpacing: "-0.03em", marginBottom: 20,
        }}>
          Our organisation
        </h1>
        <p style={{ fontSize: 17, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 760 }}>
          The Puzzle Project is a South African non-profit organisation dedicated to ensuring that every child has access to early developmental screening — regardless of where they live or go to school.
        </p>
      </div>
    </section>
  );
}

// The problem we solve, with headline statistics
const PROBLEM_STATS = [
  { value: "1 : 12 000", label: "Psychologist-to-child ratio in rural South Africa", color: COLORS.teal },
  { value: "70%", label: "Of children never receive a formal developmental screen", color: COLORS.pink },
  { value: "Age 5–6", label: "Critical window for early intervention", color: COLORS.purple },
];

function ProblemSection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          eyebrow="The challenge"
          title="The problem we solve"
          lead="In South Africa, the shortage of educational psychologists — particularly in rural and peri-urban areas — means that many children with cognitive or developmental challenges go unidentified until they fall significantly behind their peers. Early intervention is proven to dramatically improve long-term outcomes, yet access to screening remains inequitable."
          maxWidth={900}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {PROBLEM_STATS.map(stat => (
            <div key={stat.label} style={{
              padding: "36px 28px", borderRadius: 18, textAlign: "center",
              background: COLORS.surface, borderTop: `4px solid ${stat.color}`,
            }}>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 34, fontWeight: 900, color: stat.color, marginBottom: 10, lineHeight: 1.1 }}>
                {stat.value}
              </div>
              <p style={{ fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.65 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoundingStory() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.surface, position: "relative", overflow: "hidden" }}>
      <PuzzlePiece size={130} color={COLORS.orange} rotate={-15} style={{ position: "absolute", bottom: -30, left: -30 }} />
      <div style={{ maxWidth: 1300, margin: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start", position: "relative" }}>
        <div>
          <p style={{ color: COLORS.teal, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 14, fontSize: 12 }}>
            How it began
          </p>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(26px, 3.2vw, 40px)", color: COLORS.ink, lineHeight: 1.14, marginBottom: 22, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Founding story
          </h2>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, marginBottom: 16, fontSize: 15.5 }}>
            Gary King, a South African educator and development advocate, founded the Puzzle Project after working in township schools and witnessing firsthand how many children with diagnosable conditions — such as ADHD, processing disorders and fine motor delays — were simply labelled "difficult" or "slow" and left without support.
          </p>
          <p style={{ color: COLORS.inkMid, lineHeight: 1.8, fontSize: 15.5 }}>
            He partnered with Dr Rivca Marais and Dr Jennifer Jansen to develop a play-based screening protocol built around puzzle activities that children engage with naturally. The digital platform was developed to scale this protocol across South Africa.
          </p>
        </div>

        <div>
          {/* Founder photo — add src="/images/gary-king.jpg" once the photo exists */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <PuzzlePhoto
              size={280}
              label="Photo of Gary King"
              alt="Gary King, founder of The Puzzle Project"
              color={COLORS.maroon}
              style={{ filter: "drop-shadow(0 12px 30px rgba(0,0,0,0.12))" }}
            />
          </div>

          {/* Pull quote */}
          <div style={{
            padding: "24px 26px", borderRadius: 16,
            background: COLORS.white, borderLeft: `4px solid ${COLORS.teal}`,
            border: `1px solid ${COLORS.border}`, borderLeftWidth: 4, borderLeftColor: COLORS.teal,
          }}>
            <p style={{ fontSize: 15.5, color: COLORS.ink, lineHeight: 1.7, fontStyle: "italic", marginBottom: 12 }}>
              "No child should be left behind simply because their school couldn't afford a psychologist."
            </p>
            <p style={{ fontSize: 13, color: COLORS.teal, fontWeight: 800 }}>— Gary King, Founder</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Our team — initials avatars, matching the wireframe treatment
const TEAM = [
  { initials: "GK", name: "Gary King", role: "Founder & project sponsor", color: COLORS.teal, bg: COLORS.tealLight },
  { initials: "RM", name: "Dr Rivca Marais", role: "Lead psychologist & clinical advisor", color: COLORS.pink, bg: COLORS.pinkLight },
  { initials: "JJ", name: "Dr Jennifer Jansen", role: "Research & development", color: COLORS.purple, bg: COLORS.purpleLight },
  { initials: "SF", name: "Ms Satara Ferreira", role: "Education", color: COLORS.maroon, bg: COLORS.maroonLight },
  { initials: "T19", name: "UCT Group 19", role: "Platform design & development", color: COLORS.teal, bg: COLORS.tealLight },
  { initials: "UCT", name: "UCT INF3011F", role: "Academic supervisors & advisors", color: COLORS.purple, bg: COLORS.purpleLight },
];

function TeamSection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          eyebrow="Our team"
          title="Built and maintained by a multidisciplinary team"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20 }}>
          {TEAM.map(member => (
            <div key={member.name} style={{
              padding: "30px 22px", borderRadius: 18, textAlign: "center",
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; }}
            >
              <div style={{
                width: 62, height: 62, borderRadius: "50%", background: member.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px", fontFamily: "'Nunito', sans-serif",
                fontSize: member.initials.length > 2 ? 15 : 19, fontWeight: 900, color: member.color,
              }}>
                {member.initials}
              </div>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15.5, fontWeight: 800, color: COLORS.ink, marginBottom: 6 }}>{member.name}</h3>
              <p style={{ fontSize: 12.5, color: COLORS.inkFaint, lineHeight: 1.55 }}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Research background
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
  return (
    <section style={{ padding: "90px 40px", background: COLORS.surface }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          eyebrow="Evidence base"
          title="Research background"
          lead="The screening protocol is grounded in peer-reviewed developmental psychology research."
        />
        <div style={{ display: "grid", gap: 18 }}>
          {RESEARCH.map(item => (
            <div key={item.title} style={{
              padding: "28px 30px", borderRadius: 18,
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
              borderLeft: `4px solid ${item.color}`,
            }}>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 17, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 900 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Partners & funders
const PARTNERS = [
  { name: "SACE", role: "Credentialing authority for educators" },
  { name: "HPCSA", role: "Professional body for psychologists" },
  { name: "UCT", role: "Academic development partner" },
];

function PartnersSection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <SectionHeading
          eyebrow="Working together"
          title="Our partners & funders"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {PARTNERS.map(p => (
            <div key={p.name} style={{
              padding: "26px", borderRadius: 18, textAlign: "center",
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
            }}>
              {/* Partner logo placeholder */}
              <div style={{
                height: 84, borderRadius: 12, background: COLORS.surface,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, border: `1px dashed ${COLORS.border}`,
              }}>
                <span style={{ fontSize: 12, color: COLORS.inkFaint, fontWeight: 600 }}>Partner logo</span>
              </div>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 17, fontWeight: 900, color: COLORS.ink, marginBottom: 6 }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: COLORS.inkFaint, lineHeight: 1.6 }}>{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function About({ onNavigateToLogin, onNavigate }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to About"));

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Navbar current="about" onNavigate={go} onLoginClick={onNavigateToLogin} />
      <AboutHero />
      <ProblemSection />
      <FoundingStory />
      <TeamSection />
      <ResearchSection />
      <PartnersSection />
      <CallToAction onNavigate={go} onLoginClick={onNavigateToLogin} />
      <Footer onNavigate={go} onLoginClick={onNavigateToLogin} />
    </div>
  );
}