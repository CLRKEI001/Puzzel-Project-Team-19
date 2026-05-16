import React, { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const labels = {
  en: {
    overview: "Overview", children: "Student Records", results: "Screener Results",
    flags: "Flags & Alerts", report: "Summary Report", nav1: "Dashboard",
    nav2: "Screener", nav3: "Admin", logout: "Sign Out",
    role: "Psychologist", system: "Screener System"
  },
  af: {
    overview: "Oorsig", children: "Leerlingsrekords", results: "Sifterresultate",
    flags: "Vlae & Waarskuwings", report: "Opsommingsverslag", nav1: "Paneelbord",
    nav2: "Sifter", nav3: "Admin", logout: "Teken Uit",
    role: "Sielkundige", system: "Sifterstelsel"
  },
  xh: {
    overview: "Inkcazelo", children: "Iirekhodi zabaFundi", results: "Iziphumo",
    flags: "Izikhombisi & Izisilumkiso", report: "Ingxelo Efuphi", nav1: "Iphini",
    nav2: "Umhloli", nav3: "Ukulawula", logout: "Phuma",
    role: "Isazi Sengqondo", system: "Inkqubo"
  }
};

export default function Sidebar({ activePage, setActivePage, lang, user }) {
  const t = labels[lang];
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "overview", label: t.overview, section: t.nav1, icon: (
      <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
    )},
    { id: "children", label: t.children, section: null, icon: (
      <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    )},
    { id: "results", label: t.results, section: t.nav2, icon: (
      <svg viewBox="0 0 16 16" fill="none"><path d="M2 12L6 7l3 3 3-4 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )},
    { id: "flags", label: t.flags, section: t.nav3, icon: (
      <svg viewBox="0 0 16 16" fill="none"><path d="M3 2v12M3 2l8 3-8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )},
    { id: "report", label: t.report, section: null, icon: (
      <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    )},
  ];

  const NavContent = ({ onNavigate }) => {
    let lastSection = null;
    return (
      <>
        {navItems.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <React.Fragment key={item.id}>
              {showSection && <div className="nav-section-label">{item.section}</div>}
              <button
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => { setActivePage(item.id); onNavigate?.(); }}
              >
                {item.icon}
                {item.label}
              </button>
            </React.Fragment>
          );
        })}
      </>
    );
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="The Puzzle Project" />
        </div>
        <div className="sidebar-role">
          <div className="sidebar-role-label">Signed in as</div>
          <div className="sidebar-role-name">{user?.email?.split("@")[0] || "Psychologist"}</div>
          <div className="sidebar-role-type">{t.role}</div>
        </div>
        <div className="sidebar-nav">
          <NavContent />
        </div>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => signOut(auth)}>
            {t.logout}
          </button>
        </div>
      </nav>

      {/* ── MOBILE HAMBURGER BUTTON ── */}
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 150,
          display: "none",
          flexDirection: "column", gap: 5,
          background: "var(--dark)", border: "none",
          borderRadius: 8, padding: "8px 10px", cursor: "pointer",
        }}
      >
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
      </button>

      {/* ── MOBILE FULLSCREEN MENU ── */}
      {mobileOpen && (
        <div style={{
          position: "fixed", inset: 0,
          background: "var(--dark)",
          zIndex: 200,
          display: "flex", flexDirection: "column",
          padding: "24px 22px",
          overflowY: "auto",
          animation: "fadeIn 0.2s ease",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="logo" style={{ height: 32 }} />
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Role badge */}
          <div className="sidebar-role" style={{ margin: "0 0 20px" }}>
            <div className="sidebar-role-label">Signed in as</div>
            <div className="sidebar-role-name">{user?.email?.split("@")[0] || "Psychologist"}</div>
            <div className="sidebar-role-type">{t.role}</div>
          </div>

          {/* Nav */}
          <div className="sidebar-nav" style={{ flex: 1 }}>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>

          {/* Logout */}
          <button
            className="logout-btn"
            onClick={() => { setMobileOpen(false); signOut(auth); }}
            style={{ marginTop: 24 }}
          >
            {t.logout}
          </button>
        </div>
      )}
    </>
  );
}