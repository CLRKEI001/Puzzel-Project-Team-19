import React from "react";
import {
  COLORS, FONT_IMPORT, PuzzlePiece, PuzzlePhoto, Navbar, Footer, CallToAction, CONTACT_EMAIL, useIsMobile,
} from "./SiteChrome";

// ---------------------------------------------------------------------------
// Purchase — "Buy The Puzzle Box Screener"
//
// The sponsor's wireframes add a "Purchase" link to The Puzzle Box navigation
// and a "Buy The Puzzle Box Screener" button for logged-in users, but do not
// sketch the page itself. This is a first version: what the buyer receives and
// how to order. There is no online payment yet — ordering is by email — so
// swap the mailto button for a checkout when one exists.
//
// `PurchaseContent` is exported so the logged-in "Buy" view (TrainingPortal /
// MemberArea) can show exactly the same content without the public chrome.
// ---------------------------------------------------------------------------

const INCLUDED = [
  { title: "The physical screener kit", desc: "Everything needed to run the puzzle activity with a child aged 5 to 6.", color: COLORS.teal },
  { title: "A unique Product number", desc: "Supplied with every screener. You enter it after logging in to unlock the training modules.", color: COLORS.pink },
  { title: "Access to the screening platform", desc: "Once your training is complete and your credentials are verified, you can capture and view screenings online.", color: COLORS.purple },
];

export function PurchaseContent() {
  const isMobile = useIsMobile(860);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Purchase — The Puzzle Box Screener")}&body=${encodeURIComponent("Hello,\n\nI would like to purchase The Puzzle Box Screener.\n\nName:\nOrganisation / school:\nNumber of screeners:\nContact number:\n")}`;

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto" }}>
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
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 20 }}>
            One screener, everything you need to get certified
          </h2>
          <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
            {INCLUDED.map(item => (
              <div key={item.title} style={{
                padding: "16px 18px", borderRadius: 14, background: COLORS.white,
                border: `1px solid ${COLORS.border}`, borderLeft: `4px solid ${item.color}`,
              }}>
                <h3 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15.5, fontWeight: 900, color: COLORS.ink, marginBottom: 4 }}>{item.title}</h3>
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
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 900, color: COLORS.ink }}>To be confirmed</p>
          </div>

          <a href={mailto} style={{
            display: "inline-block", padding: "14px 32px", borderRadius: 12,
            background: COLORS.teal, color: COLORS.white, textDecoration: "none",
            fontWeight: 800, fontSize: 15, fontFamily: "inherit",
            boxShadow: "0 6px 20px rgba(0,155,141,0.25)",
          }}>
            Request to purchase
          </a>
          <p style={{ fontSize: 12.5, color: COLORS.inkFaint, marginTop: 12, lineHeight: 1.6 }}>
            There is no online checkout yet — purchase requests are handled by email.
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
    <div style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
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
            fontFamily: "'Nunito', sans-serif", fontSize: "clamp(34px, 4.4vw, 56px)",
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
