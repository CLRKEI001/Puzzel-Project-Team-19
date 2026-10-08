import React, { useState } from "react";
import {
  COLORS, FONTS, PUBLIC_FONT_IMPORT, WARM_PAGE_CSS, CREAM, WARM_YELLOW,
  PuzzlePiece, SectionHeading, PageHero, Reveal,
  Navbar, Footer, CallToAction, useIsMobile,
} from "./SiteChrome";
// Portrait from The Puzzle Project brief (March 2026).
// Confirm with Gary that it can be used on the public site before going live.
import gladysPortrait from "../gladys-khayalethu.jpg";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

// About page, reworked to match the warmer home page: cream backgrounds,
// centred header, softer cards and sections that fade in on scroll.
// All copy is unchanged from the previous version except the page title.

// Soft orange wash for a section background. Mixed toward COLORS.white (not
// literal white) so it stays a muted tone in dark mode, same as the home page.
const ORANGE_LIGHT = `color-mix(in srgb, ${COLORS.orange} 10%, ${COLORS.white})`;

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

// ---- Our impact: four public charts (PLACEHOLDER DATA) --------------------
// All numbers below are illustrative. Replace them with verified programme
// figures before going live (ask Gary which numbers he is happy to publish).
const SHOW_PLACEHOLDER_NOTE = true;
const ORANGE = "#F26522";

const IMPACT_TREND = [
  { month: "Jan", children: 120 }, { month: "Feb", children: 260 },
  { month: "Mar", children: 430 }, { month: "Apr", children: 640 },
  { month: "May", children: 880 }, { month: "Jun", children: 1150 },
  { month: "Jul", children: 1480 }, { month: "Aug", children: 1830 },
  { month: "Sep", children: 2240 },
];

const IMPACT_OUTCOMES = [
  { name: "Back on track", value: 58, color: COLORS.teal },
  { name: "Improving with support", value: 29, color: ORANGE },
  { name: "Ongoing support", value: 13, color: COLORS.pink },
];

// lon / lat are approximate region centres, used to place pins on the map.
const IMPACT_REGIONS = [
  { name: "Amathole", value: 640, color: COLORS.teal, lon: 27.4, lat: -32.5, label: "below" },
  { name: "Chris Hani", value: 520, color: COLORS.purple, lon: 26.88, lat: -31.9, label: "above" },
  { name: "OR Tambo", value: 410, color: COLORS.pink, lon: 28.78, lat: -31.59, label: "below" },
  { name: "Alfred Nzo", value: 290, color: ORANGE, lon: 29.0, lat: -30.7, label: "above" },
  { name: "Joe Gqabi", value: 210, color: COLORS.teal, lon: 27.6, lat: -30.95, label: "above" },
  { name: "Sarah Baartman", value: 170, color: COLORS.purple, lon: 25.4, lat: -33.1, label: "below" },
];

const IMPACT_GROWTH = [
  { domain: "Cognitive", first: 43, after: 68 },
  { domain: "Fine motor", first: 45, after: 71 },
  { domain: "Language", first: 43, after: 66 },
  { domain: "Social", first: 41, after: 69 },
  { domain: "Emotion", first: 44, after: 72 },
  { domain: "Moral", first: 39, after: 64 },
];

function ImpactTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: COLORS.white, borderRadius: 14, padding: "10px 14px", fontSize: 13,
      boxShadow: "0 10px 30px rgba(0,0,0,0.18)", border: `1px solid ${COLORS.border}`,
    }}>
      {label && <div style={{ fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ color: COLORS.inkMid }}>
          <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: "50%", background: p.color || p.payload?.color, marginRight: 7 }} />
          {p.name}: <strong style={{ color: COLORS.ink }}>{p.value}{unit}</strong>
        </div>
      ))}
    </div>
  );
}

