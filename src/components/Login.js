// Login.js — PuzzleBox Screener System
// Handles: sign in, new-account registration (with staff/teacher number for
// verification), forgot-password, and the "pending verification" state for
// accounts an admin hasn't approved yet.
//
// Drop this in src/components/Login.js. Also add PuzzleTransition.js and the
// small App.js changes noted in the README at the bottom of this file so the
// puzzle-assembly animation plays on a verified login.
 
import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { PuzzlePiece, SinglePuzzlePiece } from "./puzzlePiece";
import "./Login.css";
 
const ROLES = [
  { value: "educator", label: "Educator / Teacher", color: "var(--orange, #F26522)" },
  { value: "psychologist", label: "Psychologist", color: "var(--pink, #E8175D)" },
  { value: "analyst", label: "Data Analyst", color: "var(--teal, #009B8D)" },
  { value: "admin", label: "Administrator", color: "var(--purple, #6B2F8A)" },
];
 
const EMPTY_REGISTER = {
  name: "",
  email: "",
  password: "",
  confirm: "",
  role: "educator",
  staffNumber: "",
};
 
// A handful of jigsaw-outline pieces that drift slowly behind the form.
// Kept purely decorative — aria-hidden and paused under reduced motion.
const AMBIENT_PIECES = [
  { top: "6%",  left: "10%", size: 74,  rotate: 12,  delay: "0s",   duration: "22s", color: "var(--teal, #009B8D)",   opacity: 0.5,  blur: 0 },
  { top: "64%", left: "4%",  size: 50,  rotate: -18, delay: "-4s",  duration: "26s", color: "var(--purple, #6B2F8A)", opacity: 0.4,  blur: 0 },
  { top: "16%", left: "80%", size: 60,  rotate: 30,  delay: "-9s",  duration: "20s", color: "var(--pink, #E8175D)",   opacity: 0.45, blur: 0 },
  { top: "74%", left: "76%", size: 80,  rotate: -8,  delay: "-14s", duration: "28s", color: "var(--orange, #F26522)", opacity: 0.35, blur: 0 },
  { top: "44%", left: "90%", size: 44,  rotate: 50,  delay: "-2s",  duration: "18s", color: "var(--teal, #009B8D)",   opacity: 0.4,  blur: 0 },
  { top: "38%", left: "0%",  size: 40,  rotate: -35, delay: "-11s", duration: "24s", color: "var(--pink, #E8175D)",   opacity: 0.35, blur: 0 },
  { top: "88%", left: "26%", size: 34,  rotate: 20,  delay: "-7s",  duration: "21s", color: "var(--orange, #F26522)", opacity: 0.3,  blur: 0 },
  { top: "4%",  left: "46%", size: 120, rotate: -12, delay: "-16s", duration: "30s", color: "var(--purple, #6B2F8A)", opacity: 0.16, blur: 8 },
  { top: "60%", left: "42%", size: 140, rotate: 22,  delay: "-6s",  duration: "34s", color: "var(--teal, #009B8D)",   opacity: 0.14, blur: 10 },
];
 
