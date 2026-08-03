// PuzzleTransition.js — plays once, right after a verified login.
// Four colour-coded quarter-pieces (one per PuzzleBox role: educator,
// psychologist, analyst, admin) fly in from the corners and lock together
// into one rounded mark, which then dissolves to reveal the dashboard
// mounted underneath it. Fully self-dismissing — just drop it in and
// give it an onComplete callback.
 
import React, { useEffect, useState } from "react";
import { PuzzlePiece } from "./puzzlePiece";
import "./PuzzleTransition.css";
 
const TOTAL_MS = 1900;
 
export default function PuzzleTransition({ onComplete }) {
  const [phase, setPhase] = useState("assemble"); // assemble -> hold -> dissolve
 
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 900);
    const t2 = setTimeout(() => setPhase("dissolve"), 1300);
    const t3 = setTimeout(() => onComplete?.(), TOTAL_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);
 
  return (
    <div className={`pb-transition pb-phase-${phase}`} role="status" aria-label="Signing in">
      <div className="pb-transition-mark">
        <span className="pb-t-piece pb-t-tl">
          <PuzzlePiece rotate={0} fill="var(--orange, #F26522)" />
        </span>
        <span className="pb-t-piece pb-t-tr">
          <PuzzlePiece rotate={90} fill="var(--pink, #E8175D)" />
        </span>
        <span className="pb-t-piece pb-t-bl">
          <PuzzlePiece rotate={270} fill="var(--teal, #009B8D)" />
        </span>
        <span className="pb-t-piece pb-t-br">
          <PuzzlePiece rotate={180} fill="var(--purple, #6B2F8A)" />
        </span>
      </div>
      <div className="pb-transition-label">Bringing your dashboard together…</div>
    </div>
  );
}