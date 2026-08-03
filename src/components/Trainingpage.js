import React, { useState, useEffect } from "react";
import { COLORS, FONT_IMPORT, PuzzlePiece, SectionHeading, Navbar, Footer, CallToAction } from "./SiteChrome";

function TrainingHero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      paddingTop: 84,
      background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <PuzzlePiece size={150} color={COLORS.teal} rotate={15} style={{ position: "absolute", top: 50, right: -40 }} />
      <div style={{
        maxWidth: 1300, margin: "0 auto", padding: "72px 40px",
        display: "flex", gap: 48, flexWrap: "wrap", alignItems: "center", position: "relative",
      }}>
        <div style={{
          flex: "1 1 460px",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.5s ease",
        }}>
          <span style={{
            display: "inline-block", padding: "7px 16px", borderRadius: 20,
            background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
            fontSize: 12, fontWeight: 800, color: COLORS.teal, marginBottom: 24,
          }}>
            Training programme
          </span>
          <h1 style={{
            fontFamily: "'Nunito', sans-serif", fontSize: "clamp(32px, 4.2vw, 52px)",
            fontWeight: 900, color: COLORS.ink, lineHeight: 1.08,
            letterSpacing: "-0.03em", marginBottom: 18,
          }}>
            Become a certified<br />
            <span style={{ color: COLORS.teal }}>PuzzleBox</span> screener.
          </h1>
          <p style={{ fontSize: 16.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 540 }}>
            A certification programme for preschool educators, primary healthcare practitioners and psychologists who want to administer the PuzzleBox Screener.
          </p>
        </div>

        {/* Access notice */}
        <div style={{
          flex: "1 1 340px", maxWidth: 460,
          padding: "26px 28px", borderRadius: 18,
          background: `linear-gradient(135deg, ${COLORS.tealLight}, ${COLORS.purpleLight})`,
          border: `1px solid ${COLORS.border}`,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.5s ease 0.15s",
        }}>
          <span style={{
            display: "inline-block", padding: "4px 13px", borderRadius: 14,
            background: COLORS.white, color: COLORS.teal,
            fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 12,
          }}>
            Restricted access
          </span>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>
            Access requires registration
          </p>
          <p style={{ fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.7 }}>
            To administer the PuzzleBox Screener you must complete this certified programme and pass the assessment. Only registered users with verified professional credentials can access the full screener tool.
          </p>
        </div>
      </div>
    </section>
  );
}

