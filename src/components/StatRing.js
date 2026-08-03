// StatRing.js — a small circular progress ring with a number in the
// centre. Used on the role home screens instead of plain stat-card
// numbers, so the overview reads more like a personal dashboard than a
// spreadsheet summary.
 
import React from "react";
 
export default function StatRing({ value, max = 10, size = 74, stroke = 8, color, label, sublabel }) {
  const safeMax = Math.max(max, value, 1);
  const pct = Math.min(1, value / safeMax);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
 
  return (
    <div className="rh-ring-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize={size * 0.3} fill="var(--ink, #1a1a2e)">
          {value}
        </text>
      </svg>
      <div className="rh-ring-label">{label}</div>
      {sublabel && <div className="rh-ring-sublabel">{sublabel}</div>}
    </div>
  );
}