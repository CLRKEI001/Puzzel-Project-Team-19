import React, { useState, useMemo } from "react";

const TOWN_COORDS = {
  Adelaide:    { x: 285, y: 178 },
  Komani:      { x: 310, y: 155 },
  Stutterheim: { x: 330, y: 140 },
  Fort:        { x: 265, y: 195 },
  edcsc:       { x: 298, y: 168 },
  "East London":   { x: 355, y: 175 },
  "King William's Town": { x: 338, y: 160 },
  Mthatha:     { x: 390, y: 130 },
  Grahamstown: { x: 305, y: 205 },
  PortElizabeth: { x: 255, y: 230 },
};

const EC_PATH = `
  M 120,80 L 160,60 L 220,55 L 280,50 L 340,48 L 400,55 L 440,70
  L 460,95 L 455,120 L 445,145 L 420,165 L 410,190 L 400,210
  L 385,225 L 360,240 L 330,260 L 300,270 L 265,268 L 235,260
  L 210,245 L 185,235 L 160,230 L 135,225 L 115,210 L 105,190
  L 100,165 L 105,140 L 110,115 L 115,95 Z
`;

const COLORS = {
  teal: "#009B8D",
  pink: "#E8175D",
  orange: "#F26522",
  purple: "#6B2F8A",
};

function getPinColor(count, max) {
  const pct = max > 0 ? count / max : 0;
  if (pct > 0.6) return COLORS.teal;
  if (pct > 0.3) return COLORS.orange;
  return COLORS.pink;
}

const defaultPins = [
  { name: "Adelaide",    count: 7, ...TOWN_COORDS.Adelaide },
  { name: "Komani",      count: 6, ...TOWN_COORDS.Komani },
  { name: "Stutterheim", count: 5, ...TOWN_COORDS.Stutterheim },
  { name: "Fort",        count: 5, ...TOWN_COORDS.Fort },
  { name: "edcsc",       count: 3, ...TOWN_COORDS.edcsc },
];