// Two tiers of administration
function TiersSection() {
  const tiers = [
    {
      label: "Tier 1",
      title: "Teachers & primary healthcare",
      color: COLORS.teal,
      bg: COLORS.tealLight,
      desc: "For preschool teachers and selected primary healthcare practitioners who have completed PuzzleBox Screener training.",
      access: "Access to a single global screening score, supporting early identification of potential developmental concerns and referral decisions.",
    },
    {
      label: "Tier 2",
      title: "Psychologists",
      color: COLORS.purple,
      bg: COLORS.purpleLight,
      desc: "Reserved for psychologists who have completed PuzzleBox Screener training.",
      access: "Full interpretation at domain and construct level — cognitive, language, fine-motor and socio-emotional functioning — including pattern recognition and referral decision-making.",
    },
  ];

  return (
    <section style={{ padding: "90px 40px", background: COLORS.white }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <SectionHeading
          eyebrow="Two levels of administration"
          title="A tiered screening system"
          lead="The PuzzleBox Screener supports appropriate use across educational and clinical contexts through two levels of administration. Your training pathway and platform access depend on your professional role."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {tiers.map(tier => (
            <div key={tier.label} style={{
              padding: "32px 30px", borderRadius: 20,
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
              borderTop: `4px solid ${tier.color}`,
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; }}
            >
              <span style={{
                display: "inline-block", padding: "4px 14px", borderRadius: 16,
                background: tier.bg, color: tier.color,
                fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                {tier.label}
              </span>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 19, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>{tier.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.7, marginBottom: 16 }}>{tier.desc}</p>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: tier.bg }}>
                <p style={{ fontSize: 11.5, fontWeight: 800, color: tier.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Platform access</p>
                <p style={{ fontSize: 13, color: COLORS.inkMid, lineHeight: 1.65 }}>{tier.access}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RequirementsSection() {
  const requirements = [
    { title: "Verified professional credentials", color: COLORS.teal, desc: "Registered educators need a valid SACE number; healthcare practitioners and psychologists upload their professional registration during account creation." },
    { title: "Works with children aged 5–6", color: COLORS.pink, desc: "The screener is designed for children aged 5 years 0 months to 6 years 11 months, across preschool, Grade R, clinical, home-based and community settings." },
    { title: "Physical puzzle kit", color: COLORS.purple, desc: "You must have a PuzzleBox screener kit in your possession before training can be meaningfully completed." },
    { title: "Pass the certification assessment", color: COLORS.orange, desc: "After completing all modules you must pass the post-training assessment before screener access is granted." },
  ];

  return (
    <section style={{ padding: "90px 40px", background: COLORS.surface }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 44 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 12 }}>
              Who can apply
            </p>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(26px, 3.2vw, 40px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
              Requirements
            </h2>
          </div>
          <button style={{
            padding: "13px 28px", borderRadius: 12,
            background: COLORS.teal, color: COLORS.white,
            border: "none", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.tealDark; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,155,141,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.teal; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Apply for access
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {requirements.map(req => (
            <div key={req.title} style={{
              padding: "26px 24px", borderRadius: 16,
              background: COLORS.white, border: `1px solid ${COLORS.border}`,
              borderTop: `4px solid ${req.color}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
            >
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>{req.title}</h3>
              <p style={{ fontSize: 13, color: COLORS.inkMid, lineHeight: 1.65 }}>{req.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// The seven training modules
const MODULES = [
  { number: "01", title: "Introduction to The PuzzleBox", color: COLORS.teal, bg: COLORS.tealLight },
  { number: "02", title: "Research Background & Psychometric Properties", color: COLORS.pink, bg: COLORS.pinkLight },
  { number: "03", title: "Test Equipment & Setting Up", color: COLORS.purple, bg: COLORS.purpleLight },
  { number: "04", title: "Administration", color: COLORS.orange, bg: COLORS.orangeLight },
  { number: "05", title: "Interpretation", color: COLORS.teal, bg: COLORS.tealLight },
  { number: "06", title: "Online Navigation", color: COLORS.pink, bg: COLORS.pinkLight },
  { number: "07", title: "Report Writing & Referral", color: COLORS.purple, bg: COLORS.purpleLight },
];

function ModulesSection() {
  return (
    <section style={{ padding: "90px 40px", background: COLORS.white, position: "relative", overflow: "hidden" }}>
      <PuzzlePiece size={120} color={COLORS.orange} rotate={-20} style={{ position: "absolute", bottom: -20, right: -30 }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", position: "relative" }}>
        <SectionHeading
          eyebrow="Curriculum"
          title="Seven training modules"
          lead="The programme takes you from first principles through to confident administration, interpretation and reporting. Modules are completed in order, followed by the certification assessment."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {MODULES.map(mod => (
            <div key={mod.number} style={{
              padding: "22px 24px", borderRadius: 16,
              background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              display: "flex", alignItems: "center", gap: 18, transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: mod.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900, color: mod.color,
                fontFamily: "'Nunito', sans-serif", flexShrink: 0,
              }}>
                {mod.number}
              </div>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, color: COLORS.ink, lineHeight: 1.35 }}>
                {mod.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrainingModesSection() {
  const modes = [
    {
      type: "Face-to-face training",
      color: COLORS.teal,
      bg: COLORS.tealLight,
      desc: "Attend an in-person training session led by a certified PuzzleBox trainer. Sessions are held at partner schools and institutions across the Eastern Cape and are designed to give you hands-on experience with the physical screener kit.",
      details: ["Full day workshop format", "Hands-on screener practice", "Q&A with certified trainers", "Certificate issued on completion"],
      cta: "Find a session near you",
    },
    {
      type: "Online training",
      color: COLORS.purple,
      bg: COLORS.purpleLight,
      desc: "Complete the training programme at your own pace through our digital learning platform. Modules cover screener administration, scoring, interpretation and ethical considerations. Available in isiXhosa, Afrikaans and English.",
      details: ["Self-paced, available anytime", "Video modules and practice exercises", "Available in 3 languages", "Online certification assessment"],
      cta: "Start online training",
    },
  ];

  return (
    <section style={{ padding: "90px 40px", background: COLORS.surface }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <SectionHeading
          eyebrow="How it works"
          title="Training takes place in these ways..."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 28 }}>
          {modes.map((mode, i) => (
            <div key={mode.type} style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              transition: "all 0.2s", background: COLORS.white,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"; }}
            >
              {/* Image placeholder — puzzle motif */}
              <div style={{
                height: 190, background: `linear-gradient(135deg, ${mode.bg}, ${mode.color}22)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                <PuzzlePiece size={110} color={mode.color} rotate={i === 0 ? -10 : 15} fillOpacity={0.5} />
                <PuzzlePiece size={60} color={mode.color} rotate={i === 0 ? 30 : -25} fillOpacity={0.28}
                  style={{ position: "absolute", top: 22, right: 40 }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(to top, ${COLORS.white}, transparent)` }} />
              </div>

              <div style={{ padding: "28px 28px 32px" }}>
                <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>
                  {mode.type}
                </h3>
                <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.7, marginBottom: 20 }}>
                  {mode.desc}
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                  {mode.details.map(d => (
                    <li key={d} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: COLORS.inkMid, marginBottom: 8 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: mode.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke={mode.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
                <button style={{
                  padding: "11px 22px", borderRadius: 10,
                  background: mode.color, color: COLORS.white,
                  border: "none", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {mode.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TrainingPage(props) {
  // Accepts several naming conventions so navigation works however App.js wires it
  const go = props.onNavigate
    || ((page) => {
      if (page === "home" && props.onBack) return props.onBack();
      if (page === "home" && props.onNavigateHome) return props.onNavigateHome();
      console.warn("No onNavigate handler passed to TrainingPage");
    });
  const goLogin = props.onNavigateToLogin || props.onLogin || (() => console.warn("No login handler passed to TrainingPage"));

  return (
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <Navbar current="training" onNavigate={go} onLoginClick={goLogin} />
      <TrainingHero />
      <TiersSection />
      <RequirementsSection />
      <ModulesSection />
      <TrainingModesSection />
      <CallToAction onNavigate={go} onLoginClick={goLogin} />
      <Footer onNavigate={go} onLoginClick={goLogin} />
    </div>
  );
}