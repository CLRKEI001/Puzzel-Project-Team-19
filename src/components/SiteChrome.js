import React, { useState, useEffect, useRef } from "react";

// Shared design tokens and page chrome for every public-facing page.
// Homepage, About, HowItWorks and Trainingpage all import from here so the
// navigation, logo and footer stay identical across the site.

export const COLORS = {
  teal: "#009B8D",
  tealDark: "#007f74",
  tealLight: "#E0F5F3",
  pink: "#E8175D",
  pinkLight: "#FCE6EE",
  purple: "#6B2F8A",
  purpleLight: "#F0E8F7",
  orange: "#F26522",
  orangeLight: "#FEF0E7",
  // Deep berry maroon — the colour the Puzzle Project wordmark is set in
  maroon: "#7B2B3F",
  maroonLight: "#F7EAEE",
  dark: "#1A1A2E",
  ink: "#1a1a2e",
  inkMid: "#444460",
  inkFaint: "#8888a8",
  surface: "#F7F6FF",
  white: "#ffffff",
  border: "rgba(100,80,160,0.12)",
};

export const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito Sans', sans-serif; }
`;

// ---- Jigsaw piece geometry ----------------------------------------------
// A real puzzle piece is a square whose edges carry a "tab" (a mushroom-shaped
// knob that sticks out) or a "blank" (the matching socket). The tab is drawn
// with bezier curves: a narrow neck that undercuts, then a wide round bulb.
//
// Each edge is described as  1 = tab, -1 = blank, 0 = flat (a straight border).
// The body of the piece occupies 0..100; tabs extend 22 units beyond that, so
// the viewBox is padded by 28 on every side.

export const PIECE_BODY = 100;   // size of the square body
export const PIECE_PAD = 28;     // room for tabs on each side
export const PIECE_VIEWBOX = `${-PIECE_PAD} ${-PIECE_PAD} ${PIECE_BODY + PIECE_PAD * 2} ${PIECE_BODY + PIECE_PAD * 2}`;

// Maps a point on a local edge (running left→right, tab bulging towards -y)
// onto the correct side of the square.
const EDGE_MAPS = {
  top: (x, y) => [x, y],
  right: (x, y) => [PIECE_BODY - y, x],
  bottom: (x, y) => [PIECE_BODY - x, PIECE_BODY - y],
  left: (x, y) => [y, PIECE_BODY - x],
};

function edgeSegment(type, map) {
  const p = (x, y) => { const [gx, gy] = map(x, y); return `${gx.toFixed(1)},${gy.toFixed(1)}`; };
  if (!type) return `L ${p(PIECE_BODY, 0)}`;
  const o = (v) => -type * v; // tab pushes outwards, blank pulls inwards
  return [
    `L ${p(42, 0)}`,                                    // run up to the neck
    `C ${p(42, o(4))} ${p(34, o(6))} ${p(34, o(13))}`,   // undercut out to the left
    `C ${p(34, o(20))} ${p(42, o(22))} ${p(50, o(22))}`, // round over the top
    `C ${p(58, o(22))} ${p(66, o(20))} ${p(66, o(13))}`,
    `C ${p(66, o(6))} ${p(58, o(4))} ${p(58, 0)}`,       // back down the neck
    `L ${p(PIECE_BODY, 0)}`,
  ].join(" ");
}

/**
 * Builds the SVG path for one jigsaw piece.
 * edges: { top, right, bottom, left } each 1 (tab), -1 (blank) or 0 (flat).
 */
export function piecePath({ top = 0, right = 0, bottom = 0, left = 0 } = {}) {
  return [
    "M 0,0",
    edgeSegment(top, EDGE_MAPS.top),
    edgeSegment(right, EDGE_MAPS.right),
    edgeSegment(bottom, EDGE_MAPS.bottom),
    edgeSegment(left, EDGE_MAPS.left),
    "Z",
  ].join(" ");
}

// A classic standalone piece: sockets on the top and left, knobs on the
// right and bottom — the shape people picture when they think "puzzle piece".
const CLASSIC_PIECE = piecePath({ top: -1, right: 1, bottom: 1, left: -1 });

/**
 * Works out the edges for a piece sitting at (row, col) inside a rows x cols
 * jigsaw. Shared edges are always mirrored — where one piece has a tab its
 * neighbour has the matching socket — and the outside border is left flat,
 * so an assembled grid forms a clean rectangle.
 */
export function gridEdges(row, col, rows, cols) {
  const vertical = (r, c) => ((r + c) % 2 === 0 ? 1 : -1);   // right edge of piece (r, c)
  const horizontal = (r, c) => ((r + c) % 2 === 0 ? -1 : 1); // bottom edge of piece (r, c)
  return {
    top: row === 0 ? 0 : -horizontal(row - 1, col),
    right: col === cols - 1 ? 0 : vertical(row, col),
    bottom: row === rows - 1 ? 0 : horizontal(row, col),
    left: col === 0 ? 0 : -vertical(row, col - 1),
  };
}

// Decorative puzzle piece. fillOpacity 0.13 = faint background motif,
// higher values render it as a solid graphic element.
export function PuzzlePiece({ size = 60, color = COLORS.teal, style = {}, rotate = 0, fillOpacity = 0.13, edges }) {
  return (
    <svg width={size} height={size} viewBox={PIECE_VIEWBOX} fill="none"
      style={{ transform: `rotate(${rotate}deg)`, overflow: "visible", ...style }}>
      <path d={edges ? piecePath(edges) : CLASSIC_PIECE} fill={color} fillOpacity={fillOpacity} />
    </svg>
  );
}

// Each PuzzlePhoto needs its own clipPath id, so they don't collide on a page.
let clipCounter = 0;

/**
 * A photograph cut into the shape of a puzzle piece.
 * Pass `src` to show a real image; leave it out and you get a labelled
 * placeholder in the same shape, so layouts can be built before the
 * photography exists.
 */
export function PuzzlePhoto({
  src, alt = "", size = 260, edges, rotate = 0, style = {},
  label = "Photo", color = COLORS.teal, showBorder = true,
}) {
  const [clipId] = useState(() => `puzzle-clip-${++clipCounter}`);
  const d = edges ? piecePath(edges) : CLASSIC_PIECE;
  const box = PIECE_BODY + PIECE_PAD * 2;

  return (
    <svg
      width={size} height={size} viewBox={PIECE_VIEWBOX}
      role="img" aria-label={alt || label}
      style={{ transform: `rotate(${rotate}deg)`, overflow: "visible", ...style }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>

      {src ? (
        <image
          href={src} xlinkHref={src}
          x={-PIECE_PAD} y={-PIECE_PAD} width={box} height={box}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <>
          <path d={d} fill={color} fillOpacity={0.14} />
          <text
            x={PIECE_BODY / 2} y={PIECE_BODY / 2}
            textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 8, fontWeight: 700, fill: COLORS.inkFaint }}
          >
            {label}
          </text>
        </>
      )}

      {showBorder && (
        <path d={d} fill="none" stroke={COLORS.white} strokeWidth={2.5} strokeLinejoin="round" />
      )}
    </svg>
  );
}

/**
 * Returns [ref, inView]. inView flips to true the first time the element
 * scrolls into the viewport, which is what drives the puzzle-assembly
 * animations. Falls back to visible if IntersectionObserver is unavailable.
 */
export function useInView({ threshold = 0.2, rootMargin = "0px 0px -80px 0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();   // assemble once, then leave it alone
      }
    }, { threshold, rootMargin });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}

// Section heading used across pages — eyebrow label, title, optional lead paragraph
export function SectionHeading({ eyebrow, title, lead, align = "left", maxWidth = 720 }) {
  return (
    <div style={{
      marginBottom: 44, textAlign: align,
      maxWidth: align === "center" ? maxWidth : "none",
      margin: align === "center" ? `0 auto 44px` : "0 0 44px",
    }}>
      {eyebrow && (
        <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 12 }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{
        fontFamily: "'Nunito', sans-serif", fontSize: "clamp(26px, 3.2vw, 40px)",
        fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em",
        marginBottom: lead ? 16 : 0,
      }}>
        {title}
      </h2>
      {lead && (
        <p style={{ fontSize: 16, color: COLORS.inkMid, lineHeight: 1.75, maxWidth, margin: align === "center" ? "0 auto" : 0 }}>
          {lead}
        </p>
      )}
    </div>
  );
}

const NAV_LINKS = [
  { label: "Home", page: "home" },
  { label: "About", page: "about" },
  { label: "How it works", page: "how" },
  { label: "Training", page: "training" },
  { label: "Donate", page: "donate" },
];

/**
 * Site navigation. Used identically on every public page.
 * `current` highlights the active page. `onNavigate(page)` handles routing.
 * "Donate" scrolls to the donation block on the homepage, navigating there first
 * if the visitor is on another page.
 */
export function Navbar({ current, onNavigate, onLoginClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToDonate = () => {
    const el = document.getElementById("donate");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleClick = (page) => {
    if (page === "donate") {
      if (current === "home") { scrollToDonate(); return; }
      onNavigate("home");
      setTimeout(scrollToDonate, 200);
      return;
    }
    onNavigate(page);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, width: "100%",
      background: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
      boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.05)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{
        maxWidth: 1300, margin: "auto", height: 84,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", gap: 24,
      }}>
        {/* Logo always returns to the homepage */}
        <div onClick={() => onNavigate("home")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <img src="/logo.png" alt="The Puzzle Project" style={{ height: 56, width: "auto" }} />
        </div>

        <div style={{ display: "flex", gap: 4, alignItems: "center", flex: 1, justifyContent: "center" }}>
          {NAV_LINKS.map(link => {
            const isActive = current === link.page;
            return (
              <button key={link.label}
                onClick={() => handleClick(link.page)}
                style={{
                  background: isActive ? COLORS.tealLight : "none",
                  border: "none", cursor: "pointer",
                  padding: "9px 16px", borderRadius: 9,
                  fontSize: 14, fontWeight: isActive ? 800 : 600,
                  color: isActive ? COLORS.teal : COLORS.ink,
                  transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = COLORS.teal; e.currentTarget.style.background = COLORS.tealLight; }}
                onMouseLeave={e => { e.currentTarget.style.color = isActive ? COLORS.teal : COLORS.ink; e.currentTarget.style.background = isActive ? COLORS.tealLight : "none"; }}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
          <button onClick={onLoginClick} style={{
          background: "transparent", color: COLORS.teal,
           border: `1.5px solid ${COLORS.teal}`, borderRadius: 10,
           padding: "10px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14,
           fontFamily: "inherit", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = COLORS.teal; e.currentTarget.style.color = COLORS.white; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLORS.teal; }}
            >
           Login
        </button>
        </div>
      </div>
    </nav>
  );
}

// Full site footer — identical on every page, with working navigation links
export function Footer({ onNavigate, onLoginClick }) {
  const columns = [
    {
      heading: "Platform",
      links: [
        { label: "How it works", action: () => onNavigate("how") },
        { label: "Training Modules", action: () => onNavigate("training") },
        { label: "Login", action: onLoginClick },
      ],
    },
    {
      heading: "Organisation",
      links: [
        { label: "About Us", action: () => onNavigate("about") },
        { label: "Support Our Work", action: () => onNavigate("home") },
        { label: "Contact", action: () => onNavigate("about") },
      ],
    },
  ];

  return (
    <footer style={{ background: COLORS.dark, padding: "52px 40px 32px" }}>
      <div style={{ maxWidth: 1300, margin: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 44 }}>
          <div>
            <img src="/logo.png" alt="The Puzzle Project" style={{ height: 44, marginBottom: 16 }} />
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.75, maxWidth: 320 }}>
              Supporting early childhood development across South Africa through accessible, culturally relevant, play-based screening tools.
            </p>
            <div style={{ marginTop: 20, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", display: "inline-block" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>Contact Gary King</p>
              <p style={{ fontSize: 12, color: COLORS.teal, fontWeight: 600 }}>gary@picturetree.co.za</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>+27 82 557 4713</p>
            </div>
          </div>
          {columns.map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 16 }}>
                {col.heading}
              </p>
              {col.links.map(l => (
                <div key={l.label} onClick={l.action}
                  style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10, cursor: "pointer", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = COLORS.white}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                >
                  {l.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>© 2026 The Puzzle Project. All rights reserved.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>Intellectual property of Dr R. Marais &amp; Dr J. Jansen (2025)</p>
        </div>
      </div>
    </footer>
  );
}

// Shared closing call-to-action used at the foot of every page
export function CallToAction({ onNavigate, onLoginClick }) {
  return (
    <section style={{ padding: "90px 40px", background: `linear-gradient(135deg, ${COLORS.dark} 0%, #2A1040 100%)`, position: "relative", overflow: "hidden" }}>
      <PuzzlePiece size={90} color={COLORS.teal} rotate={15} fillOpacity={0.25} style={{ position: "absolute", top: -30, left: -20 }} />
      <PuzzlePiece size={70} color={COLORS.pink} rotate={-20} fillOpacity={0.25} style={{ position: "absolute", bottom: -20, right: -10 }} />
      <div style={{ maxWidth: 760, margin: "auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(26px, 3.2vw, 42px)", color: COLORS.white, marginBottom: 20, fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          Together we can give every child the opportunity to thrive.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.62)", maxWidth: 620, margin: "0 auto 36px" }}>
          Whether you are an educator, therapist, school, researcher or partner organisation, your involvement helps us create brighter futures for children across South Africa.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <button onClick={() => onNavigate("training")} style={{
            padding: "14px 32px", background: COLORS.teal, color: COLORS.white,
            border: "none", borderRadius: 12, cursor: "pointer",
            fontWeight: 800, fontSize: 15, fontFamily: "inherit", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = COLORS.tealDark; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.teal; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Start Training
          </button>
          <button onClick={onLoginClick} style={{
            padding: "14px 32px", background: "rgba(255,255,255,0.08)", color: COLORS.white,
            border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 12, cursor: "pointer",
            fontWeight: 700, fontSize: 15, fontFamily: "inherit", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}