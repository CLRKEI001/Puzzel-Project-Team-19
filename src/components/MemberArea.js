import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { supabase } from "../supabaseClient";
import { COLORS, FONT_IMPORT, BrandLogo, useIsMobile } from "./SiteChrome";
import { PurchaseContent } from "./PuzzleBoxPurchase";
import { MODULES } from "./Trainingpage";
import ThemeToggle from "../theme/ThemeToggle";

// ---------------------------------------------------------------------------
// Logged-in area for Tier 1 (educator) and Tier 2 (psychologist) users.
//
// Sponsor wireframe TPB p4: "Login provides the following 2 buttons:
// Training · Buy The Puzzle Box Screener".  TPB p6: Training needs the login
// details PLUS the Product number assigned to each screener supplied.
//
// view: "landing" | "training" | "purchase"   (App.js owns this state;
// `onView(null)` means "carry on to my dashboard").
//
// Product numbers are checked by the redeem_product_number() function added in
// supabase/migrations/003_screener_product_numbers.sql.
// ---------------------------------------------------------------------------

const TIER_LABEL = { educator: "Tier 1 · Teachers & Primary Healthcare", psychologist: "Tier 2 · Psychologists" };

function Shell({ profile, onBack, backLabel, children }) {
  const isMobile = useIsMobile(640);
  return (
    <div style={{ minHeight: "100vh", background: COLORS.surface, fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <header style={{
        background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`,
        padding: isMobile ? "14px 20px" : "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
      }}>
        <BrandLogo site="pb" height={80} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ textAlign: "right", lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.ink }}>{profile?.name}</div>
            <div style={{ fontSize: 11.5, color: COLORS.inkFaint }}>{TIER_LABEL[profile?.role] || "Signed in"}</div>
          </div>
          {onBack && (
            <button onClick={onBack} style={{
              padding: "9px 16px", borderRadius: 10, background: COLORS.white, color: COLORS.teal,
              border: `1.5px solid ${COLORS.teal}`, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>{backLabel}</button>
          )}
          <ThemeToggle />
          <button onClick={() => signOut(auth)} style={{
            padding: "9px 16px", borderRadius: 10, background: "none", color: COLORS.inkMid,
            border: `1.5px solid ${COLORS.border}`, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>Sign out</button>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "32px 20px 64px" : "56px 40px 90px" }}>
        {children}
      </main>
    </div>
  );
}

function BigButton({ color, title, desc, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "30px 28px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
      background: COLORS.white, border: `1px solid ${COLORS.border}`, borderTop: `4px solid ${color}`,
      boxShadow: "0 2px 16px rgba(0,0,0,0.04)", transition: "all 0.2s", width: "100%",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 21, fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.65, marginBottom: 14 }}>{desc}</div>
      <span style={{ fontSize: 14, fontWeight: 800, color }}>Open →</span>
    </button>
  );
}

function Landing({ profile, onView }) {
  const first = (profile?.name || "").split(" ")[0];
  return (
    <>
      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 12 }}>
        {TIER_LABEL[profile?.role]}
      </p>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
        Welcome{first ? `, ${first}` : ""}
      </h1>
      <p style={{ fontSize: 16, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 620, marginBottom: 36 }}>
        Start your training, or get a Puzzle Box Screener. Already trained? Go straight to your dashboard.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22, marginBottom: 32 }}>
        <BigButton color={COLORS.teal} title="Training"
          desc="Unlock the certification modules with your Product number."
          onClick={() => onView("training")} />
        <BigButton color={COLORS.pink} title="Buy The Puzzle Box Screener"
          desc="See what's included and request a screener."
          onClick={() => onView("purchase")} />
      </div>
      <button onClick={() => onView(null)} style={{
        background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
        fontSize: 14, fontWeight: 800, color: COLORS.teal,
      }}>Continue to my dashboard →</button>
    </>
  );
}

function Training({ user }) {
  const [state, setState] = useState("checking"); // checking | locked | unlocked
  const [number, setNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error: err } = await supabase
          .from("training_access").select("product_number").eq("user_id", user.uid).maybeSingle();
        if (err) throw err;
        if (!cancelled) setState(data ? "unlocked" : "locked");
      } catch {
        // Table missing (migration 003 not run yet) or offline — fall back to the entry form,
        // which shows a clear message if the check itself can't be made.
        if (!cancelled) setState("locked");
      }
    })();
    return () => { cancelled = true; };
  }, [user.uid]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!number.trim()) { setError("Please enter your Product number."); return; }
    setBusy(true);
    try {
      const { data, error: err } = await supabase.rpc("redeem_product_number", {
        p_user_id: user.uid, p_email: user.email, p_product_number: number,
      });
      if (err) throw err;
      if (data === "ok") setState("unlocked");
      else setError("We didn't recognise that Product number. Check the number supplied with your screener and try again.");
    } catch {
      setError("We couldn't check your Product number just now. Please try again, or contact the Puzzle Project team.");
    }
    setBusy(false);
  };

  if (state === "checking") return <p style={{ color: COLORS.inkMid }}>Checking your training access…</p>;

  if (state === "locked") {
    return (
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>Training</h1>
        <p style={{ fontSize: 15.5, color: COLORS.inkMid, lineHeight: 1.75, marginBottom: 26 }}>
          To open the training, enter the Product number supplied with your Puzzle Box Screener.
        </p>
        <form onSubmit={submit} style={{ padding: "26px 26px 28px", borderRadius: 18, background: COLORS.white, border: `1px solid ${COLORS.border}` }}>
          <label htmlFor="product-number" style={{ display: "block", fontSize: 13, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Product number</label>
          <input id="product-number" value={number} onChange={e => setNumber(e.target.value)} autoComplete="off"
            placeholder="e.g. PB-XXXX-XXXX"
            style={{ width: "100%", padding: "13px 16px", borderRadius: 11, border: `1.5px solid ${COLORS.border}`, fontSize: 15, fontFamily: "inherit", marginBottom: 14, outline: "none" }} />
          {error && <div role="alert" style={{ padding: "10px 14px", borderRadius: 10, background: COLORS.pinkLight, color: COLORS.pink, fontSize: 13.5, marginBottom: 14 }}>{error}</div>}
          <button type="submit" disabled={busy} style={{
            padding: "13px 28px", borderRadius: 12, background: COLORS.teal, color: COLORS.white, border: "none",
            fontWeight: 800, fontSize: 15, cursor: busy ? "default" : "pointer", fontFamily: "inherit", opacity: busy ? 0.7 : 1,
          }}>{busy ? "Checking…" : "Unlock training"}</button>
        </form>
      </div>
    );
  }

  return (
    <>
      <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 16, background: COLORS.tealLight, color: COLORS.teal, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Training unlocked</span>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>Training modules</h1>
      <p style={{ fontSize: 15.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 640, marginBottom: 28 }}>
        Complete the seven modules in order, followed by the certification assessment. The module content itself isn't loaded into the platform yet, so each one is marked as coming soon.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {MODULES.map(mod => (
          <div key={mod.number} style={{ padding: "20px 22px", borderRadius: 16, background: COLORS.white, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: mod.bg, color: mod.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: "'Nunito', sans-serif", flexShrink: 0 }}>{mod.number}</div>
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, fontWeight: 800, color: COLORS.ink, lineHeight: 1.3 }}>{mod.title}</div>
              <div style={{ fontSize: 12, color: COLORS.inkFaint, marginTop: 3 }}>Coming soon</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function MemberArea({ user, profile, view, onView }) {
  const isLanding = view === "landing";
  return (
    <Shell
      profile={profile}
      onBack={isLanding ? null : () => onView("landing")}
      backLabel="← Back"
    >
      {isLanding && <Landing profile={profile} onView={onView} />}
      {view === "training" && <Training user={user} />}
      {view === "purchase" && (
        <>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 28 }}>Buy The Puzzle Box Screener</h1>
          <PurchaseContent />
        </>
      )}
      {!isLanding && (
        <div style={{ marginTop: 40 }}>
          <button onClick={() => onView(null)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800, color: COLORS.teal }}>
            Continue to my dashboard →
          </button>
        </div>
      )}
    </Shell>
  );
}