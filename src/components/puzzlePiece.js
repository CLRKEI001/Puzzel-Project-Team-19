// puzzlePiece.js — a single jigsaw-quadrant silhouette (straight outer
// corner, one tab, one notch) that becomes a full 2x2 interlocking puzzle
// simply by rendering four rotated copies (0°, 90°, 180°, 270°) around a
// shared centre. That's what makes the tabs/notches line up automatically.
 
import React from "react";
 
export const PUZZLE_QUADRANT_PATH =
  "M0,0 L100,0 L100,32 C124,32 124,68 100,68 L100,100 " +
  "L68,100 C68,76 32,76 32,100 L0,100 Z";
 
// A standalone single jigsaw tile — tab on the right edge, notch on the
// left, straight top/bottom. Used for the drifting background pieces
// (as opposed to PUZZLE_QUADRANT_PATH, which is one quarter of the
// assembled 2x2 mark).
export const PUZZLE_SINGLE_PATH =
  "M0,0 L100,0 L100,32 C124,32 124,68 100,68 L100,100 L0,100 " +
  "L0,68 C24,68 24,32 0,32 Z";
 
export function SinglePuzzlePiece({ fill, opacity = 1, rotate = 0, className, style }) {
  return (
    <svg
      viewBox="-8 -8 140 116"
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
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}