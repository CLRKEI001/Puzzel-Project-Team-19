import React, { useState, useEffect } from "react";
import {
  COLORS, FONTS, PUBLIC_FONT_IMPORT, PuzzlePiece, PuzzlePhoto, Navbar, Footer, CallToAction, useIsMobile,
} from "./SiteChrome";
import { supabase } from "../supabaseClient";
import { mapPurchaseRequestRow } from "../lib/mappers";

// ---------------------------------------------------------------------------
// Purchase — "Buy The Puzzle Box Screener"
//
// The sponsor's wireframes add a "Purchase" link to The Puzzle Box navigation
// and a "Buy The Puzzle Box Screener" button for logged-in users, but do not
// sketch the page itself. This is a first version: what the buyer receives and
// how to order. There is still no online payment/checkout — but "Request to
// purchase" is no longer a mailto link. It opens an in-page form that writes
// a row to the new `purchase_requests` table (see migration 013), which then
// shows up on Admin → Purchase Requests for an admin to action: they fill in
// a Product number there and mark the request fulfilled.
//
// `PurchaseContent` is exported so the logged-in "Buy" view (TrainingPortal /
// MemberArea) can show exactly the same content without the public chrome.
// ---------------------------------------------------------------------------

const INCLUDED = [
  { title: "The physical screener kit", desc: "Everything needed to run the puzzle activity with a child aged 5 to 6.", color: COLORS.teal },
  { title: "A unique Product number", desc: "Supplied with every screener. You enter it after logging in to unlock the training modules.", color: COLORS.pink },
  { title: "Access to the screening platform", desc: "Once your training is complete and your credentials are verified, you can capture and view screenings online.", color: COLORS.purple },
];

const EMPTY_FORM = { name: "", email: "", organisation: "", phone: "", numberOfScreeners: "", message: "" };

// Shared text-input styling so the form matches the rest of the public site
// (same radius/border tokens as the cards above it) without a new stylesheet.
const fieldStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: `1.5px solid ${COLORS.border}`, background: COLORS.surface,
  fontFamily: "inherit", fontSize: 14, color: COLORS.ink,
};
const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 800, color: COLORS.inkMid, marginBottom: 6 };

