// App.js — now hosts two separate flows:
// 1) Logged OUT: the public sites, each with its own navigation:
//      The Puzzle Project  home · about · donate
//      The Puzzle Box      pb-home · pb-how · pb-training · pb-purchase
//      Puzzle Play         pp-home · pp-how · pp-purchase · pp-login
//    Login opens when the visitor clicks "Login" or a tier's Sign up / Log in.
// 2) Logged IN: the existing role-based dashboards + puzzle transition,
//    unchanged from before.

import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { supabase } from "./supabaseClient";
import { mapUserRow } from "./lib/mappers";
import Login from "./components/Login";
import PendingApproval from "./components/PendingApproval";
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
import DonatePage from "./components/DonatePage";
import PuzzleBoxHome from "./components/PuzzleBoxHome";
import PuzzleBoxPurchase from "./components/PuzzleBoxPurchase";
import MemberArea from "./components/MemberArea";
import {
  PuzzlePlayHome, PuzzlePlayHow, PuzzlePlayPurchase, PuzzlePlayLogin,
} from "./components/PuzzlePlayPages";

import "./App.css";

// Tier 1 (educator) and Tier 2 (psychologist) users first land on a page with
// the "Training" and "Buy The Puzzle Box Screener" buttons (sponsor wireframe
// TPB p4) before continuing to their dashboard. Kept in sessionStorage so a
// page refresh doesn't bounce someone back to it mid-session.
const MEMBER_VIEW_KEY = "pb_member_view";
const readMemberView = () => {
  try { return sessionStorage.getItem(MEMBER_VIEW_KEY) || "landing"; } catch { return "landing"; }
};
const writeMemberView = (v) => {
  try { sessionStorage.setItem(MEMBER_VIEW_KEY, v || "dashboard"); } catch { /* storage unavailable */ }
};

// Older code paths used these page names; map them onto the new sites.
const LEGACY_PAGES = { how: "pb-how", training: "pb-training" };

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  // undefined = "haven't checked yet", null = "checked, no profile doc",
  // object = the loaded profile. Keeping these distinct is what stops the
  // brief Dashboard-fallback flash while the profile fetch is in flight.
  const [profile, setProfile] = useState(undefined);

  // Which public-site page a signed-out visitor is looking at:
  // "home" | "about" | "donate" | "pb-home" | "pb-how" | "pb-training" |
  // "pb-purchase" | "pp-home" | "pp-how" | "pp-purchase" | "pp-login"
  const [publicPage, setPublicPageRaw] = useState("home");
  const setPublicPage = (page) => setPublicPageRaw(LEGACY_PAGES[page] || page);

  // The Puzzle Box login screen sits on top of whatever page opened it.
  // loginCtx = { tier: 1 | 2 | null, mode: "login" | "register" } or null.
  const [showLogin, setShowLogin] = useState(false);
  const [loginCtx, setLoginCtx] = useState(null);
  const openLogin = (ctx) => {
    // Navbar buttons can hand us a click event — only accept a real context.
    const valid = ctx && typeof ctx === "object" && ("tier" in ctx || "mode" in ctx) ? ctx : null;
    setLoginCtx(valid);
    setShowLogin(true);
  };

  // "landing" | "training" | "purchase" | "dashboard" — see MEMBER_VIEW_KEY above
  const [memberView, setMemberViewState] = useState(readMemberView);
  const setMemberView = (v) => { writeMemberView(v); setMemberViewState(v || "dashboard"); };

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
          // Load whatever profile exists (or none at all) — App.js's render
          // below is what actually gates access: PendingApproval renders
          // instead of a dashboard unless profile.isVerified is true.
          setProfile(data ? mapUserRow(data) : null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
        setTransitioning(false);
        setShowLogin(false);
        setLoginCtx(null);
        writeMemberView("landing");      // next login starts at the landing page again
        setMemberViewState("landing");
      }

      setLoading(false);
    });
    return () => unsub();
  }, []);

  // NEW — scroll to top whenever the visitor moves between public pages
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [publicPage]);

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

    const isMember = profile?.isVerified && (profile.role === "educator" || profile.role === "psychologist");

    // Verified Tier 1 / Tier 2 users see the Training / Buy page until they
    // choose to continue to their dashboard.
    if (isMember && memberView !== "dashboard") {
      return (
        <>
          <MemberArea user={user} profile={profile} view={memberView} onView={setMemberView} />
          {transitioning && (
            <PuzzleTransition onComplete={() => setTransitioning(false)} />
          )}
        </>
      );
    }

    const openMember = (view) => setMemberView(view);

    return (
      <>
        {!profile || !profile.isVerified ? (
          // The safety gate: signing up creates the account but NOT access.
          // Anything without a verified profile — including a rejected
          // account, whose row is deleted rather than left visible — lands
          // here instead of any dashboard.
          <PendingApproval
            user={user}
            profile={profile}
            onApproved={(approvedProfile) => {
              setProfile(approvedProfile);
              setTransitioning(true);
            }}
          />
        ) : profile.role === "educator" ? (
          <TeacherHome user={user} profile={profile} onOpenMember={openMember} />
        ) : profile.role === "psychologist" ? (
          <PsychologistHome user={user} profile={profile} onOpenMember={openMember} />
        ) : profile.role === "admin" ? (
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

  // ── LOGGED OUT: the public sites, or Login once they click through ────
  if (showLogin) {
    return (
      <Login
        tier={loginCtx?.tier || null}
        initialMode={loginCtx?.mode || "login"}
        onBack={() => setShowLogin(false)}
        onVerified={(verifiedProfile) => {
          setProfile(verifiedProfile);
          setMemberView("landing");
          // Only play the "welcome in" transition for an already-approved
          // account — a fresh signup lands on PendingApproval instead,
          // where a celebratory animation would be misleading.
          if (verifiedProfile?.isVerified) setTransitioning(true);
        }}
      />
    );
  }

  const isPlay = publicPage.startsWith("pp-");
  const publicPageProps = {
    onNavigate: setPublicPage,
    // Puzzle Play has its own (not yet built) login page; everything else
    // uses The Puzzle Box login.
    onNavigateToLogin: isPlay ? () => setPublicPage("pp-login") : openLogin,
    onAccess: (tier, mode) => openLogin({ tier, mode }),
  };

  switch (publicPage) {
    case "about":
      return <About {...publicPageProps} />;
    case "donate":
      return <DonatePage {...publicPageProps} />;
    case "pb-home":
      return <PuzzleBoxHome {...publicPageProps} />;
    case "pb-how":
      return <HowItWorks {...publicPageProps} />;
    case "pb-training":
      return <TrainingPage {...publicPageProps} />;
    case "pb-purchase":
      return <PuzzleBoxPurchase {...publicPageProps} />;
    case "pp-home":
      return <PuzzlePlayHome {...publicPageProps} />;
    case "pp-how":
      return <PuzzlePlayHow {...publicPageProps} />;
    case "pp-purchase":
      return <PuzzlePlayPurchase {...publicPageProps} />;
    case "pp-login":
      return <PuzzlePlayLogin {...publicPageProps} />;
    case "home":
    default:
      return <Homepage {...publicPageProps} />;
  }
}

export default App;