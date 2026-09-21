// Login.js — PuzzleBox Screener System
// Handles: sign in, new-account registration (with staff/teacher number
// captured for future verification), and forgot-password.
//
// Sign-up creates the account but does NOT grant access: every new account
// is inserted with is_verified = false, and App.js's gate (PendingApproval)
// keeps it off every dashboard until an admin approves it there. This file
// only needs to create the account correctly — the actual gate lives in
// App.js so it can't be bypassed by any other entry point into the app.

import React, { useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { supabase } from "../supabaseClient";
import { mapUserRow } from "../lib/mappers";
import { PuzzlePiece, SinglePuzzlePiece } from "./puzzlePiece";
import "./Login.css";

// Administrator is deliberately NOT self-registerable here — letting anyone
// pick "Administrator" at sign-up and land on AdminHome the moment an
// admin (or a bug) mis-clicks Approve would defeat the whole point of an
// approval gate. Admin accounts are created by promoting an existing user
// (update their `role` directly) — see the note under the role picker.
const ROLES = [
  { value: "educator", label: "Educator / Teacher", color: "var(--orange, #F26522)" },
  { value: "psychologist", label: "Psychologist", color: "var(--pink, #E8175D)" },
  { value: "analyst", label: "Data Analyst", color: "var(--teal, #009B8D)" },
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

export default function Login({ onVerified, onBack }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
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
      const { data: profileRow, error: profileError } = await supabase.from("users").select("*").eq("id", cred.user.uid).maybeSingle();
      if (profileError) throw profileError;

      // Hand whatever we found to App.js unfiltered — including a missing
      // row (e.g. a rejected account) or is_verified: false. App.js's gate
      // is what decides whether that's enough to reach a dashboard; this
      // component never makes that call itself.
      onVerified?.(profileRow ? mapUserRow(profileRow) : null);
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
      setError("Your staff / teacher number is required.");
      return;
    }

    setLoading(true);
    try {
      // A lightweight duplicate check before creating the Firebase account —
      // makes it harder to flood the admin's Pending Approvals list with
      // near-identical fake accounts under the same staff/teacher number.
      const { data: existing, error: dupError } = await supabase
        .from("users")
        .select("id")
        .eq("staff_number", reg.staffNumber.trim())
        .maybeSingle();
      if (dupError) throw dupError;
      if (existing) {
        setError("That staff / teacher number is already registered. Try signing in, or contact your administrator.");
        setLoading(false);
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, reg.email, reg.password);
      const newProfile = {
        id: cred.user.uid,
        name: reg.name,
        email: reg.email,
        role: reg.role,
        staff_number: reg.staffNumber.trim(),
        is_verified: false, // the actual gate — see App.js / PendingApproval.js
      };
      const { error: insertError } = await supabase.from("users").insert(newProfile);
      if (insertError) throw insertError;

      // Hands off to App.js's gate, which will render PendingApproval
      // (is_verified is false) rather than any dashboard.
      onVerified?.(mapUserRow(newProfile));
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
          <button
            type="button"
            className="pb-back-home"
            onClick={onBack}
            aria-label="Back to home"
            title="Back to home"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="pb-login-card-head">
            <div className="pb-login-eyebrow">The Puzzle Project · Screener System</div>
            <h2>
              {mode === "login" && "Welcome back"}
              {mode === "register" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
            </h2>
            <p className="pb-login-sub">
              {mode === "login" && "Sign in with your email and password."}
              {mode === "register" && "Register with your staff or teacher number."}
              {mode === "forgot" && "We'll email you a link to set a new password."}
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
                  Create an account
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
              <p style={{ fontSize: 12, color: "var(--ink-faint, #8888a8)", margin: "-6px 0 14px" }}>
                Need an administrator account? Ask an existing admin to grant it —
                admin access isn't available through self sign-up.
              </p>

              <label className="pb-label" htmlFor="reg-staff">
                Staff / teacher number
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
                {loading ? "Creating account…" : "Create account →"}
              </button>
              <div className="pb-switch-row">
                Already have an account?{" "}
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
1. Supabase: this expects a "users" table with columns { id (Firebase UID,
   primary key), name, email, role, staff_number, is_verified, created_at }.
   is_verified is the real approval gate — App.js renders PendingApproval
   instead of any dashboard until an admin flips it true from AdminHome's
   Pending Approvals list.

2. App.js's onAuthStateChanged loads whatever profile exists for the
   signed-in Firebase user (including none at all) and lets its gate decide
   what to render — this file never grants access itself.

3. Drop PuzzleTransition.js next to Login.js — it's the full-screen
   "pieces fly together" animation, played only once an approved account
   actually reaches a dashboard.
*/