function BarRow({ name, count, max }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{name}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${(count / max) * 100}%`, background: "var(--teal)" }} />
      </div>
      <span className="bar-pct">{count}</span>
    </div>
  );
}

export default function SchoolsMap({ screenings = [], t = {} }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const townData = useMemo(() => {
    const counts = {};
    screenings.forEach(s => {
      const town = s.town || s.school || s.location || s.region;
      if (town) counts[town] = (counts[town] || 0) + 1;
    });
    return counts;
  }, [screenings]);

  const pins = useMemo(() => {
    return Object.entries(townData).map(([name, count], i) => {
      const coords = TOWN_COORDS[name] || {
        x: 180 + (i * 37) % 220,
        y: 100 + (i * 53) % 130,
      };
      return { name, count, ...coords };
    });
  }, [townData]);

  const activePins = pins.length > 0 ? pins : defaultPins;
  const maxCount = Math.max(...activePins.map(p => p.count), 1);
  const totalScreened = activePins.reduce((a, p) => a + p.count, 0);

  return (
    <div>

      {/* ALWAYS VISIBLE: bar chart */}
      <div className="bar-chart" style={{ marginBottom: 12 }}>
        {activePins
          .sort((a, b) => b.count - a.count)
          .map(p => <BarRow key={p.name} name={p.name} count={p.count} max={maxCount} />)
        }
      </div>

      {/* TOGGLE BUTTON */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <button
          onClick={() => { setExpanded(e => !e); setSelectedPin(null); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            border: "1.5px solid rgba(0,155,141,0.25)",
            background: expanded ? "var(--teal)" : "transparent",
            color: expanded ? "#fff" : "var(--teal)",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all 0.18s",
          }}
        >
          {expanded ? <>✕ Close map</> : <>🗺 View on map</>}
        </button>
      </div>

      {/* EXPANDED MAP */}
      {expanded && (
        <div style={{
          display: "grid", gridTemplateColumns: window.innerWidth < 500 ? "1fr" : "1fr 220px",
          marginTop: 16, animation: "fadeIn 0.3s ease",
        }}>

          {/* SVG Map */}
          <div style={{
            background: "linear-gradient(135deg, #e8f5f4 0%, #f0e8f7 100%)",
            borderRadius: 12, overflow: "hidden", position: "relative",
          }}>
            <svg viewBox="80 40 400 250" style={{ width: "100%", height: 300, display: "block" }}>

              {/* Province outline */}
              <path d={EC_PATH} fill="#d4ede9" stroke="#009B8D" strokeWidth="1.5" strokeOpacity="0.4" />

              {/* Grid lines */}
              {[100, 150, 200, 250].map(y => (
                <line key={y} x1="80" y1={y} x2="480" y2={y} stroke="rgba(0,155,141,0.08)" strokeWidth="1" />
              ))}
              {[120, 180, 240, 300, 360, 420].map(x => (
                <line key={x} x1={x} y1="40" x2={x} y2="290" stroke="rgba(0,155,141,0.08)" strokeWidth="1" />
              ))}

              {/* Pins */}
              {activePins.map(pin => {
                const color = getPinColor(pin.count, maxCount);
                const isHovered = hoveredPin === pin.name;
                const isSelected = selectedPin?.name === pin.name;
                const r = 6 + (pin.count / maxCount) * 10;
                return (
                  <g key={pin.name} style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredPin(pin.name)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={() => setSelectedPin(isSelected ? null : pin)}
                  >
                    {(isHovered || isSelected) && (
                      <circle cx={pin.x} cy={pin.y} r={r + 8}
                        fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
                    )}
                    <circle cx={pin.x} cy={pin.y} r={r}
                      fill={color} opacity={isSelected ? 1 : 0.85} stroke="#fff" strokeWidth="2" />
                    <text x={pin.x} y={pin.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fill="#fff" fontSize={r > 10 ? 9 : 7} fontWeight="700">
                      {pin.count}
                    </text>
                    <text x={pin.x} y={pin.y + r + 11} textAnchor="middle"
                      fill="#1a1a2e" fontSize="9" fontWeight="600" opacity="0.8">
                      {pin.name}
                    </text>
                  </g>
                );
              })}

              {/* Hover tooltip */}
              {hoveredPin && (() => {
                const pin = activePins.find(p => p.name === hoveredPin);
                if (!pin) return null;
                return (
                  <g pointerEvents="none">
                    <rect x={pin.x + 12} y={pin.y - 28} width={115} height={44}
                      rx={6} ry={6} fill="#1a1a2e" opacity={0.92} />
                    <text x={pin.x + 18} y={pin.y - 12} fill="#fff" fontSize={11} fontWeight="700">
                      {pin.name}
                    </text>
                    <text x={pin.x + 18} y={pin.y + 4} fill="#aaa" fontSize={10}>
                      {pin.count} screened · {Math.round((pin.count / totalScreened) * 100)}%
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* Legend */}
            <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 10 }}>
              {[
                { color: COLORS.teal, label: "High" },
                { color: COLORS.orange, label: "Moderate" },
                { color: COLORS.pink, label: "Low" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                  <span style={{ fontSize: 10, color: "#444", fontWeight: 600 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.8px", color: "#8888a8", marginBottom: 2 }}>
              {selectedPin ? "Selected" : "All Schools"}
            </div>

            {selectedPin ? (
              /* Detail view */
              <div style={{ background: "linear-gradient(135deg, #e0f5f3, #f0e8f7)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", marginBottom: 4 }}>
                  {selectedPin.name}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.teal, lineHeight: 1 }}>
                  {selectedPin.count}
                </div>
                <div style={{ fontSize: 11, color: "#8888a8", marginTop: 2 }}>children screened</div>
                <div style={{ marginTop: 10, height: 4, borderRadius: 4, background: "rgba(0,0,0,0.07)" }}>
                  <div style={{
                    height: "100%", borderRadius: 4, background: COLORS.teal,
                    width: `${(selectedPin.count / maxCount) * 100}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ fontSize: 10, color: "#8888a8", marginTop: 4 }}>
                  {Math.round((selectedPin.count / totalScreened) * 100)}% of total
                </div>
                <button onClick={() => setSelectedPin(null)}
                  style={{ marginTop: 10, fontSize: 11, color: COLORS.teal,
                    background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  ← Back to all
                </button>
              </div>
            ) : (
              /* School list */
              <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", maxHeight: 260 }}>
                {activePins
                  .sort((a, b) => b.count - a.count)
                  .map(pin => (
                    <div key={pin.name}
                      onClick={() => setSelectedPin(pin)}
                      onMouseEnter={() => setHoveredPin(pin.name)}
                      onMouseLeave={() => setHoveredPin(null)}
                      style={{
                        padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                        background: hoveredPin === pin.name ? "#f0faf9" : "#fafafa",
                        border: "1px solid rgba(0,155,141,0.12)",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{pin.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 900, color: getPinColor(pin.count, maxCount) }}>
                          {pin.count}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, height: 3, borderRadius: 3, background: "rgba(0,0,0,0.06)" }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          background: getPinColor(pin.count, maxCount),
                          width: `${(pin.count / maxCount) * 100}%`,
                          transition: "width 0.4s ease",
                        }} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}