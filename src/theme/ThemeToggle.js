// ThemeToggle.js — small reusable light/dark switch. Drop it into any nav,
// sidebar or header; it always reflects and controls the one site-wide theme.
//
// `variant="dark"` is for placing the toggle on a surface that's already
// dark regardless of theme (the sidebar, the public-site navbar's mobile
// panel, the login card) so it doesn't render as dark-on-dark.

import React from "react";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle({ variant = "light", style = {} }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const onDark = variant === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 13px",
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 12.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
        border: onDark ? "1.5px solid rgba(255,255,255,0.16)" : "1.5px solid var(--border)",
        background: onDark ? "rgba(255,255,255,0.06)" : "var(--card)",
        color: onDark ? "rgba(255,255,255,0.85)" : "var(--ink-mid)",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>
        {isDark ? "" : ""}
      </span>
      {isDark ? "Dark" : "Light"}
    </button>
  );
}