function ImpactCard({ eyebrow, stat, statLabel, color, children, delay = 0 }) {
  const isMobile = useIsMobile(760);
  return (
    <Reveal delay={delay} style={{ height: "100%" }}>
      <div style={{
        height: "100%", background: COLORS.white, borderRadius: 28,
        padding: isMobile ? "26px 18px 14px" : "34px 32px 20px",
        boxShadow: "0 18px 44px rgba(232,23,93,0.14)", border: "1px solid rgba(232,23,93,0.08)",
        position: "relative", overflow: "hidden",
      }}>
        {/* soft colour glow in the corner */}
        <div aria-hidden="true" style={{
          position: "absolute", top: -60, right: -60, width: 180, height: 180,
          borderRadius: "50%", background: color, opacity: 0.12,
        }} />
        <p style={{ color, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", fontSize: 12, marginBottom: 8, position: "relative" }}>
          {eyebrow}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 14, position: "relative" }}>
          <span style={{ fontFamily: FONTS.heading, fontSize: "clamp(34px, 4vw, 48px)", fontWeight: 900, color: COLORS.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {stat}
          </span>
          <span style={{ fontSize: 14.5, color: COLORS.inkMid, fontWeight: 600 }}>{statLabel}</span>
        </div>
        {children}
      </div>
    </Reveal>
  );
}

// ---- Eastern Cape map ------------------------------------------------------
// Simplified outline of the Eastern Cape (lon, lat), drawn for display only.
const EC_OUTLINE = [
  [30.20, -31.06], [29.52, -31.62], [29.05, -32.05], [28.38, -32.70], [27.91, -33.03],
  [27.10, -33.50], [26.67, -33.70], [26.20, -33.80], [25.62, -33.96], [25.00, -34.05],
  [24.35, -34.15], [23.90, -34.05], [23.65, -34.02], [23.45, -33.85], [23.15, -33.45],
  [23.20, -32.90], [23.45, -32.45], [24.10, -31.90], [24.10, -31.30], [24.60, -31.00],
  [25.20, -30.65], [25.70, -30.55], [26.30, -30.50], [26.70, -30.62], [27.40, -30.58],
  [27.90, -30.68], [28.30, -30.80], [28.60, -30.35], [28.75, -30.10], [29.15, -30.10],
  [29.45, -30.40], [29.75, -30.75], [30.00, -30.95],
];
const MAP_W = 700;
const MAP_H = 470;
const project = ([lon, lat]) => [
  ((lon - 22.8) / (30.5 - 22.8)) * MAP_W,
  ((-30.0 - lat) / (34.4 - 30.0)) * MAP_H,
];
const EC_PATH =
  EC_OUTLINE.map((pt, i) => `${i ? "L" : "M"}${project(pt).map((n) => n.toFixed(1)).join(" ")}`).join(" ") + " Z";

function EasternCapeMap({ isMobile }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...IMPACT_REGIONS.map((r) => r.value));

  return (
    <div>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: "100%", height: "auto", display: "block" }}
        role="img" aria-label="Map of the Eastern Cape showing the regions The Puzzle Project reaches">
        <defs>
          <linearGradient id="ecLand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFE9F1" />
            <stop offset="100%" stopColor="#FAD3E2" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="22" fill="#EAF6F8" />
        <text x={MAP_W - 30} y={MAP_H - 24} textAnchor="end" fontSize="15" fontStyle="italic" fill="#8DB9C2">Indian Ocean</text>
        <path d={EC_PATH} fill="url(#ecLand)" stroke={COLORS.pink} strokeWidth="3" strokeLinejoin="round" />

        {IMPACT_REGIONS.map((r, i) => {
          const [x, y] = project([r.lon, r.lat]);
          const radius = (isMobile ? 13 : 16) + (r.value / max) * (isMobile ? 9 : 12);
          const on = active === r.name;
          return (
            <g key={r.name} transform={`translate(${x} ${y})`} style={{ cursor: "pointer" }}
              onMouseEnter={() => setActive(r.name)} onMouseLeave={() => setActive(null)}
              onClick={() => setActive(on ? null : r.name)}>
              <circle r={radius} fill={r.color} opacity="0.25">
                <animate attributeName="r" values={`${radius};${radius * 2};${radius}`} dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0;0.35" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
              </circle>
              <circle r={on ? radius + 4 : radius} fill={r.color} stroke="#fff" strokeWidth="4"
                style={{ transition: "r 0.2s", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={isMobile ? 11 : 13} fontWeight="900" fill="#fff">{r.value}</text>
              <text textAnchor="middle" y={r.label === "above" ? -(radius + 12) : radius + 20}
                fontSize={isMobile ? 12 : 14} fontWeight="800" fill={COLORS.ink}
                stroke="#FFE9F1" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
                {r.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 14, paddingBottom: 6 }}>
        {IMPACT_REGIONS.map((r) => (
          <button key={r.name} type="button"
            onMouseEnter={() => setActive(r.name)} onMouseLeave={() => setActive(null)}
            style={{
              border: "none", cursor: "pointer", borderRadius: 999, padding: "6px 12px", fontSize: 12.5, fontWeight: 700,
              background: active === r.name ? r.color : "#F6F1F4", color: active === r.name ? "#fff" : COLORS.ink,
              transition: "all 0.2s", fontFamily: "inherit",
            }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: active === r.name ? "#fff" : r.color, marginRight: 6 }} />
            {r.name} · {r.value}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImpactSection() {
  const isMobile = useIsMobile(860);
  const chartH = isMobile ? 260 : 320;
  const axis = { fontSize: 12, fill: COLORS.inkMid };

  return (
    <section style={{
      padding: isMobile ? "72px 18px 80px" : "110px 40px 120px",
      background: "linear-gradient(160deg, #FFF0F5 0%, #FDE4EE 55%, #FBDDE9 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1180, margin: "auto", position: "relative" }}>
        <Reveal style={{ textAlign: "center", marginBottom: isMobile ? 40 : 60 }}>
          <p style={{ color: COLORS.pink, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", fontSize: 12, marginBottom: 14 }}>
            Our impact
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(30px, 4vw, 52px)", color: COLORS.ink, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 18 }}>
            Every screening is a child given a head start
          </h2>
          <p style={{ color: COLORS.inkMid, fontSize: 17, lineHeight: 1.75, maxWidth: 640, margin: "0 auto" }}>
            See how The Puzzle Project is reaching communities across the Eastern Cape and helping learners grow.
          </p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 22 : 30 }}>

          {/* 1. Reach over time */}
          <ImpactCard eyebrow="Our reach" stat="2,240+" statLabel="children screened this year" color={COLORS.teal}>
            <ResponsiveContainer width="100%" height={chartH}>
              <AreaChart data={IMPACT_TREND} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="impactArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(0,0,0,0.07)" vertical={false} />
                <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip content={<ImpactTooltip />} />
                <Area type="monotone" dataKey="children" name="Children screened" stroke={COLORS.teal} strokeWidth={4}
                  fill="url(#impactArea)" dot={{ r: 4, fill: COLORS.white, stroke: COLORS.teal, strokeWidth: 3 }}
                  activeDot={{ r: 7 }} animationDuration={1600} />
              </AreaChart>
            </ResponsiveContainer>
          </ImpactCard>

          {/* 2. Outcomes donut */}
          <ImpactCard eyebrow="Learner outcomes" stat="87%" statLabel="of supported learners are showing progress" color={COLORS.purple} delay={0.1}>
            <div style={{ position: "relative" }}>
              <ResponsiveContainer width="100%" height={chartH}>
                <PieChart>
                  <Pie data={IMPACT_OUTCOMES} dataKey="value" nameKey="name" cx="50%" cy="46%"
                    innerRadius={isMobile ? 62 : 80} outerRadius={isMobile ? 92 : 118}
                    paddingAngle={4} cornerRadius={10} stroke="none" animationDuration={1600}>
                    {IMPACT_OUTCOMES.map((o) => <Cell key={o.name} fill={o.color} />)}
                  </Pie>
                  <Tooltip content={<ImpactTooltip unit="%" />} />
                  <Legend iconType="circle" iconSize={11} wrapperStyle={{ fontSize: 13, color: COLORS.inkMid, paddingTop: 6 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: "absolute", top: "46%", left: "50%", transform: "translate(-50%, -62%)",
                textAlign: "center", pointerEvents: "none",
              }}>
                <div style={{ fontFamily: FONTS.heading, fontWeight: 900, fontSize: isMobile ? 26 : 32, color: COLORS.ink, lineHeight: 1 }}>87%</div>
                <div style={{ fontSize: 12, color: COLORS.inkMid, fontWeight: 700, marginTop: 4 }}>progressing</div>
              </div>
            </div>
          </ImpactCard>

          {/* 3. Regions map */}
          <ImpactCard eyebrow="Communities reached" stat="6" statLabel="Eastern Cape regions and growing" color={COLORS.pink} delay={0.05}>
            <EasternCapeMap isMobile={isMobile} />
          </ImpactCard>

          {/* 4. Growth after support */}
          <ImpactCard eyebrow="Growth after support" stat="+25 pts" statLabel="average gain from first screening to follow-up" color={ORANGE} delay={0.15}>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={IMPACT_GROWTH} margin={{ top: 10, right: 6, left: -18, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="4 6" stroke="rgba(0,0,0,0.07)" vertical={false} />
                <XAxis dataKey="domain" tick={{ ...axis, fontSize: isMobile ? 10 : 12 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={axis} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ImpactTooltip unit="%" />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Legend iconType="circle" iconSize={11} wrapperStyle={{ fontSize: 13, color: COLORS.inkMid }} />
                <Bar dataKey="first" name="First screening" fill="#D9D3E6" radius={[8, 8, 0, 0]} maxBarSize={22} animationDuration={1400} />
                <Bar dataKey="after" name="After support" fill={ORANGE} radius={[8, 8, 0, 0]} maxBarSize={22} animationDuration={1800} />
              </BarChart>
            </ResponsiveContainer>
          </ImpactCard>
        </div>

        {SHOW_PLACEHOLDER_NOTE && (
          <p style={{ textAlign: "center", marginTop: 28, fontSize: 12.5, color: COLORS.inkMid, opacity: 0.8 }}>
            Illustrative figures shown while programme data is being verified.
          </p>
        )}
      </div>
    </section>
  );
}

// ---- Founding story: photo, words and a big quote ------------------------
function FoundingStory() {
  const isMobile = useIsMobile(1000);
  const hero = `${process.env.PUBLIC_URL || ""}/gary-king-hero.jpg`;
  const para = { color: "rgba(255,255,255,0.93)", lineHeight: 1.75, fontSize: 15.5 };
  const copy = (
    <>
      <p style={{ textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", marginBottom: 12, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
        How it began
      </p>
      <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(30px, 3.6vw, 48px)", color: "#fff", lineHeight: 1.1, marginBottom: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
        Founding story
      </h2>
      <p style={{ ...para, marginBottom: 12 }}>
        Gary King founded The Puzzle Project after a 12-piece puzzle sparked an idea during his work as a movie director in the rural Eastern Cape: what if a single puzzle could screen broad areas of a child's development needing support?
      </p>
      <p style={para}>
        And so began a journey with Dr Rivca Marais and Dr Jennifer Jansen to explore what that simple puzzle could become — a play-based screening protocol built around puzzle activities that children engage with naturally. The digital platform was developed to scale this protocol across South Africa.
      </p>
      {/* Pull quote, kept inside the portrait */}
      <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.28)" }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: "clamp(18px, 1.9vw, 25px)", fontWeight: 700, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.01em", marginBottom: 10 }}>
          <span aria-hidden="true" style={{ color: WARM_YELLOW }}>“</span>No child should be left behind simply because their school couldn't afford a psychologist.<span aria-hidden="true" style={{ color: WARM_YELLOW }}>”</span>
        </p>
        <p style={{ fontSize: 13.5, color: WARM_YELLOW, fontWeight: 800 }}>Gary King, Founder</p>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <section style={{ background: "#3d3d3d", color: "#fff" }}>
        <img src={hero} alt="Gary King, founder of The Puzzle Project"
          style={{ display: "block", width: "100%", height: "auto" }} />
        <div style={{ padding: "40px 22px 56px", maxWidth: 640, margin: "0 auto" }}>
          <Reveal>{copy}</Reveal>
        </div>
      </section>
    );
  }
  return (
    <section style={{ position: "relative", overflow: "hidden", color: "#fff", background: "#3d3d3d", aspectRatio: "1800 / 910", minHeight: 640 }}>
      {/* the whole portrait, never cropped at the head */}
      <img src={hero} alt="Gary King, founder of The Puzzle Project"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "75% top" }} />
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(20,20,20,0.82) 0%, rgba(20,20,20,0.6) 34%, rgba(20,20,20,0) 58%)",
      }} />
      <div style={{ position: "relative", height: "100%", maxWidth: 1250, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
        <Reveal style={{ maxWidth: 520 }}>{copy}</Reveal>
      </div>
    </section>
  );
}

// ---- Team: faces with names only (no role descriptions, per Gary) --------
const TEAM = [
  { initials: "GK", name: "Gary King",  color: COLORS.teal, bg: COLORS.tealLight, image: "/gary-king.jpg", imageAlt: "Gary King", imageFit: "cover", imagePosition: "center" },
  { initials: "RM", name: "Dr Rivca Marais",  color: COLORS.pink, bg: COLORS.pinkLight, image: "/rivca.jpeg", imageAlt: "Rivca Marais", imageFit: "cover", imagePosition: "center 20%" },
  { initials: "JJ", name: "Dr Jennifer Jansen",  color: COLORS.purple, bg: COLORS.purpleLight, image: "/jenny.jpeg", imageAlt: "Jennifer Jansen", imageFit: "cover", imagePosition: "center 30%" },
  { initials: "SF", name: "Ms Satara Ferreira",  color: COLORS.maroon, bg: COLORS.maroonLight, image: "/satara.jpeg", imageAlt: "Satara Ferreira", imageFit: "cover", imagePosition: "center 20%" },
  { initials: "T19", name: "UCT INF3003W Team 19", color: COLORS.teal, bg: COLORS.tealLight, image: "/uct-seal.jpg", imageAlt: "University of Cape Town seal", imageFit: "contain", imagePosition: "center" },
  { initials: "UCT", name: "UCT INF3011F Team 11 and Team 18",  color: COLORS.purple, bg: COLORS.purpleLight, image: "/uct-seal.jpg", imageAlt: "University of Cape Town seal", imageFit: "contain", imagePosition: "center" },
];

function TeamSection() {
  const isMobile = useIsMobile(640);
  return (
    <section style={{ padding: isMobile ? "64px 22px" : "100px 40px", background: ORANGE_LIGHT }}>
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
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: member.imageFit, objectPosition: member.imagePosition, background: COLORS.white }}
                />}
              </div>
              <h3 style={{ fontFamily: FONTS.heading, fontSize: 17, fontWeight: 800, color: COLORS.ink }}>{member.name}</h3>
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
      <ImpactSection />
      <FoundingStory />
      <TeamSection />
      <ResearchSection />
      <PartnersSection />
      <CallToAction />
      <Footer site="tpp" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}