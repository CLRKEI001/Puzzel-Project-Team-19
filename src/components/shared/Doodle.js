// Doodle.js — the hand-drawn icon set that replaces emojis across the app.
//
// Each doodle is an ink outline (slightly wobbled by an SVG filter at larger
// sizes) over a flat, slightly off-register colour fill. Use by name:
//
//   <Doodle name="warning" size={16} inline />
//   <Ico v="notes" size={44} />      // renders a doodle if v is a doodle name, otherwise v as text
//
// To add one: put its fill path (f) and ink strokes (k) on a 100x100 grid.

import React, { useId } from "react";

const INK = "#1a1a2e";
const TEAL = "#9EDDD5", PINK = "#F8B9CD", YELLOW = "#FBE3A0", ORANGE = "#F8BE9C", PURPLE = "#CDB4DD";

export const DOODLES = {
  backpack:    { c: TEAL,   f: "M28 40Q28 22 50 22Q72 22 72 40V80Q72 88 64 88H36Q28 88 28 80Z", k: "M28 40Q28 22 50 22Q72 22 72 40V80Q72 88 64 88H36Q28 88 28 80Z M42 22Q42 11 50 11Q58 11 58 22 M34 46H66 M38 60H62V76Q62 79 59 79H41Q38 79 38 76Z M28 52Q19 54 19 66V76 M72 52Q81 54 81 66V76" },
  pencil:      { c: YELLOW, f: "M72 12L88 28L36 80L16 86L22 66Z", k: "M72 12L88 28L36 80L16 86L22 66Z M64 20L80 36 M22 66L36 80 M16 86L20 76" },
  clipboard:   { c: PURPLE, f: "M24 22H76Q80 22 80 26V84Q80 88 76 88H24Q20 88 20 84V26Q20 22 24 22Z", k: "M24 22H76Q80 22 80 26V84Q80 88 76 88H24Q20 88 20 84V26Q20 22 24 22Z M38 14H62V28H38Z M32 46H68 M32 58H68 M32 70H50" },
  flag:        { c: PINK,   f: "M30 16H78L66 34L78 52H30Z", k: "M30 92V10 M30 16H78L66 34L78 52H30" },
  warning:     { c: YELLOW, f: "M50 16L90 82H10Z", k: "M50 16L90 82H10Z M50 40V58 M50 69V70" },
  certificate: { c: YELLOW, f: "M12 22H88V74H12Z", k: "M12 22H88V74H12Z M22 32H78V64H22Z M32 42H68 M32 52H56 M62 60Q70 50 78 60 M70 62L66 80L72 76L78 80L74 62" },
  trophy:      { c: YELLOW, f: "M30 14H70V42Q70 62 50 62Q30 62 30 42Z", k: "M30 14H70V42Q70 62 50 62Q30 62 30 42Z M30 22H18Q18 40 32 44 M70 22H82Q82 40 68 44 M50 62V76 M38 76H62V84H38Z M32 88H68" },
  mailbox:     { c: TEAL,   f: "M14 60V42Q14 24 34 24H70Q86 24 86 42V60Z", k: "M14 60V42Q14 24 34 24H70Q86 24 86 42V60Z M14 60H86 M44 60V92 M56 60V92 M70 24V8H84V18H70 M24 38Q24 52 34 56" },
  magnifier:   { c: TEAL,   f: "M44 14A28 28 0 1 1 44 70A28 28 0 1 1 44 14Z", k: "M44 14A28 28 0 1 1 44 70A28 28 0 1 1 44 14Z M64 64L88 88 M30 36Q36 26 48 26" },
  bin:         { c: PINK,   f: "M26 32L32 86H68L74 32Z", k: "M22 30H78 M40 30V20H60V30 M26 32L32 86H68L74 32 M42 44V74 M50 44V74 M58 44V74" },
  books:       { c: ORANGE, f: "M18 64H84V80H18Z M24 46H80V62H24Z M20 28H78V44H20Z", k: "M18 64H84V80H18Z M24 46H80V62H24Z M20 28H78V44H20Z M28 72H70 M32 54H66 M26 36H64" },
  tick:        { c: TEAL,   f: "M50 10A40 40 0 1 1 50 90A40 40 0 1 1 50 10Z", k: "M30 52L44 66L72 34" },
  puzzle:      { c: PINK,   f: "M14 38H38A10 10 0 1 1 58 38H82V58A10 10 0 1 0 82 78V92H14Z", k: "M14 38H38A10 10 0 1 1 58 38H82V58A10 10 0 1 0 82 78V92H14Z" },
  envelope:    { c: PURPLE, f: "M14 26H86V74H14Z", k: "M14 26H86V74H14Z M16 30L50 56L84 30" },
  stopwatch:   { c: ORANGE, f: "M50 24A30 30 0 1 1 50 84A30 30 0 1 1 50 24Z", k: "M50 24A30 30 0 1 1 50 84A30 30 0 1 1 50 24Z M42 12H58V20H42Z M50 54V38 M50 54L62 62 M76 28L82 22" },
  download:    { c: TEAL,   f: "M18 66H82V86H18Z", k: "M50 10V56 M30 38L50 58L70 38 M18 66H82V86H18Z" },
  notes:       { c: PURPLE, f: "M24 14H70V86H24Z", k: "M24 14H70V86H24Z M34 30H60 M34 46H60 M34 62H50" },
  calendar:    { c: PINK,   f: "M16 24H84V86H16Z", k: "M16 24H84V86H16Z M16 42H84 M32 12V30 M68 12V30 M30 56H42 M54 56H66 M30 70H42" },
  chart:       { c: PURPLE, f: "M24 56H38V86H24Z M44 36H58V86H44Z M64 18H78V86H64Z", k: "M16 88H86 M24 56H38V86H24Z M44 36H58V86H44Z M64 18H78V86H64Z" },
  user:        { c: TEAL,   f: "M50 14A18 18 0 1 1 50 50A18 18 0 1 1 50 14Z M18 88Q18 58 50 58Q82 58 82 88Z", k: "M50 14A18 18 0 1 1 50 50A18 18 0 1 1 50 14Z M18 88Q18 58 50 58Q82 58 82 88Z" },
  globe:       { c: TEAL,   f: "M50 12A38 38 0 1 1 50 88A38 38 0 1 1 50 12Z", k: "M50 12A38 38 0 1 1 50 88A38 38 0 1 1 50 12Z M12 50H88 M50 12Q28 50 50 88 M50 12Q72 50 50 88" },
  photo:       { c: TEAL,   f: "M14 22H86V78H14Z", k: "M14 22H86V78H14Z M14 66L36 46L54 64L66 54L86 72 M64 36A6 6 0 1 1 64 37" },
  video:       { c: PINK,   f: "M12 28H88V72H12Z", k: "M12 28H88V72H12Z M44 40L62 50L44 60Z" },
  pin:         { c: TEAL,   f: "M50 90Q78 62 78 40A28 28 0 0 0 22 40Q22 62 50 90Z", k: "M50 90Q78 62 78 40A28 28 0 0 0 22 40Q22 62 50 90Z M50 30A10 10 0 1 1 50 50A10 10 0 1 1 50 30Z" },
  shield:      { c: PURPLE, f: "M50 10L84 22V48Q84 74 50 90Q16 74 16 48V22Z", k: "M50 10L84 22V48Q84 74 50 90Q16 74 16 48V22Z M34 50L46 62L68 38" },
  document:    { c: TEAL,   f: "M24 10H62L78 26V90H24Z", k: "M24 10H62L78 26V90H24Z M62 10V26H78 M34 48H68 M34 62H68 M34 76H54" },
  bulb:        { c: YELLOW, f: "M50 10Q78 10 78 36Q78 52 64 62V72H36V62Q22 52 22 36Q22 10 50 10Z", k: "M50 10Q78 10 78 36Q78 52 64 62V72H36V62Q22 52 22 36Q22 10 50 10Z M38 80H62 M42 88H58" },
  gear:        { c: PURPLE, f: "M80.6 44.8 L90.8 45.9 L90.8 54.1 L80.6 55.2 L75.3 67.9 L81.7 76.0 L76.0 81.7 L67.9 75.3 L55.2 80.6 L54.1 90.8 L45.9 90.8 L44.8 80.6 L32.1 75.3 L24.0 81.7 L18.3 76.0 L24.7 67.9 L19.4 55.2 L9.2 54.1 L9.2 45.9 L19.4 44.8 L24.7 32.1 L18.3 24.0 L24.0 18.3 L32.1 24.7 L44.8 19.4 L45.9 9.2 L54.1 9.2 L55.2 19.4 L67.9 24.7 L76.0 18.3 L81.7 24.0 L75.3 32.1Z", k: "M80.6 44.8 L90.8 45.9 L90.8 54.1 L80.6 55.2 L75.3 67.9 L81.7 76.0 L76.0 81.7 L67.9 75.3 L55.2 80.6 L54.1 90.8 L45.9 90.8 L44.8 80.6 L32.1 75.3 L24.0 81.7 L18.3 76.0 L24.7 67.9 L19.4 55.2 L9.2 54.1 L9.2 45.9 L19.4 44.8 L24.7 32.1 L18.3 24.0 L24.0 18.3 L32.1 24.7 L44.8 19.4 L45.9 9.2 L54.1 9.2 L55.2 19.4 L67.9 24.7 L76.0 18.3 L81.7 24.0 L75.3 32.1Z M50 38A12 12 0 1 1 50 62A12 12 0 1 1 50 38Z" },
  users:       { c: TEAL,   f: "M36 14A14 14 0 1 1 36 42A14 14 0 1 1 36 14Z M8 84Q8 56 36 56Q64 56 64 84Z", k: "M36 14A14 14 0 1 1 36 42A14 14 0 1 1 36 14Z M8 84Q8 56 36 56Q64 56 64 84Z M66 24A12 12 0 0 1 66 46 M72 58Q92 60 92 84H70" },
  laptop:      { c: ORANGE, f: "M20 24H80V66H20Z", k: "M20 24H80V66H20Z M10 74H90 M10 74Q10 80 16 80H84Q90 80 90 74" },
};

