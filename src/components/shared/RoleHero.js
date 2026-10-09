// RoleHero.js — the personality piece of each role home screen. A soft,
// role-colored gradient card with a big translucent puzzle piece as the
// "illustration", a personal greeting, and a slot underneath for the
// stat rings row. Deliberately not a white bordered card — this is the
// one element that should look nothing like a generic dashboard.
 
import React from "react";
import { PuzzlePiece } from "./puzzlePiece";
 
const TINTS = {
  orange: { bg: "linear-gradient(135deg, #FFB27A 0%, #F26522 55%, #D6480F 100%)", soft: "#FFF3EA" },
  pink:   { bg: "linear-gradient(135deg, #FF7EA6 0%, #E8175D 55%, #B7104A 100%)", soft: "#FFEEF3" },
  purple: { bg: "linear-gradient(135deg, #A67FD1 0%, #6B2F8A 55%, #4A1F61 100%)", soft: "#F4EEFA" },
  teal:   { bg: "linear-gradient(135deg, #5FE0D0 0%, #009B8D 55%, #016F65 100%)", soft: "#E9FBF8" },
};
 
export default function RoleHero({ tint = "teal", eyebrow, greeting, subtitle, children }) {
  const t = TINTS[tint] || TINTS.teal;
  return (
    <div className="rh-hero" style={{ background: t.bg }}>
      <div className="rh-hero-piece rh-hero-piece-a">
        <PuzzlePiece rotate={0} fill="rgba(255,255,255,0.16)" />
      </div>
      <div className="rh-hero-piece rh-hero-piece-b">
        <PuzzlePiece rotate={90} fill="rgba(255,255,255,0.1)" />
      </div>
      <div className="rh-hero-body">
        {eyebrow && <div className="rh-hero-eyebrow">{eyebrow}</div>}
        <div className="rh-hero-greeting">{greeting}</div>
        {subtitle && <div className="rh-hero-subtitle">{subtitle}</div>}
      </div>
      {children && <div className="rh-hero-rings">{children}</div>}
    </div>
  );
}