export function PurchaseContent({ user }) {
  const isMobile = useIsMobile(860);
  // "info" = the what-you-get panel with the CTA · "form" = the request
  // form · "sent" = confirmation after a successful submit.
  const [view, setView] = useState("info");
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    name: user?.displayName || "",
    email: user?.email || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Only meaningful for a logged-in user (MemberArea passes `user`; the
  // public page doesn't). Once an admin fulfils their purchase request, the
  // Product number shows up right here — no email step needed to get it.
  const [myLatestRequest, setMyLatestRequest] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let isMounted = true;

    const loadMyRequest = async () => {
      const { data, error: loadErr } = await supabase
        .from("purchase_requests")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (loadErr) {
        console.error("Error loading purchase request status:", loadErr.message);
        return;
      }
      if (isMounted) setMyLatestRequest(data ? mapPurchaseRequestRow(data) : null);
    };

    loadMyRequest();

    const channel = supabase
      .channel(`my-purchase-request-${user.email}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_requests", filter: `email=eq.${user.email}` },
        () => loadMyRequest()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.organisation.trim()) {
      setError("Please fill in your name, email and organisation / school.");
      return;
    }

    setSubmitting(true);
    const { error: insertErr } = await supabase.from("purchase_requests").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      organisation: form.organisation.trim(),
      phone: form.phone.trim() || null,
      number_of_screeners: form.numberOfScreeners ? parseInt(form.numberOfScreeners, 10) : null,
      message: form.message.trim() || null,
    });
    setSubmitting(false);

    if (insertErr) {
      console.error("Error submitting purchase request:", insertErr.message);
      setError("Something went wrong sending your request — please try again.");
      return;
    }

    setView("sent");
  };

  if (view === "sent") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: isMobile ? "20px 0" : "40px 0" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: COLORS.tealLight, color: COLORS.teal,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px",
        }}>
          ✓
        </div>
        <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 900, color: COLORS.ink, marginBottom: 12 }}>
          Request received
        </h2>
        <p style={{ fontSize: 15, color: COLORS.inkMid, lineHeight: 1.75, marginBottom: 24 }}>
          Thanks, {form.name.split(" ")[0]} — someone from our team will be in touch at {form.email} with pricing and your screener's Product number once your order is confirmed.
        </p>
        <button onClick={() => { setForm({ ...EMPTY_FORM, name: user?.displayName || "", email: user?.email || "" }); setView("info"); }} style={{
          background: "none", border: `1.5px solid ${COLORS.border}`, borderRadius: 10,
          padding: "10px 20px", fontWeight: 800, fontSize: 13.5, color: COLORS.ink, cursor: "pointer", fontFamily: "inherit",
        }}>
          ← Back
        </button>
      </div>
    );
  }

  if (view === "form") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <button onClick={() => setView("info")} style={{
          background: "none", border: "none", padding: 0, marginBottom: 18, cursor: "pointer",
          fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: COLORS.inkMid,
        }}>
          ← Back
        </button>
        <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>
          Request to purchase
        </h2>
        <p style={{ fontSize: 14, color: COLORS.inkMid, lineHeight: 1.65, marginBottom: 24 }}>
          Tell us a bit about your order and we'll follow up with pricing and your screener's Product number.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={labelStyle}>Your name *</label>
            <input style={fieldStyle} value={form.name} onChange={setField("name")} placeholder="Jane Dlamini" />
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" style={fieldStyle} value={form.email} onChange={setField("email")} placeholder="jane@school.org" />
          </div>
          <div>
            <label style={labelStyle}>Organisation / school *</label>
            <input style={fieldStyle} value={form.organisation} onChange={setField("organisation")} placeholder="Sunshine Preschool" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Contact number</label>
              <input style={fieldStyle} value={form.phone} onChange={setField("phone")} placeholder="082 000 0000" />
            </div>
            <div>
              <label style={labelStyle}>Number of screeners</label>
              <input type="number" min="1" style={fieldStyle} value={form.numberOfScreeners} onChange={setField("numberOfScreeners")} placeholder="1" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Anything else we should know?</label>
            <textarea rows={3} style={{ ...fieldStyle, resize: "vertical" }} value={form.message} onChange={setField("message")} placeholder="Optional" />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: COLORS.pink, background: COLORS.pinkLight, borderRadius: 10, padding: "10px 14px" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{
            display: "inline-block", padding: "14px 32px", borderRadius: 12, border: "none",
            background: COLORS.teal, color: COLORS.white, fontWeight: 800, fontSize: 15, fontFamily: "inherit",
            cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1,
            boxShadow: "0 6px 20px rgba(0,155,141,0.25)", justifySelf: "start",
          }}>
            {submitting ? "Sending…" : "Send request"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto" }}>
      {myLatestRequest?.status === "fulfilled" && (
        <div style={{
          padding: "20px 24px", borderRadius: 16, marginBottom: 28,
          background: COLORS.tealLight, border: `1px solid ${COLORS.border}`,
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 800, color: COLORS.teal, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              ✓ Your order is ready
            </p>
            <p style={{ fontSize: 13.5, color: COLORS.inkMid }}>Enter this Product number on your dashboard to unlock training.</p>
          </div>
          <div style={{
            fontFamily: "monospace", fontWeight: 800, fontSize: 18, letterSpacing: "0.04em",
            color: COLORS.ink, background: COLORS.white, padding: "10px 18px", borderRadius: 10,
            border: `1.5px solid ${COLORS.teal}`,
          }}>
            {myLatestRequest.productNumber}
          </div>
        </div>
      )}

      {myLatestRequest && myLatestRequest.status !== "fulfilled" && myLatestRequest.status !== "declined" && (
        <div style={{
          padding: "16px 20px", borderRadius: 14, marginBottom: 28,
          background: COLORS.surface, border: `1px solid ${COLORS.border}`,
        }}>
          <p style={{ fontSize: 13.5, color: COLORS.inkMid, fontWeight: 700 }}>
            ● Your request from {new Date(myLatestRequest.createdAt).toLocaleDateString()} is being reviewed — we'll follow up at {myLatestRequest.email}.
          </p>
        </div>
      )}

      {myLatestRequest?.status === "declined" && (
        <div style={{
          padding: "16px 20px", borderRadius: 14, marginBottom: 28,
          background: COLORS.pinkLight, border: `1px solid ${COLORS.border}`,
        }}>
          <p style={{ fontSize: 13.5, color: COLORS.ink, fontWeight: 700 }}>
            Your previous request wasn't able to go ahead. Feel free to send another with more detail, or get in touch.
          </p>
        </div>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr",
        gap: isMobile ? 32 : 56, alignItems: "center",
      }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PuzzlePhoto
            size={isMobile ? 240 : 320}
            label="Screener kit photo"
            alt="The Puzzle Box Screener kit"
            color={COLORS.teal}
            edges={{ top: 0, right: 1, bottom: 1, left: 0 }}
            style={{ filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.12))" }}
            /* src="/images/puzzle-box-kit.jpg" */
          />
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.teal, marginBottom: 12 }}>
            What you receive
          </p>
          <h2 style={{ fontFamily: FONTS.heading, fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 20 }}>
            One screener, everything you need to get certified
          </h2>
          <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
            {INCLUDED.map(item => (
              <div key={item.title} style={{
                padding: "16px 18px", borderRadius: 14, background: COLORS.white,
                border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${item.color}`,
              }}>
                <h3 style={{ fontFamily: FONTS.heading, fontSize: 15.5, fontWeight: 900, color: COLORS.ink, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: COLORS.inkMid, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{
            padding: "18px 20px", borderRadius: 14, marginBottom: 22,
            background: `linear-gradient(135deg, ${COLORS.tealLight}, ${COLORS.purpleLight})`,
            border: `1px solid ${COLORS.border}`,
          }}>
            <p style={{ fontSize: 11.5, fontWeight: 800, color: COLORS.teal, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Price</p>
            <p style={{ fontFamily: FONTS.heading, fontSize: 20, fontWeight: 900, color: COLORS.ink }}>To be confirmed</p>
          </div>

          <button onClick={() => setView("form")} style={{
            display: "inline-block", padding: "14px 32px", borderRadius: 12, border: "none",
            background: COLORS.teal, color: COLORS.white,
            fontWeight: 800, fontSize: 15, fontFamily: "inherit", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0,155,141,0.25)",
          }}>
            {myLatestRequest ? "Request another screener" : "Request to purchase"}
          </button>
          <p style={{ fontSize: 12.5, color: COLORS.inkFaint, marginTop: 12, lineHeight: 1.6 }}>
            There is no online checkout yet — tell us what you need and we'll follow up with pricing and a Product number.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PuzzleBoxPurchase({ onNavigate, onNavigateToLogin }) {
  const go = onNavigate || (() => console.warn("No onNavigate handler passed to PuzzleBoxPurchase"));
  const isMobile = useIsMobile(640);

  return (
    <div style={{ fontFamily: FONTS.body }}>
      <style>{PUBLIC_FONT_IMPORT}</style>
      <Navbar site="pb" current="pb-purchase" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />

      <section style={{
        paddingTop: 84,
        background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.surface} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <PuzzlePiece size={150} color={COLORS.pink} rotate={12} style={{ position: "absolute", top: 50, right: -40 }} />
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: isMobile ? "48px 20px 40px" : "72px 40px 56px", position: "relative" }}>
          <span style={{
            display: "inline-block", padding: "7px 16px", borderRadius: 20,
            background: COLORS.tealLight, border: `1px solid rgba(0,155,141,0.25)`,
            fontSize: 12, fontWeight: 800, color: COLORS.teal, marginBottom: 24,
          }}>
            Purchase
          </span>
          <h1 style={{
            fontFamily: FONTS.heading, fontSize: "clamp(34px, 4.4vw, 56px)",
            fontWeight: 900, color: COLORS.ink, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 20,
          }}>
            Buy The Puzzle Box Screener
          </h1>
          <p style={{ fontSize: 17, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 680 }}>
            Every screener comes with a Product number. Once you have your screener, log in and use the number to unlock your training.
          </p>
        </div>
      </section>

      <section style={{ padding: isMobile ? "48px 20px 64px" : "72px 40px 96px", background: COLORS.surface }}>
        <PurchaseContent />
      </section>

      <CallToAction />
      <Footer site="pb" onNavigate={go} onLoginClick={() => onNavigateToLogin()} />
    </div>
  );
}