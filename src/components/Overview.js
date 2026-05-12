import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import KPIcards from "./KPIcards";

const T = {
  en: {
    totalScreened: "Total Screened", flagged: "Flagged", onTrack: "On Track", avgScore: "Avg Score",
    thisWeek: "this week", requireFollowUp: "require follow-up", aboveAverage: "above average",
    perfByDomain: "Performance by Domain", allChildren: "All children",
    resultsDist: "Results Distribution", breakdown: "Breakdown",
    byLanguage: "Language of Assessment", bySchool: "Schools & Regions",
    byAge: "Age Distribution", byGender: "Gender Split",
    devConcerns: "Developmental Concerns", progressing: "Progressing",
    cognitive: "Cognitive", motor: "Fine Motor", language: "Language", social: "Social", emotion: "Emotion", moral: "Moral",
    fiveYr: "5 years", sixYr: "6 years", girls: "Girls", boys: "Boys",
    monthlyTrend: "Monthly Screening Trend", screenings: "Screenings",
    benchmark: "Benchmark", lastUpdated: "Last updated",
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
    devConcerns: "Ontwikkelingsbekommernisse", progressing: "Vordering",
    cognitive: "Kognitief", motor: "Fyn Motories", language: "Taal", social: "Sosiaal", emotion: "Emosie", moral: "Moreel",
    fiveYr: "5 jaar", sixYr: "6 jaar", girls: "Meisies", boys: "Seuns",
    monthlyTrend: "Maandelikse Siftingsneiging", screenings: "Siftings",
    benchmark: "Teiken", lastUpdated: "Laas opgedateer",
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
    devConcerns: "Iingxaki Zentlalo", progressing: "Inkqubela",
    cognitive: "Ukucinga", motor: "Amandla", language: "Ulwimi", social: "Uluntu", emotion: "Imvakalelo", moral: "Isimo",
    fiveYr: "5 iminyaka", sixYr: "6 iminyaka", girls: "Amantombazana", boys: "Abafana",
    monthlyTrend: "Inqwelomoya Yenyanga", screenings: "Ukuhlolwa",
    benchmark: "Umgomo", lastUpdated: "Uhlaziwe",
    summaryUrgent: (n) => `${n} ${n === 1 ? "umntwana udinga" : "abantwana badinga"} ukulandelwa ngokukhawuleza.`,
    summaryAllGood: "Bonke abantwana abahloliweyo basendleleni.",
    summaryMixed: (flagged, onTrack, total) =>
      `${onTrack} kwa ${total} abantwana basendleleni. ${flagged} ${flagged === 1 ? "umntwana ukhombiwe" : "abantwana bakhombiwe"} ukuze balandelwe.`,
    eastCapePilot: "Isifundo seMpuma-Koloni · Bonke abantwana abahloliweyo",
  }
};

const COLORS = { teal: "#009B8D", pink: "#E8175D", purple: "#6B2F8A", orange: "#F26522" };

// Placeholder benchmark — update when Gary provides real targets
const DOMAIN_BENCHMARK = 70;

// Custom tooltip for domain bars
function DomainTooltip({ name, value, color }) {
  const aboveBenchmark = value >= DOMAIN_BENCHMARK;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      minWidth: 160,
    }}>
      <div style={{ fontWeight: 600, color, marginBottom: 4 }}>{name}</div>
      <div style={{ color: "#555" }}>Score: <strong>{value}%</strong></div>
      <div style={{ color: "#555" }}>Benchmark: <strong>{DOMAIN_BENCHMARK}%</strong></div>
      <div style={{
        marginTop: 4,
        fontSize: 11,
        fontWeight: 500,
        color: aboveBenchmark ? COLORS.teal : COLORS.pink
      }}>
        {aboveBenchmark
          ? `${value - DOMAIN_BENCHMARK}% above benchmark`
          : `${DOMAIN_BENCHMARK - value}% below benchmark`}
      </div>
    </div>
  );
}