export default function Doodle({ name, size = 20, color, inline = false, style, title }) {
  const d = DOODLES[name];
  const raw = useId();
  if (!d) return null;
  const id = "dd" + raw.replace(/[^a-zA-Z0-9]/g, "");
  // thinner relative stroke reads too faint when small, so scale it up
  const sw = size <= 24 ? 7 : size <= 40 ? 5 : 3;
  const rough = size >= 36;
  return (
    <svg
      viewBox="-4 -4 108 108" width={size} height={size}
      role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}
      style={{
        display: inline ? "inline-block" : "block",
        verticalAlign: inline ? "-0.2em" : undefined,
        marginRight: inline ? 4 : undefined,
        flexShrink: 0, overflow: "visible", ...style,
      }}
    >
      {rough && (
        <defs>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
          </filter>
        </defs>
      )}
      <path d={d.f} fill={color || d.c} transform="translate(3.5 3.5)" />
      <g filter={rough ? `url(#${id})` : undefined}>
        <path d={d.k} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// Renders a doodle when `v` is a doodle name, otherwise falls back to showing
// `v` as plain text (so data that still holds a text symbol doesn't break).
// Older saved content (e.g. training blocks stored in the database) may still
// hold an emoji; LEGACY maps those to doodles so no emoji is ever shown.
const LEGACY = { "💡": "bulb", "📦": "puzzle", "📋": "clipboard", "📊": "chart", "💻": "laptop", "📝": "notes", "🔹": "puzzle", "✅": "tick", "📘": "books", "🎬": "video", "🎓": "certificate", "🔍": "magnifier", "⚙": "gear", "👥": "users", "📈": "chart" };

export function Ico({ v, size = 20, ...rest }) {
  const key = typeof v === "string" ? v.replace(/\uFE0F/g, "") : v;
  const name = DOODLES[key] ? key : LEGACY[key];
  if (name) return <Doodle name={name} size={size} {...rest} />;
  return v || null;
}