import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
 
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };
 
  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.png" alt="The Puzzle Project" className="login-logo" />
        <div className="login-title">Psychologist Portal</div>
        <div className="login-sub">Sign in to access the PuzzleBox Screener System</div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <label className="login-label">Email Address</label>
          <input
            className="login-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="login-label">Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
        <div className="login-footer">
          The Puzzle Project · Screener System 2026<br />
          University of Cape Town · INF3003W Team 19
        </div>
      </div>
    </div>
  );
}