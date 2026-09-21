// PendingApproval.js — the screen an account sits on between "signed up"
// and "an admin approved them". This IS the safety gate: App.js renders
// this instead of any dashboard whenever profile is missing or
// profile.isVerified is false, so a freshly-registered (or rejected)
// account can never reach real screening data.

import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { supabase } from "../supabaseClient";
import { mapUserRow } from "../lib/mappers";
import { enablePushNotifications, pushSupported } from "../lib/push";
import { SinglePuzzlePiece } from "./puzzlePiece";
import "./Login.css";

const ROLE_LABEL = { educator: "Educator / Teacher", psychologist: "Psychologist", analyst: "Data Analyst", admin: "Administrator" };

export default function PendingApproval({ user, profile, onApproved }) {
  const [notifyState, setNotifyState] = useState("idle"); // idle | requesting | on | unsupported | denied | error
  const [checking, setChecking] = useState(false);

  // Live: the moment an admin flips is_verified (or the row reappears after
  // having been missing), pull the fresh profile and hand off to App.js —
  // no manual refresh needed.
  useEffect(() => {
    let cancelled = false;

    const refetch = async () => {
      const { data } = await supabase.from("users").select("*").eq("id", user.uid).maybeSingle();
      if (cancelled || !data) return;
      const mapped = mapUserRow(data);
      if (mapped.isVerified) onApproved?.(mapped);
    };

    const channel = supabase
      .channel(`pending-approval-${user.uid}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `id=eq.${user.uid}` }, refetch)
      .subscribe();

    // Realtime replication has to be turned on per-table in the Supabase
    // dashboard (see the notes on the messages/screenings migrations) —
    // this poll is a safety net in case it isn't, so approval is never
    // silently missed while someone's sitting on this screen.
    const poll = setInterval(refetch, 15000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const checkNow = async () => {
    setChecking(true);
    const { data } = await supabase.from("users").select("*").eq("id", user.uid).maybeSingle();
    setChecking(false);
    const mapped = data ? mapUserRow(data) : null;
    if (mapped?.isVerified) onApproved?.(mapped);
  };

  const handleEnablePush = async () => {
    setNotifyState("requesting");
    if (!pushSupported()) { setNotifyState("unsupported"); return; }
    const result = await enablePushNotifications(user.uid);
    if (result.ok) setNotifyState("on");
    else if (result.reason === "denied") setNotifyState("denied");
    else setNotifyState("error");
  };

  const missingRow = !profile;

  return (
    <div className="pb-login-page">
      <div className="pb-login-visual" aria-hidden="true">
        <div className="pb-login-visual-glow" />
        <span className="pb-ambient-piece" style={{ top: "20%", left: "20%", width: 90, height: 90, "--rot": "10deg" }}>
          <SinglePuzzlePiece fill="var(--teal, #009B8D)" opacity={0.4} rotate={10} />
        </span>
        <span className="pb-ambient-piece" style={{ top: "60%", left: "68%", width: 70, height: 70, "--rot": "-15deg" }}>
          <SinglePuzzlePiece fill="var(--orange, #F26522)" opacity={0.35} rotate={-15} />
        </span>
        <div className="pb-login-visual-copy">
          <h1>PuzzleBox</h1>
        </div>
      </div>

      <div className="pb-login-panel">
        <div className="pb-login-card">
          <div className="pb-login-card-head">
            <div className="pb-login-eyebrow">The Puzzle Project · Screener System</div>
            {missingRow ? (
              <>
                <h2>Account not found</h2>
                <p>
                  We couldn't find a registration for this account. If you just signed up this should
                  resolve in a moment — otherwise, it may not have been approved. Contact your administrator.
                </p>
              </>
            ) : (
              <>
                <h2>⏳ Awaiting approval</h2>
                <p>
                  Thanks for signing up, {profile.name || user.email}. An administrator needs to approve
                  your account before you can sign in — you'll be brought straight through the moment
                  that happens, no need to refresh.
                </p>
              </>
            )}
          </div>

          {!missingRow && (
            <div style={{ background: "var(--surface, #F7F6FF)", borderRadius: 12, padding: "14px 16px", marginBottom: 18, fontSize: 13 }}>
              <div style={{ marginBottom: 4 }}><strong>Name:</strong> {profile.name || "—"}</div>
              <div style={{ marginBottom: 4 }}><strong>Email:</strong> {profile.email}</div>
              <div><strong>Role requested:</strong> {ROLE_LABEL[profile.role] || profile.role}</div>
            </div>
          )}

          {notifyState === "on" && <div className="pb-alert pb-alert-info"> We'll send you a notification as soon as you're approved.</div>}
          {notifyState === "denied" && <div className="pb-alert pb-alert-error">Notifications are blocked in your browser settings — you can still check back here.</div>}
          {notifyState === "unsupported" && <div className="pb-alert pb-alert-error">This browser doesn't support push notifications — you can still check back here.</div>}
          {notifyState === "error" && <div className="pb-alert pb-alert-error">Couldn't turn on notifications — please try again.</div>}

          {!missingRow && notifyState !== "on" && (
            <button className="pb-submit" type="button" onClick={handleEnablePush} disabled={notifyState === "requesting"}>
              {notifyState === "requesting" ? "Requesting…" : " Notify me when I'm approved"}
            </button>
          )}

          <button
            className="pb-submit"
            type="button"
            onClick={checkNow}
            disabled={checking}
            style={{ background: "transparent", color: "var(--ink, #1A1A2E)", border: "1.5px solid var(--border, #E4E1F5)", marginTop: 10 }}
          >
            {checking ? "Checking…" : "Check again"}
          </button>

          <div className="pb-switch-row" style={{ marginTop: 18 }}>
            <button type="button" className="pb-link-btn" onClick={() => signOut(auth)}>
              ← Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}