export default function Overview({ children, lang }) {
  const t = T[lang];
  const [hoveredDomain, setHoveredDomain] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const total = children.length;
  const flagged = children.filter(c => c.flagged).length;
  const onTrack = children.filter(c => c.status === "On Track").length;
  const avgScore = total > 0 ? Math.round(children.reduce((a, c) => a + (c.total || 0), 0) / total) : 0;

  // Auto-generated summary sentence from real data
  const summaryText = total === 0
    ? ""
    : flagged === 0
      ? t.summaryAllGood
      : flagged >= total * 0.5
        ? t.summaryUrgent(flagged)
        : t.summaryMixed(flagged, onTrack, total);

  // Last updated — most recent date in the dataset
  const lastUpdated = children
    .map(c => c.date)
    .filter(Boolean)
    .sort()
    .reverse()[0] || null;

  // Domain averages
  const domainAvg = (key) => total > 0 ? Math.round(children.reduce((a, c) => a + (c[key] || 0), 0) / total) : 0;
  const domains = [
    { name: t.cognitive, value: domainAvg("cognitive"), color: COLORS.teal },
    { name: t.motor, value: domainAvg("motor"), color: COLORS.purple },
    { name: t.language, value: domainAvg("language_score"), color: COLORS.orange },
    { name: t.social, value: domainAvg("social"), color: COLORS.pink },
    { name: t.emotion, value: domainAvg("emotion"), color: "#6B2F8A" },
    { name: t.moral, value: domainAvg("moral"), color: "#F26522" },
  ];

  // Results distribution
  const concerns = children.filter(c => c.status === "Developmental Concerns").length;
  const progressing = children.filter(c => c.status === "Progressing").length;
  const pieData = [
    { name: t.onTrack, value: onTrack },
    { name: t.progressing, value: progressing },
    { name: t.devConcerns, value: concerns },
  ];
  const PIE_COLORS = [COLORS.teal, COLORS.orange, COLORS.pink];

  // Language breakdown
  const langCounts = {};
  children.forEach(c => { langCounts[c.language] = (langCounts[c.language] || 0) + 1; });
  const langData = Object.entries(langCounts).map(([name, value]) => ({ name, value }));
  const LANG_COLORS = [COLORS.teal, COLORS.purple, COLORS.orange];

  // School breakdown
  const schoolCounts = {};
  children.forEach(c => { schoolCounts[c.school] = (schoolCounts[c.school] || 0) + 1; });
  const schoolData = Object.entries(schoolCounts).map(([name, value]) => ({ name: name.split(" ")[0], value }));

  // Age and gender
  const age5 = children.filter(c => c.age === 5).length;
  const age6 = children.filter(c => c.age === 6).length;
  const girls = children.filter(c => c.gender === "Female").length;
  const boys = children.filter(c => c.gender === "Male").length;

  // Monthly trend
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

  return (
    <div className="page-fade">

      {/* PAGE HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Overview</h2>
            <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0" }}>{t.eastCapePilot}</p>
          </div>
          {lastUpdated && (
            <div style={{
              fontSize: 11,
              color: "#aaa",
              background: "#f5f5f5",
              borderRadius: 20,
              padding: "4px 12px",
              marginTop: 4,
            }}>
              {t.lastUpdated}: {lastUpdated}
            </div>
          )}
        </div>
        {summaryText && (
          <div style={{
            marginTop: 10,
            padding: "10px 16px",
            background: flagged >= total * 0.5 ? "#FFF3F3" : "#F0FAF7",
            borderLeft: `4px solid ${flagged >= total * 0.5 ? COLORS.pink : COLORS.teal}`,
            borderRadius: "0 8px 8px 0",
            fontSize: 13,
            color: "#333",
            fontWeight: 500,
          }}>
            {summaryText}
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <KPIcards
        total={total}
        flagged={flagged}
        onTrack={onTrack}
        avgScore={avgScore}
        trendData={trendData}
        t={t}
      />

      {/* ROW 1: DOMAIN PERFORMANCE + PIE */}
      <div className="two-col">
        <div className="card" style={{ position: "relative" }}>
          <div className="card-header">
            <div className="card-title">{t.perfByDomain}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#888" }}>
                <div style={{ width: 14, height: 2, borderTop: "2px dashed #bbb" }}></div>
                <span>{t.benchmark} ({DOMAIN_BENCHMARK}%)</span>
              </div>
              <span className="card-badge badge-teal">{t.allChildren}</span>
            </div>
          </div>

          <div className="bar-chart">
            {domains.map((d) => (
              <div
                key={d.name}
                className="bar-row"
                style={{ position: "relative", cursor: "pointer" }}
                onMouseEnter={(e) => {
                  setHoveredDomain(d);
                  setTooltipPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHoveredDomain(null)}
              >
                <div className="bar-label" style={{ fontWeight: 500 }}>{d.name}</div>
                <div className="bar-track" style={{ position: "relative" }}>
                  <div
                    className="bar-fill"
                    style={{
                      width: `${d.value}%`,
                      background: d.color,
                      opacity: hoveredDomain && hoveredDomain.name !== d.name ? 0.4 : 1,
                      transition: "opacity 0.2s, width 0.6s ease",
                    }}
                  ></div>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: `${DOMAIN_BENCHMARK}%`,
                    width: 2,
                    height: "100%",
                    borderLeft: "2px dashed #bbb",
                    zIndex: 2,
                  }}></div>
                </div>
                <div className="bar-pct" style={{
                  fontWeight: 600,
                  color: d.value >= DOMAIN_BENCHMARK ? COLORS.teal : COLORS.pink
                }}>
                  {d.value}%
                </div>
              </div>
            ))}
          </div>

          {hoveredDomain && (
            <div style={{
              position: "fixed",
              top: tooltipPos.y + 12,
              left: tooltipPos.x + 12,
              zIndex: 1000,
              pointerEvents: "none",
            }}>
              <DomainTooltip
                name={hoveredDomain.name}
                value={hoveredDomain.value}
                color={hoveredDomain.color}
              />
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.resultsDist}</div>
            <span className="card-badge badge-purple">{t.breakdown}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
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
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={schoolData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.teal} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.byLanguage}</div>
            <span className="card-badge badge-purple">{t.breakdown}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={langData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
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
          <div className="card-header">
            <div className="card-title">{t.byAge}</div>
          </div>
          <div className="bar-chart">
            <div className="bar-row">
              <div className="bar-label">{t.fiveYr}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${total > 0 ? (age5 / total) * 100 : 0}%`, background: COLORS.teal }}></div>
              </div>
              <div className="bar-pct">{age5}</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">{t.sixYr}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${total > 0 ? (age6 / total) * 100 : 0}%`, background: COLORS.purple }}></div>
              </div>
              <div className="bar-pct">{age6}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">{t.byGender}</div>
          </div>
          <div className="bar-chart">
            <div className="bar-row">
              <div className="bar-label">{t.girls}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${total > 0 ? (girls / total) * 100 : 0}%`, background: COLORS.pink }}></div>
              </div>
              <div className="bar-pct">{girls}</div>
            </div>
            <div className="bar-row">
              <div className="bar-label">{t.boys}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${total > 0 ? (boys / total) * 100 : 0}%`, background: COLORS.orange }}></div>
              </div>
              <div className="bar-pct">{boys}</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">{t.monthlyTrend}</div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke={COLORS.teal}
                strokeWidth={2.5}
                dot={{ fill: COLORS.teal, r: 4 }}
                name={t.screenings}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}