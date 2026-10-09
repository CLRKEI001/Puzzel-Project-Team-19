// puzzlePiece.js — a single jigsaw-quadrant silhouette (straight outer
// corner, one tab, one notch) that becomes a full 2x2 interlocking puzzle
// simply by rendering four rotated copies (0°, 90°, 180°, 270°) around a
// shared centre. That's what makes the tabs/notches line up automatically.
 
import React from "react";
 
export const PUZZLE_QUADRANT_PATH =
  "M10,0 L90,0 Q100,0 100,10 L100,34 C100,42 106,44 112,40 C120,34 130,36 130,50 " +
  "C130,64 120,66 112,60 C106,56 100,58 100,66 L100,90 Q100,100 90,100 " +
  "L66,100 C58,100 56,94 60,88 C66,80 64,70 50,70 C36,70 34,80 40,88 " +
  "C44,94 42,100 34,100 L10,100 Q0,100 0,90 L0,10 Q0,0 10,0 Z";
 
// A standalone single jigsaw tile — tab on the right edge, notch on the
// left, straight top/bottom. Used for the drifting background pieces
// (as opposed to PUZZLE_QUADRANT_PATH, which is one quarter of the
// assembled 2x2 mark).
export const PUZZLE_SINGLE_PATH =
  "M10,0 L90,0 Q100,0 100,10 L100,34 C100,42 106,44 112,40 C120,34 130,36 130,50 " +
  "C130,64 120,66 112,60 C106,56 100,58 100,66 L100,90 Q100,100 90,100 " +
  "L10,100 Q0,100 0,90 L0,66 C0,58 6,56 12,60 C20,66 30,64 30,50 " +
  "C30,36 20,34 12,40 C6,44 0,42 0,34 L0,10 Q0,0 10,0 Z";
 
export function SinglePuzzlePiece({ fill, opacity = 1, rotate = 0, className, style }) {
  return (
    <svg
      viewBox="-8 -8 146 116"
      className={className}
      style={style}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={`rotate(${rotate} 62 50)`}>
        <path d={PUZZLE_SINGLE_PATH} fill={fill} opacity={opacity} />
      </g>
    </svg>
  );
}
 
// rotate: 0 = top-left, 90 = top-right, 180 = bottom-right, 270 = bottom-left
export function PuzzlePiece({ rotate, fill, className, style }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={`rotate(${rotate} 100 100)`}>
        <path
          d={PUZZLE_QUADRANT_PATH}
          fill={fill}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}