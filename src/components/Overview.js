import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from "recharts";
import KPIcards from "./KPIcards";
import { downloadPDF, downloadExcel } from "./reportGenerator";
import SchoolsMap from "./SchoolsMap";

const T = {
  en: {
    totalScreened: "Total Screened", flagged: "Flagged", onTrack: "On Track", avgScore: "Avg Score",
    thisWeek: "this week", requireFollowUp: "require follow-up", aboveAverage: "above average",
    perfByDomain: "Performance by Domain", allChildren: "All children",
    resultsDist: "Results Distribution", breakdown: "Breakdown",
    byLanguage: "Language of Assessment", bySchool: "Schools & Regions",
    byAge: "Age Distribution", byGender: "Gender Split",
    devConcerns: "Developmental Concerns", progressing: "Monitor Needed",
    cognitive: "Cognitive", motor: "Fine Motor", language: "Language", social: "Social", emotion: "Emotion", moral: "Moral",
    fiveYr: "5 years", sixYr: "6 years", girls: "Girls", boys: "Boys",
    monthlyTrend: "Monthly Screening Trend", screenings: "Screenings",
    benchmark: "Benchmark", lastUpdated: "Last updated",
    compareBy: "Compare by", overall: "Overall", school: "School", age: "Age", gender: "Gender", langLabel: "Language",
    keyInsights: "Key insights",
    summaryUrgent: (n) => `${n} ${n === 1 ? "child requires" : "children require"} urgent follow-up.`,
    summaryAllGood: "All screened children are currently on track.",
    summaryMixed: (flagged, onTrack, total) =>
      `${onTrack} of ${total} children are on track. ${flagged} ${flagged === 1 ? "child has" : "children have"} been flagged for follow-up.`,
    eastCapePilot: "Eastern Cape pilot · All screened children",
  },
  af: {
    totalScreened: "Totaal Gesif", flagged: "Gevlag", onTrack: "Op Koers", avgScore: "Gem Punt",
    thisWeek: "hierdie week", requireFollowUp: "benodig opvolg", aboveAverage: "bo gemiddeld",
    perfByDomain: "Prestasie per Domein", allChildren: "Alle kinders",
    resultsDist: "Resultaatverspreiding", breakdown: "Uiteensetting",
    byLanguage: "Taal van Assessering", bySchool: "Skole & Streke",
    byAge: "Ouderdomsverdeling", byGender: "Geslagsverdeling",
    devConcerns: "Ontwikkelingsbekommernisse", progressing: "Monitering Benodig",
    cognitive: "Kognitief", motor: "Fyn Motories", language: "Taal", social: "Sosiaal", emotion: "Emosie", moral: "Moreel",
    fiveYr: "5 jaar", sixYr: "6 jaar", girls: "Meisies", boys: "Seuns",
    monthlyTrend: "Maandelikse Siftingsneiging", screenings: "Siftings",
    benchmark: "Teiken", lastUpdated: "Laas opgedateer",
    compareBy: "Vergelyk per", overall: "Algeheel", school: "Skool", age: "Ouderdom", gender: "Geslag", langLabel: "Taal",
    keyInsights: "Sleutelinsigte",
    summaryUrgent: (n) => `${n} ${n === 1 ? "kind benodig" : "kinders benodig"} dringende opvolg.`,
    summaryAllGood: "Alle gesifde kinders is tans op koers.",
    summaryMixed: (flagged, onTrack, total) =>
      `${onTrack} van ${total} kinders is op koers. ${flagged} ${flagged === 1 ? "kind is" : "kinders is"} gevlag vir opvolg.`,
    eastCapePilot: "Oos-Kaap loodsprojek · Alle gesifde kinders",
  },
  xh: {
    totalScreened: "Isibalaniso Esipheleleyo", flagged: "Ezikhombiweyo", onTrack: "Esendleleni", avgScore: "Amanqaku Avg",
    thisWeek: "evekini", requireFollowUp: "zifuna ukulandelwa", aboveAverage: "ngaphezulu kwemvg",
    perfByDomain: "Indlela Ngomhlaba", allChildren: "Bonke abantwana",
    resultsDist: "Ukusasazwa Kweziphumo", breakdown: "Uhlalutyo",
    byLanguage: "Ulwimi Lokuhlolwa", bySchool: "Izikolo & Iindawo",
    byAge: "Ukusasazwa Ngeminyaka", byGender: "Ukwahlulwa ngesini",
    devConcerns: "Iingxaki Zentlalo", progressing: "Ukulandela Kuyadingeka",
    cognitive: "Ukucinga", motor: "Amandla", language: "Ulwimi", social: "Uluntu", emotion: "Imvakalelo", moral: "Isimo",
    fiveYr: "5 iminyaka", sixYr: "6 iminyaka", girls: "Amantombazana", boys: "Abafana",
    monthlyTrend: "Inqwelomoya Yenyanga", screenings: "Ukuhlolwa",
    benchmark: "Umgomo", lastUpdated: "Uhlaziwe",
    compareBy: "Thelekisa nge", overall: "Jikelele", school: "Isikolo", age: "Iminyaka", gender: "Isini", langLabel: "Ulwimi",
    keyInsights: "Iingcinga ezibalulekileyo",
    summaryUrgent: (n) => `${n} ${n === 1 ? "umntwana udinga" : "abantwana badinga"} ukulandelwa ngokukhawuleza.`,
    summaryAllGood: "Bonke abantwana abahloliweyo basendleleni.",
    summaryMixed: (flagged, onTrack, total) =>
      `${onTrack} kwa ${total} abantwana basendleleni. ${flagged} ${flagged === 1 ? "umntwana ukhombiwe" : "abantwana bakhombiwe"} ukuze balandelwe.`,
    eastCapePilot: "Isifundo seMpuma-Koloni · Bonke abantwana abahloliweyo",
  }
};

