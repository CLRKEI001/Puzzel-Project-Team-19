// RoleSidebar.js — shared shell for the role-based home screens
// (Teacher, Psychologist, Admin). Deliberately generic: pass in the nav
// items and a role label and it renders the same sidebar chrome the rest
// of the app already uses (same class names as Sidebar.js) so every role's
// home screen stays visually consistent with the analytics Dashboard.
 
import React, { useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
 
export default function RoleSidebar({
  navItems,
  activePage,
  setActivePage,
  roleLabel,
  displayName,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
 
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
                onClick={() => { if (item.onClick) { item.onClick(); } else { setActivePage(item.id); } onNavigate?.(); }}
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
      <nav className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="The Puzzle Project" />
        </div>
        <div className="sidebar-role">
          <div className="sidebar-role-label">Signed in as</div>
          <div className="sidebar-role-name">{displayName}</div>
          <div className="sidebar-role-type">{roleLabel}</div>
        </div>
        <div className="sidebar-nav">
          <NavContent />
        </div>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => signOut(auth)}>
            Sign Out
          </button>
        </div>
      </nav>
 
      <button
        className="hamburger-btn"
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 150,
          display: "none", flexDirection: "column", gap: 5,
          background: "var(--dark)", border: "none",
          borderRadius: 8, padding: "8px 10px", cursor: "pointer",
        }}
      >
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
        <span style={{ display: "block", width: 20, height: 2, background: "#fff", borderRadius: 2 }} />
      </button>
 
      {mobileOpen && (
        <div className="mobile-menu" style={{
          position: "fixed", inset: 0, background: "var(--dark)", zIndex: 200,
          display: "flex", flexDirection: "column", padding: "24px 22px",
          overflowY: "auto", animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <img src="/logo.png" alt="logo" style={{ height: 32 }} />
            <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
          <div className="sidebar-role" style={{ margin: "0 0 20px" }}>
            <div className="sidebar-role-label">Signed in as</div>
            <div className="sidebar-role-name">{displayName}</div>
            <div className="sidebar-role-type">{roleLabel}</div>
          </div>
          <div className="sidebar-nav" style={{ flex: 1 }}>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
          <button className="logout-btn" onClick={() => { setMobileOpen(false); signOut(auth); }} style={{ marginTop: 24 }}>
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}