export default function Login({ onVerified }) {
  const [mode, setMode] = useState("login"); // login | register | forgot | pending
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
 
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
 
  const [reg, setReg] = useState(EMPTY_REGISTER);
  const [forgotEmail, setForgotEmail] = useState("");
 
  const resetMessages = () => {
    setError("");
    setInfo("");
  };
 
  const switchMode = (next) => {
    resetMessages();
    setMode(next);
  };
 
  // ── LOGIN ──────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const profileSnap = await getDoc(doc(db, "users", cred.user.uid));
 
      if (!profileSnap.exists() || profileSnap.data().isVerified !== true) {
        // Known account, but an admin hasn't approved the staff/teacher
        // number yet — don't let them into the dashboard.
        await signOut(auth);
        setMode("pending");
        setLoading(false);
        return;
      }
 
      // Verified — let the parent know so it can hold the puzzle-assembly
      // transition on screen while the dashboard mounts underneath it.
      onVerified?.(profileSnap.data());
    } catch (err) {
      setError(friendlyAuthError(err));
    }
    setLoading(false);
  };
 
  // ── REGISTER ───────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();
 
    if (reg.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (reg.password !== reg.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!reg.staffNumber.trim()) {
      setError("Your staff / teacher number is required so we can verify you.");
      return;
    }
 
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, reg.email, reg.password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name: reg.name,
        email: reg.email,
        role: reg.role,
        staffNumber: reg.staffNumber.trim(),
        isVerified: false,
        createdAt: serverTimestamp(),
      });
      // New accounts start unverified — sign them straight back out so
      // App.js doesn't drop them into the dashboard.
      await signOut(auth);
      setReg(EMPTY_REGISTER);
      setMode("pending");
    } catch (err) {
      setError(friendlyAuthError(err));
    }
    setLoading(false);
  };
 
  // ── FORGOT PASSWORD ────────────────────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setInfo(`If ${forgotEmail} has an account, a reset link is on its way.`);
    } catch (err) {
      setError(friendlyAuthError(err));
    }
    setLoading(false);
  };
 
  return (
    <div className="pb-login-page">
      {/* ── LEFT: brand / ambient puzzle pieces ── */}
      <div className="pb-login-visual" aria-hidden="true">
        <div className="pb-login-visual-glow" />
        {AMBIENT_PIECES.map((p, i) => (
          <span
            key={i}
            className="pb-ambient-piece"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
              "--rot": `${p.rotate}deg`,
            }}
          >
            <SinglePuzzlePiece fill={p.color} opacity={p.opacity} rotate={p.rotate} />
          </span>
        ))}
        <div className="pb-login-visual-copy">
          <div className="pb-login-mark">
            <PuzzlePiece rotate={0}   fill="var(--teal, #009B8D)"   className="pb-mark-piece" />
            <PuzzlePiece rotate={90}  fill="var(--orange, #F26522)" className="pb-mark-piece" />
            <PuzzlePiece rotate={180} fill="var(--pink, #E8175D)"   className="pb-mark-piece" />
            <PuzzlePiece rotate={270} fill="var(--purple, #6B2F8A)" className="pb-mark-piece" />
          </div>
          <h1>PuzzleBox</h1>
          <p></p>
        </div>
      </div>
 
      {/* ── RIGHT: form ── */}
      <div className="pb-login-panel">
        <div className="pb-login-card">
          <div className="pb-login-card-head">
            <div className="pb-login-eyebrow">The Puzzle Project · Screener System</div>
            <h2>
              {mode === "login" && "Welcome back"}
              {mode === "register" && "Request access"}
              {mode === "forgot" && "Reset your password"}
              {mode === "pending" && "Verification pending"}
            </h2>
            <p className="pb-login-sub">
              {mode === "login" && "Sign in with your verified email and password."}
              {mode === "register" && "Register with your staff or teacher number so an admin can verify you."}
              {mode === "forgot" && "We'll email you a link to set a new password."}
              {mode === "pending" && "Your account has been created but is waiting on admin approval."}
            </p>
          </div>
 
          {error && <div className="pb-alert pb-alert-error">{error}</div>}
          {info && <div className="pb-alert pb-alert-info">{info}</div>}
 
          {mode === "login" && (
            <form onSubmit={handleLogin}>
              <label className="pb-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="pb-input"
                type="email"
                placeholder="you@puzzleproject.org.za"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <div className="pb-label-row">
                <label className="pb-label" htmlFor="login-password">Password</label>
                <button type="button" className="pb-link-btn" onClick={() => switchMode("forgot")}>
                  Forgot password?
                </button>
              </div>
              <input
                id="login-password"
                className="pb-input"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button className="pb-submit" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
              <div className="pb-switch-row">
                Not registered yet?{" "}
                <button type="button" className="pb-link-btn" onClick={() => switchMode("register")}>
                  Request access
                </button>
              </div>
            </form>
          )}
 
          {mode === "register" && (
            <form onSubmit={handleRegister}>
              <label className="pb-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                className="pb-input"
                placeholder="e.g. Nomsa Dlamini"
                value={reg.name}
                onChange={(e) => setReg({ ...reg, name: e.target.value })}
                required
              />
 
              <label className="pb-label">Role</label>
              <div className="pb-role-grid">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    className={`pb-role-chip ${reg.role === r.value ? "active" : ""}`}
                    style={{ "--chip-color": r.color }}
                    onClick={() => setReg({ ...reg, role: r.value })}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
 
              <label className="pb-label" htmlFor="reg-staff">
                Staff / teacher number <span className="pb-required">— used to verify you</span>
              </label>
              <input
                id="reg-staff"
                className="pb-input"
                placeholder="e.g. SACE-0234871"
                value={reg.staffNumber}
                onChange={(e) => setReg({ ...reg, staffNumber: e.target.value })}
                required
              />
 
              <label className="pb-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                className="pb-input"
                type="email"
                placeholder="you@puzzleproject.org.za"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
                required
                autoComplete="email"
              />
 
              <div className="pb-input-pair">
                <div>
                  <label className="pb-label" htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    className="pb-input"
                    type="password"
                    placeholder="At least 6 characters"
                    value={reg.password}
                    onChange={(e) => setReg({ ...reg, password: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="pb-label" htmlFor="reg-confirm">Confirm</label>
                  <input
                    id="reg-confirm"
                    className="pb-input"
                    type="password"
                    placeholder="Repeat password"
                    value={reg.confirm}
                    onChange={(e) => setReg({ ...reg, confirm: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
 
              <button className="pb-submit" type="submit" disabled={loading}>
                {loading ? "Submitting…" : "Submit for verification →"}
              </button>
              <div className="pb-switch-row">
                Already verified?{" "}
                <button type="button" className="pb-link-btn" onClick={() => switchMode("login")}>
                  Sign in instead
                </button>
              </div>
            </form>
          )}
 
          {mode === "forgot" && (
            <form onSubmit={handleForgot}>
              <label className="pb-label" htmlFor="forgot-email">Email address</label>
              <input
                id="forgot-email"
                className="pb-input"
                type="email"
                placeholder="you@puzzleproject.org.za"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <button className="pb-submit" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send reset link →"}
              </button>
              <div className="pb-switch-row">
                <button type="button" className="pb-link-btn" onClick={() => switchMode("login")}>
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}
 
          {mode === "pending" && (
            <div className="pb-pending">
              <div className="pb-pending-icon">🧩</div>
              <p>
                Thanks — your details are in. An administrator needs to confirm your staff or
                teacher number before you can sign in. This is usually quick, but check back
                later if you haven't heard anything.
              </p>
              <button className="pb-submit" onClick={() => switchMode("login")}>
                ← Back to sign in
              </button>
            </div>
          )}
 
          <div className="pb-login-footer">
            
            <br />
           
          </div>
        </div>
      </div>
    </div>
  );
}
 
function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered — try signing in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Invalid email or password. Please try again.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts — please wait a moment and try again.";
  return "Something went wrong. Please try again.";
}
 
/*
README — wiring this in
========================
1. Firestore: this expects a "users/{uid}" doc with { name, email, role,
   staffNumber, isVerified, createdAt }. Add a small admin view (or just
   flip isVerified to true by hand in the Firebase console for now) to
   approve new staff/teacher numbers.
 
2. App.js needs two small changes so the puzzle-assembly animation can
   play across the login → dashboard handoff:
 
   const [transitioning, setTransitioning] = useState(false);
   const [profile, setProfile] = useState(null);
 
   ...
 
   return user ? (
     <>
       <Dashboard user={user} profile={profile} />
       {transitioning && (
         <PuzzleTransition onComplete={() => setTransitioning(false)} />
       )}
     </>
   ) : (
     <Login onVerified={(p) => { setProfile(p); setTransitioning(true); }} />
   );
 
3. Drop PuzzleTransition.js next to Login.js — it's the full-screen
   "pieces fly together" animation, self-contained and self-dismissing.
*/