const COLORS = { teal: "#009B8D", pink: "#E8175D", purple: "#6B2F8A", orange: "#F26522" };
const STATUS_DESCRIPTIONS = {
  en: {
    "On Track": "Child is developing as expected for their age with no concerns.",
    "Monitor Needed": "Child is progressing but may need additional support or observation.",
    "Developmental Concerns": "Child has been flagged and requires follow-up or intervention.",
  },
  af: {
    "Op Koers": "Kind ontwikkel soos verwag vir hul ouderdom sonder bekommernisse.",
    "Monitering Benodig": "Kind vorder maar mag ekstra ondersteuning of waarneming benodig.",
    "Ontwikkelingsbekommernisse": "Kind is gevlag en benodig opvolg of ingryping.",
  },
  xh: {
    "Esendleleni": "Umntwana uyakhula ngendlela elindelekileyo ngokulingana neminyaka yakhe.",
    "Ukulandela Kuyadingeka": "Umntwana uyaqhubeka kodwa angadinga inkxaso eyongezelelekileyo.",
    "Iingxaki Zentlalo": "Umntwana ukhombiwe kwaye udinga ukulandelwa okanye ukungenelela.",
  },
};
const DOMAIN_BENCHMARK = 70;
const DOMAIN_KEYS = ["cognitive", "motor", "language_score", "social", "emotion", "moral"];
const GROUP_COLORS = ["#009B8D", "#6B2F8A", "#F26522", "#E8175D", "#378ADD", "#639922"];

function domainAvgForGroup(group, key) {
  if (!group.length) return 0;
  return Math.round(group.reduce((a, c) => a + (c[key] || 0), 0) / group.length);
}

function DomainTooltip({ name, value, color }) {
  const above = value >= DOMAIN_BENCHMARK;
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: 160 }}>
      <div style={{ fontWeight: 600, color, marginBottom: 4 }}>{name}</div>
      <div style={{ color: "#555" }}>Score: <strong>{value}%</strong></div>
      <div style={{ color: "#555" }}>Benchmark: <strong>{DOMAIN_BENCHMARK}%</strong></div>
      <div style={{ marginTop: 4, fontSize: 11, fontWeight: 500, color: above ? COLORS.teal : COLORS.pink }}>
        {above ? `${value - DOMAIN_BENCHMARK}% above benchmark` : `${DOMAIN_BENCHMARK - value}% below benchmark`}
      </div>
    </div>
  );
}

