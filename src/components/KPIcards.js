import React, { useEffect, useState } from "react";

// Animated count up hook
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// Circular progress ring component
function CircleRing({ value, max, color, size = 90, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? value / max : 0;
  const offset = circumference - pct * circumference;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth={stroke}
      />
      {/* Foreground ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
    </svg>
  );
}

// Gauge/semicircle meter component
function GaugeMeter({ value, color, size = 90 }) {
  const radius = (size - 12) / 2;
  const circumference = Math.PI * radius; // half circle
  const pct = value / 100;
  const offset = circumference - pct * circumference;
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      {/* Background arc */}
      <path
        d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
        fill="none"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Foreground arc */}
      <path
        d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s ease" }}
      />
    </svg>
  );
}

// Mini sparkline component
function Sparkline({ data, color, width = 80, height = 36 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      {/* Dot on last point */}
      <circle
        cx={parseFloat(pts[pts.length - 1].split(",")[0])}
        cy={parseFloat(pts[pts.length - 1].split(",")[1])}
        r={3}
        fill={color}
      />
    </svg>
  );
}

const COLORS = {
  teal: "#009B8D",
  pink: "#E8175D",
  purple: "#6B2F8A",
  orange: "#F26522",
};

// ─── MAIN KPI CARDS COMPONENT ───────────────────────────────────────────────
// Replace your existing <div className="stats-grid"> block with this component
// Props:
//   total      - number - total children screened
//   flagged    - number - number of flagged children
//   onTrack    - number - number on track
//   avgScore   - number - average score as a percentage (0-100)
//   trendData  - array  - monthly trend data e.g. [{ month: "Feb", count: 11 }, ...]
//   t          - object - translation strings from your T object

export default function KpiCards({ total, flagged, onTrack, avgScore, trendData, t }) {
  const animatedTotal = useCountUp(total);
  const animatedFlagged = useCountUp(flagged);
  const animatedOnTrack = useCountUp(onTrack);
  const animatedAvg = useCountUp(avgScore);

  // Extract just the count values for the sparkline
  const sparkValues = trendData ? trendData.map(d => d.count) : [];

  return (
    <div className="stats-grid">

      {/* CARD 1 — Total Screened with sparkline */}
      <div className="stat-card c1" style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="stat-label" style={labelStyle}>{t.totalScreened}</div>
            <div className="stat-value" style={{ ...valueStyle, color: COLORS.teal }}>
              {animatedTotal}
            </div>
            <div className="stat-change" style={changeStyle}>↑ {t.thisWeek}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <Sparkline data={sparkValues} color={COLORS.teal} />
            <span style={{ fontSize: 10, color: "#aaa" }}>trend</span>
          </div>
        </div>
      </div>

      {/* CARD 2 — Flagged with circular ring */}
      <div className="stat-card c2" style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="stat-label" style={labelStyle}>{t.flagged}</div>
            <div className="stat-value" style={{ ...valueStyle, color: COLORS.pink }}>
              {animatedFlagged}
            </div>
            <div className="stat-change down" style={{ ...changeStyle, color: COLORS.pink }}>
              {flagged} {t.requireFollowUp}
            </div>
          </div>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <CircleRing value={flagged} max={total} color={COLORS.pink} />
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 13, fontWeight: 600, color: COLORS.pink
            }}>
              {total > 0 ? Math.round((flagged / total) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3 — On Track with circular ring */}
      <div className="stat-card c3" style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="stat-label" style={labelStyle}>{t.onTrack}</div>
            <div className="stat-value" style={{ ...valueStyle, color: COLORS.teal }}>
              {animatedOnTrack}
            </div>
            <div className="stat-change" style={{ ...changeStyle, color: COLORS.teal }}>
              ↑ {t.aboveAverage}
            </div>
          </div>
          <div style={{ position: "relative", width: 90, height: 90 }}>
            <CircleRing value={onTrack} max={total} color={COLORS.teal} />
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 13, fontWeight: 600, color: COLORS.teal
            }}>
              {total > 0 ? Math.round((onTrack / total) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* CARD 4 — Avg Score with gauge meter */}
      <div className="stat-card c4" style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="stat-label" style={{ ...labelStyle, textAlign: "center", marginBottom: 4 }}>
            {t.avgScore}
          </div>
          <GaugeMeter value={avgScore} color={COLORS.orange} size={100} />
          <div style={{ marginTop: -8, fontSize: 26, fontWeight: 700, color: COLORS.orange }}>
            {animatedAvg}<span style={{ fontSize: 14 }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Eastern Cape pilot</div>
        </div>
      </div>

    </div>
  );
}

// Shared inline styles
const cardStyle = {
  borderRadius: 14,
  padding: "18px 20px",
  background: "#fff",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  borderTop: "3px solid transparent",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#888",
  marginBottom: 6,
};

const valueStyle = {
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1,
  marginBottom: 6,
};

const changeStyle = {
  fontSize: 12,
  color: "#888",
};