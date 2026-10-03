// ThemeContext.js
//
// Site-wide light/dark theme. Wrap the app in <ThemeProvider> once (see
// index.js) and any component can read/toggle it with useTheme().
//
// How it reaches every page: this sets data-theme="dark" (or "light") on
// <html>. App.css's `:root` block defines the light-mode value of every
// colour token (--ink, --surface, --card, --border, etc.), and a
// `[data-theme="dark"] { ... }` block right after it overrides those same
// tokens for dark mode. Because nearly every stylesheet in this project —
// App.css itself, the public-site pages via SiteChrome's COLORS object, and
// the component CSS files — already read colours through those var(--x)
// tokens instead of hardcoded hex, flipping the attribute on <html> re-themes
// the whole site without touching each page individually.
//
// Starts in light mode every time unless the person has switched to dark
// before on this device (per the product decision: no auto system-preference
// detection, manual toggle only).

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });
const STORAGE_KEY = "pb_theme";

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable (private browsing etc.) — theme still works,
      // it just won't be remembered on the next visit
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}