export default function Overview({ children, lang }) {
  const t = T[lang];
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [compareMode, setCompareMode] = useState("overall");

  const total = children.length;
  const flagged = children.filter(c => c.flagged).length;
  const onTrack = children.filter(c => c.status === "On Track").length;
  const avgScore = total > 0 ? Math.round(children.reduce((a, c) => a + (c.total || 0), 0) / total) : 0;

  const summaryText = total === 0 ? ""
    : flagged === 0 ? t.summaryAllGood
    : flagged >= total * 0.5 ? t.summaryUrgent(flagged)
    : t.summaryMixed(flagged, onTrack, total);

  const lastUpdated = children.map(c => c.date).filter(Boolean).sort().reverse()[0] || null;

  // ── DOMAIN DATA ──────────────────────────────────────────────────────────
  const domainNames = [t.cognitive, t.motor, t.language, t.social, t.emotion, t.moral];

  // Overall domain averages (single bars)
  const overallDomains = DOMAIN_KEYS.map((key, i) => ({
    name: domainNames[i],
    value: domainAvgForGroup(children, key),
    color: Object.values(COLORS)[i % 4],
  }));

  // Get unique group values for compare mode
  const getGroups = () => {
    if (compareMode === "school") return [...new Set(children.map(c => c.school).filter(Boolean))].map(s => s.split(" ")[0]);
    if (compareMode === "age") return [5, 6];
    if (compareMode === "gender") return ["Female", "Male"];
    if (compareMode === "language") return [...new Set(children.map(c => c.language).filter(Boolean))];
    return [];
  };

  const getGroupFilter = (g) => {
    if (compareMode === "school") return children.filter(c => c.school && c.school.startsWith(g));
    if (compareMode === "age") return children.filter(c => c.age === g);
    if (compareMode === "gender") return children.filter(c => c.gender === g);
    if (compareMode === "language") return children.filter(c => c.language === g);
    return children;
  };

  const groups = getGroups();

  // Build comparison chart data — one object per domain with a key per group
  const comparisonData = DOMAIN_KEYS.map((key, i) => {
    const obj = { domain: domainNames[i] };
    groups.forEach(g => { obj[String(g)] = domainAvgForGroup(getGroupFilter(g), key); });
    return obj;
  });

  // ── KEY INSIGHTS ─────────────────────────────────────────────────────────
  const insights = [];

  // Weakest domain overall
  const weakest = [...overallDomains].sort((a, b) => a.value - b.value)[0];
  if (weakest && weakest.value < DOMAIN_BENCHMARK) {
    insights.push({
      color: COLORS.pink,
      text: `${weakest.name} is the weakest domain at ${weakest.value}%, which is ${DOMAIN_BENCHMARK - weakest.value}% below benchmark.`
    });
  }

  // School with highest concern rate
  const schoolNames = [...new Set(children.map(c => c.school).filter(Boolean))];
  if (schoolNames.length > 1) {
    const schoolRates = schoolNames.map(s => {
      const group = children.filter(c => c.school === s);
      const rate = group.length > 0 ? Math.round((group.filter(c => c.status === "Developmental Concerns").length / group.length) * 100) : 0;
      return { school: s.split(" ")[0], rate };
    });
    const worstSchool = schoolRates.sort((a, b) => b.rate - a.rate)[0];
    if (worstSchool && worstSchool.rate > 0) {
      insights.push({
        color: COLORS.orange,
        text: `${worstSchool.school} has the highest rate of developmental concerns at ${worstSchool.rate}% of children screened.`
      });
    }
  }

  // Age group gap
  const age5group = children.filter(c => c.age === 5);
  const age6group = children.filter(c => c.age === 6);
  if (age5group.length > 0 && age6group.length > 0) {
    const avg5 = Math.round(age5group.reduce((a, c) => a + (c.total || 0), 0) / age5group.length);
    const avg6 = Math.round(age6group.reduce((a, c) => a + (c.total || 0), 0) / age6group.length);
    const diff = Math.abs(avg5 - avg6);
    if (diff >= 5) {
      insights.push({
        color: COLORS.teal,
        text: `5-year-olds score ${diff}% ${avg5 > avg6 ? "higher" : "lower"} than 6-year-olds on average.`
      });
    }
  }

  // Strongest domain
  const strongest = [...overallDomains].sort((a, b) => b.value - a.value)[0];
  if (strongest && strongest.value >= DOMAIN_BENCHMARK) {
    insights.push({
      color: COLORS.teal,
      text: `${strongest.name} is the strongest domain at ${strongest.value}%, which is ${strongest.value - DOMAIN_BENCHMARK}% above benchmark.`
    });
  }

  // ── OTHER CHART DATA ──────────────────────────────────────────────────────
  const concerns = children.filter(c => c.status === "Developmental Concerns").length;
  const progressing = children.filter(c => c.status === "Progressing").length;
  const pieData = [
    { name: t.onTrack, value: onTrack },
    { name: t.progressing, value: progressing },
    { name: t.devConcerns, value: concerns },
  ];
  const PIE_COLORS = [COLORS.teal, COLORS.orange, COLORS.pink];

  const langCounts = {};
  children.forEach(c => { langCounts[c.language] = (langCounts[c.language] || 0) + 1; });
  const langData = Object.entries(langCounts).map(([name, value]) => ({ name, value }));
  const LANG_COLORS = [COLORS.teal, COLORS.purple, COLORS.orange];

  const schoolCounts = {};
  children.forEach(c => { schoolCounts[c.school] = (schoolCounts[c.school] || 0) + 1; });
  const schoolData = Object.entries(schoolCounts).map(([name, value]) => ({ name: name.split(" ")[0], value }));

  const age5 = children.filter(c => c.age === 5).length;
  const age6 = children.filter(c => c.age === 6).length;
  const girls = children.filter(c => c.gender === "Female").length;
  const boys = children.filter(c => c.gender === "Male").length;

  const monthMap = { "02": "Feb", "03": "Mar", "04": "Apr" };
  const monthlyCounts = {};
  children.forEach(c => {
    if (c.date) {
      const m = c.date.split("-")[1];
      const label = monthMap[m] || m;
      monthlyCounts[label] = (monthlyCounts[label] || 0) + 1;
    }
  });
  const trendData = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));

  const compareModes = [
    { key: "overall", label: t.overall },
    { key: "school", label: t.school },
    { key: "age", label: t.age },
    { key: "gender", label: t.gender },
    { key: "language", label: t.langLabel },
  ];

 return (
    <div className="page-fade">

      {/* PAGE HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 }}></h2>
            <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0" }}></p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lastUpdated && (
              <div style={{ fontSize: 11, color: "#aaa", background: "#f5f5f5", borderRadius: 20, padding: "4px 12px" }}>
                {t.lastUpdated}: {lastUpdated}
              </div>
            )}
            <button
              onClick={() => downloadExcel({ children, compareMode })}
              style={{ padding: "6px 12px", borderRadius: 8, border: "0.5px solid #e5e5e5", background: "#fff", fontSize: 12, color: "#555", cursor: "pointer" }}
            >
              Export Excel
            </button>
            <button
              onClick={() => downloadPDF({ children, compareMode, insights, lang })}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#009B8D", color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              Download PDF
            </button>
          </div>
        </div>
        {summaryText && (
          <div style={{
            marginTop: 10, padding: "10px 16px",
            background: flagged >= total * 0.5 ? "#FFF3F3" : "#F0FAF7",
            borderLeft: `4px solid ${flagged >= total * 0.5 ? COLORS.pink : COLORS.teal}`,
            borderRadius: "0 8px 8px 0", fontSize: 13, color: "#333", fontWeight: 500,
          }}>
            {summaryText}
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <KPIcards total={total} flagged={flagged} onTrack={onTrack} avgScore={avgScore} trendData={trendData} t={t} />

      {/* KEY INSIGHTS STRIP */}
      {insights.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            {t.keyInsights}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(insights.length, 2)}, 1fr)`, gap: 8 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                background: "#fff", border: `0.5px solid ${ins.color}33`,
                borderLeft: `4px solid ${ins.color}`,
                borderRadius: "0 8px 8px 0", padding: "6px 10px",
                fontSize: 10, color: "#333",
              }}>
                {ins.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROW 1: DOMAIN PERFORMANCE + PIE */}
      <div className="two-col">
        <div className="card" style={{ position: "relative" }}>
          <div className="card-header" style={{ flexWrap: "wrap", gap: 8 }}>
            <div className="card-title">{t.perfByDomain}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Compare by toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f5f5f5", borderRadius: 20, padding: "3px 6px" }}>
                <span style={{ fontSize: 11, color: "#888", marginRight: 2 }}>{t.compareBy}:</span>
                {compareModes.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setCompareMode(m.key)}
                    style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, border: "none", cursor: "pointer",
                      background: compareMode === m.key ? COLORS.teal : "transparent",
                      color: compareMode === m.key ? "#E1F5EE" : "#555",
                      fontWeight: compareMode === m.key ? 500 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {compareMode === "overall" && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#888" }}>
                  <div style={{ width: 14, height: 2, borderTop: "2px dashed #bbb" }}></div>
                  <span>{t.benchmark} ({DOMAIN_BENCHMARK}%)</span>
                </div>
              )}
            </div>
          </div>

          {/* OVERALL MODE — single bars with benchmark */}
          {compareMode === "overall" && (
            <div className="bar-chart">
              {overallDomains.map((d) => (
                <div
                  key={d.name}
                  className="bar-row"
                  style={{ position: "relative", cursor: "pointer" }}
                  onMouseEnter={(e) => { setHoveredDomain(d); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredDomain(null)}
                >
                  <div className="bar-label" style={{ fontWeight: 500 }}>{d.name}</div>
                  <div className="bar-track" style={{ position: "relative" }}>
                    <div className="bar-fill" style={{
                      width: `${d.value}%`, background: d.color,
                      opacity: hoveredDomain && hoveredDomain.name !== d.name ? 0.4 : 1,
                      transition: "opacity 0.2s, width 0.6s ease",
                    }}></div>
                    <div style={{
                      position: "absolute", top: 0, left: `${DOMAIN_BENCHMARK}%`,
                      width: 2, height: "100%", borderLeft: "2px dashed #bbb", zIndex: 2,
                    }}></div>
                  </div>
                  <div className="bar-pct" style={{ fontWeight: 600, color: d.value >= DOMAIN_BENCHMARK ? COLORS.teal : COLORS.pink }}>
                    {d.value}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* COMPARE MODE — grouped bar chart */}
          {compareMode !== "overall" && (
            <div>
              {/* Legend */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                {groups.map((g, i) => (
                  <div key={String(g)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: GROUP_COLORS[i % GROUP_COLORS.length] }}></div>
                    {String(g)}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="domain" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  {groups.map((g, i) => (
                    <Bar key={String(g)} dataKey={String(g)} fill={GROUP_COLORS[i % GROUP_COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={20} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {hoveredDomain && compareMode === "overall" && (
            <div style={{ position: "fixed", top: tooltipPos.y + 12, left: tooltipPos.x + 12, zIndex: 1000, pointerEvents: "none" }}>
              <DomainTooltip name={hoveredDomain.name} value={hoveredDomain.value} color={hoveredDomain.color} />
            </div>
          )}
        </div>

{/* This is for the results distribution pie chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.resultsDist}</div>
            <span className="card-badge badge-purple">{t.breakdown}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip
              wrapperStyle={{ zIndex: 1000 }}
              filterNull={false}
              cursor={ false }
  content={({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const name = payload[0].name;
    const value = payload[0].value;
    const descriptions = STATUS_DESCRIPTIONS[lang] || STATUS_DESCRIPTIONS.en;
    const description = descriptions[name] || "";
    return (
      <div style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxWidth: 200,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4, color: payload[0].payload.fill }}>
          {name}
        </div>
        <div style={{ color: "#555", marginBottom: 6 }}>
          {value} {value === 1 ? "child" : "children"}
        </div>
        <div style={{ color: "#777", fontSize: 11, lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    );
  }}
/>
              
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: SCHOOL + LANGUAGE */}
      <div className="two-col">
  <div className="card">
    <div className="card-header">
      <div className="card-title">{t.bySchool}</div>
      <span className="card-badge badge-orange">Eastern Cape</span>
    </div>
    <SchoolsMap screenings={children} t={t} />
  </div>
  <div className="card">
    <div className="card-header">
      <div className="card-title">{t.byLanguage}</div>
      <span className="card-badge badge-purple">{t.breakdown}</span>
    </div>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={langData} cx="50%" cy="50%" outerRadius={50} dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
          {langData.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>  

      {/* ROW 3: AGE + GENDER + MONTHLY TREND */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: "20px", marginBottom: "20px" }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title">{t.byAge}</div></div>
          <div className="bar-chart">
            <div className="bar-row">
              <div className="bar-label">{t.fiveYr}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${total > 0 ? (age5 / total) * 100 : 0}%`, background: COLORS.teal }}></div></div>
              <div className="bar-pct">{age5}</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">{t.sixYr}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${total > 0 ? (age6 / total) * 100 : 0}%`, background: COLORS.purple }}></div></div>
              <div className="bar-pct">{age6}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title">{t.byGender}</div></div>
          <div className="bar-chart">
            <div className="bar-row">
              <div className="bar-label">{t.girls}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${total > 0 ? (girls / total) * 100 : 0}%`, background: COLORS.pink }}></div></div>
              <div className="bar-pct">{girls}</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">{t.boys}</div>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${total > 0 ? (boys / total) * 100 : 0}%`, background: COLORS.orange }}></div></div>
              <div className="bar-pct">{boys}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><div className="card-title">{t.monthlyTrend}</div></div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={COLORS.teal} strokeWidth={2.5} dot={{ fill: COLORS.teal, r: 4 }} name={t.screenings} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}