// App.js — now hosts two separate flows:
// 1) Logged OUT: the public marketing site (Homepage/About/HowItWorks/
//    TrainingPage) with its own internal navigation, landing on Login only
//    when the visitor clicks "Login" or "Start Screening".
// 2) Logged IN: the existing role-based dashboards + puzzle transition,
//    unchanged from before.

import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { supabase } from "./supabaseClient";
import { mapUserRow } from "./lib/mappers";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import TeacherHome from "./components/TeacherHome";
import PsychologistHome from "./components/PsychologistHome";
import AdminHome from "./components/AdminHome";
import PuzzleTransition from "./components/PuzzleTransition";

// NEW — your teammate's public site pages. Adjust these paths if her files
// don't actually live in ./components (e.g. change to "./pages/Homepage" etc.)
import Homepage from "./components/Homepage";
import About from "./components/About";
import HowItWorks from "./components/HowItWorks";
import TrainingPage from "./components/Trainingpage";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  // undefined = "haven't checked yet", null = "checked, no profile doc",
  // object = the loaded profile. Keeping these distinct is what stops the
  // brief Dashboard-fallback flash while the profile fetch is in flight.
  const [profile, setProfile] = useState(undefined);

  // NEW — which public-site page a signed-out visitor is looking at.
  // "home" | "about" | "how" | "training" | "login"
  const [publicPage, setPublicPage] = useState("home");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        setProfile(undefined);
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", u.uid)
            .maybeSingle();
          if (error) throw error;
          // No verification gate for now — log in with whatever profile
          // exists (or none at all, which falls through to the generic
          // Dashboard). Re-add an is_verified check here once real
          // SACE/HPCSA verification is actually wired up.
          setProfile(data ? mapUserRow(data) : null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
        setTransitioning(false);
      }

      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <img src="/logo.png" alt="The Puzzle Project" className="loading-logo" />
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ── LOGGED IN: unchanged role-based routing ──────────────────────────
  if (user) {
    // Still figuring out the role — show the loading screen (which the
    // puzzle transition will cover anyway on a fresh login) instead of
    // letting the Dashboard fallback render prematurely.
    if (profile === undefined) {
      return (
        <>
          <div className="app-loading">
            <img src="/logo.png" alt="The Puzzle Project" className="loading-logo" />
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
          {transitioning && (
            <PuzzleTransition onComplete={() => setTransitioning(false)} />
          )}
        </>
      );
    }

    return (
      <>
        {profile?.role === "educator" ? (
          <TeacherHome user={user} profile={profile} />
        ) : profile?.role === "psychologist" ? (
          <PsychologistHome user={user} profile={profile} />
        ) : profile?.role === "admin" ? (
          <AdminHome user={user} profile={profile} />
        ) : (
          <Dashboard user={user} profile={profile} />
        )}
        {transitioning && (
          <PuzzleTransition onComplete={() => setTransitioning(false)} />
        )}
      </>
    );
  }

  // ── LOGGED OUT: public marketing site, or Login once they click through ──
  if (publicPage === "login") {
    return (
      <Login
        onVerified={(verifiedProfile) => {
          setProfile(verifiedProfile);
          setTransitioning(true);
        }}
      />
    );
  }

  const publicPageProps = {
    onNavigate: setPublicPage,
    onNavigateToLogin: () => setPublicPage("login"),
  };

  switch (publicPage) {
    case "about":
      return <About {...publicPageProps} />;
    case "how":
      return <HowItWorks {...publicPageProps} />;
    case "training":
      return <TrainingPage {...publicPageProps} />;
    case "home":
    default:
      return <Homepage {...publicPageProps} />;
  }
}

export default App;