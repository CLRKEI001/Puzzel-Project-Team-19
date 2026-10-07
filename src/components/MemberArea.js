import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { supabase } from "../supabaseClient";
import { COLORS, FONT_IMPORT, BrandLogo, useIsMobile } from "./SiteChrome";
import { PurchaseContent } from "./PuzzleBoxPurchase";
import { useTrainingModules, audienceForRole } from "../lib/useTrainingModules";
import { useTrainingProgress } from "../lib/useTrainingProgress";
import { useTrainingContentBlocks } from "../lib/useTrainingContentBlocks.js";
import TrainingModuleQuiz from "./TrainingModuleQuiz";
import TrainingModuleContent from "./TrainingModuleContent";
import TrainingCertificate from "./TrainingCertificate";
import { getModuleContent } from "../data/trainingContent.v1";
import ThemeToggle from "../theme/ThemeToggle";

// Maps an admin's chosen colour key (see Admin → Training Modules) back
// to this site's actual brand colours.
function moduleColor(colorKey) {
  const key = colorKey || "teal";
  return { color: COLORS[key] || COLORS.teal, bg: COLORS[`${key}Light`] || COLORS.tealLight };
}

// A video placeholder box for a module. With no video_url set yet (the
// admin hasn't added one), it's a static "coming soon" box; once a link
// is added it becomes a clickable "Watch video" tile that opens it.
function VideoBlock({ url, color, bg }) {
  const content = (
    <>
      <span style={{
        width: 40, height: 40, borderRadius: "50%", background: url ? color : "rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg viewBox="0 0 16 16" width="15" height="15" fill={url ? "#fff" : "var(--ink-faint, #999)"}>
          <path d="M4 2.5v11l10-5.5-10-5.5z" />
        </svg>
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: url ? color : "var(--ink-faint, #999)" }}>
        {url ? "Watch video" : "Video coming soon"}
      </span>
    </>
  );

  const boxStyle = {
    marginTop: 12, padding: "12px 16px", borderRadius: 12,
    display: "flex", alignItems: "center", gap: 12,
    border: url ? "none" : "1.5px dashed var(--border, #ddd)",
    background: url ? bg : "transparent",
    textDecoration: "none", width: "fit-content",
  };

  return url
    ? <a href={url} target="_blank" rel="noreferrer" style={{ ...boxStyle, cursor: "pointer" }}>{content}</a>
    : <div style={boxStyle}>{content}</div>;
}

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
    <div style={{ minHeight: "100vh", background: COLORS.surface, fontFamily: "var(--font-body)" }}>
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
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 21, fontWeight: 900, color: COLORS.ink, marginBottom: 8 }}>{title}</div>
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
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 3.6vw, 44px)", fontWeight: 900, color: COLORS.ink, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 12 }}>
        Welcome{first ? `, ${first}` : ""}
      </h1>
      <p style={{ fontSize: 16, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 620, marginBottom: 36 }}>
        Get a Puzzle Box Screener, or start your training. Already trained? Go straight to your dashboard.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22, marginBottom: 32 }}>
        <BigButton color={COLORS.pink} title="Buy The Puzzle Box Screener"
          desc="See what's included and request a screener."
          onClick={() => onView("purchase")} />
        <BigButton color={COLORS.teal} title="Training"
          desc={profile?.role === "psychologist" ? "Work through the Tier 2 psychologist modules and earn your certification." : "Unlock the certification modules with your Product number."}
          onClick={() => onView("training")} />
      </div>
      <button onClick={() => onView(null)} style={{
        background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
        fontSize: 14, fontWeight: 800, color: COLORS.teal,
      }}>Continue to my dashboard →</button>
    </>
  );
}

// One module's full rich-content view: the storytelling/cards/tables from
// TrainingModuleContent.js, the module's quiz below it, and a progress
// badge driven by useTrainingProgress. Marks the module "viewed" as soon
// as it's opened; a passed quiz (>=70%, same threshold TrainingModuleQuiz
// already used) upgrades that to "quiz_passed".
function ModuleDetail({ user, mod, modules, onBack, onOpenModule, progressApi }) {
  const { color, bg } = moduleColor(mod.colorKey);
  // Content now lives in the database (training_content_blocks — see
  // src/lib/useTrainingContentBlocks.js and Admin -> Training -> Content)
  // so an admin can edit it without a code change. Falls back to the
  // original code-file content (src/data/trainingContent.v1.js) for any
  // module the seed migration (021_seed_training_content_blocks.sql)
  // hasn't been run for yet, so nothing breaks in between.
  const dbContent = useTrainingContentBlocks(mod.id);
  // The code-file fallback only describes the educator course
  const staticContent = mod.audience === "psychologist" ? null : getModuleContent(mod.sortOrder);
  const content = !dbContent.loading && dbContent.blocks.length > 0
    ? { blocks: dbContent.blocks.map((b) => b.data) }
    : staticContent;
  const progressRow = progressApi.progress.get(mod.id);

  const orderedIds = (modules || []).map((m) => m.id);
  const myIndex = orderedIds.indexOf(mod.id);
  const nextMod = myIndex >= 0 ? modules[myIndex + 1] : null;

  useEffect(() => {
    progressApi.markViewed(mod.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.id]);

  const handleResult = (outcome) => {
    progressApi.recordQuizResult(mod.id, outcome);
  };

  const isDone = progressRow?.status === "quiz_passed";

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, color: COLORS.teal, marginBottom: 22 }}>
        ← Back to modules
      </button>

      {isDone && (
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 16, background: COLORS.tealLight, color: COLORS.teal, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          ✓ Completed{progressRow.bestScorePercent != null ? ` · best score ${progressRow.bestScorePercent}%` : ""}
        </div>
      )}

      {content ? (
        <TrainingModuleContent content={content} colorKey={mod.colorKey} />
      ) : (
        <>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>{mod.title}</h1>
          {mod.description && <p style={{ fontSize: 14.5, color: COLORS.inkMid, lineHeight: 1.7, marginBottom: 20 }}>{mod.description}</p>}
          <VideoBlock url={mod.videoUrl} color={color} bg={bg} />
          {mod.contentUrl && (
            <a href={mod.contentUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 10, fontSize: 13, fontWeight: 700, color }}>
              Open resource →
            </a>
          )}
        </>
      )}

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 4 }}>Checkpoint</h3>
        <p style={{ fontSize: 13, color: COLORS.inkMid, marginBottom: 4 }}>Pass this module's quiz (70% or higher) to mark it complete.</p>
        <TrainingModuleQuiz
          moduleId={mod.id}
          color={color}
          onResult={handleResult}
        />
      </div>

      {isDone && (
        <div style={{
          marginTop: 24, padding: "18px 20px", borderRadius: 14,
          background: COLORS.tealLight, border: `1px solid ${COLORS.teal}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>
            {nextMod ? "Module complete — ready for the next one?" : "Module complete — that's the last module."}
          </div>
          {nextMod ? (
            <button
              onClick={() => onOpenModule(nextMod.id)}
              style={{
                background: color, color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap",
              }}
            >
              Continue to {nextMod.title} →
            </button>
          ) : (
            <button
              onClick={onBack}
              style={{
                background: color, color: "#fff", border: "none", borderRadius: 10,
                padding: "10px 20px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap",
              }}
            >
              Back to all modules →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Training({ user, profile, onCertificateStatusChange }) {
  const [state, setState] = useState("checking"); // checking | locked | unlocked
  const [number, setNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [openModuleId, setOpenModuleId] = useState(null);

  // Psychologists (Tier 2) don't need a Product number — it only unlocks
  // training for educators, who are supplied one with their screener.
  const needsProductNumber = profile?.role !== "psychologist";

  useEffect(() => {
    if (!needsProductNumber) { setState("unlocked"); return undefined; }
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
  }, [user.uid, needsProductNumber]);

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

  // Educators and psychologists each get their own track of modules
  const audience = audienceForRole(profile?.role);
  const { modules, loading: modulesLoading } = useTrainingModules(audience);
  const progressApi = useTrainingProgress(user.uid);
  const publishedModules = modules.filter((m) => m.status === "published");

  useEffect(() => {
    if (!progressApi.loading && publishedModules.length > 0) {
      progressApi.issueCertificateIfEligible(publishedModules.map((m) => m.id), user.email, user.displayName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressApi.loading, progressApi.progress, publishedModules.length]);

  useEffect(() => {
    if (onCertificateStatusChange) onCertificateStatusChange(progressApi.certificate?.status ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressApi.certificate?.status]);

  if (state === "checking") return <p style={{ color: COLORS.inkMid }}>Checking your training access…</p>;

  if (state === "locked") {
    return (
      <div style={{ maxWidth: 520 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>Training</h1>
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

  if (openModuleId) {
    const mod = modules.find((m) => m.id === openModuleId);
    if (mod) {
      return (
        <ModuleDetail
          user={user}
          mod={mod}
          modules={publishedModules}
          onBack={() => setOpenModuleId(null)}
          onOpenModule={(id) => setOpenModuleId(id)}
          progressApi={progressApi}
        />
      );
    }
  }

  const completedCount = publishedModules.filter((m) => progressApi.progress.get(m.id)?.status === "quiz_passed").length;

  return (
    <>
      <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 16, background: COLORS.tealLight, color: COLORS.teal, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Training unlocked{audience === "psychologist" ? " · Psychologist track" : ""}</span>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 10 }}>Training modules</h1>
      <p style={{ fontSize: 15.5, color: COLORS.inkMid, lineHeight: 1.75, maxWidth: 640, marginBottom: 10 }}>
        Complete the modules in order, followed by each module's quiz, to earn your certification.
      </p>
      {publishedModules.length > 0 && (
        <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.teal, marginBottom: 28 }}>
          {completedCount} of {publishedModules.length} modules completed
        </p>
      )}
      {modulesLoading ? (
        <p style={{ color: COLORS.inkMid, fontSize: 14 }}>Loading modules…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {modules.map((mod, i) => {
            const { color, bg } = moduleColor(mod.colorKey);
            const number = String(mod.sortOrder ?? i + 1).padStart(2, "0");
            const isPublished = mod.status === "published";
            const row = progressApi.progress.get(mod.id);
            const isDone = row?.status === "quiz_passed";
            const hasRichContent = mod.audience === "psychologist" ? true : !!getModuleContent(mod.sortOrder);
            return (
              <div
                key={mod.id}
                style={{
                  padding: "20px 22px", borderRadius: 16, background: COLORS.white,
                  border: `1px solid ${isDone ? COLORS.teal : COLORS.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: "var(--font-heading)", flexShrink: 0 }}>
                    {isDone ? "✓" : number}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 800, color: COLORS.ink, lineHeight: 1.3 }}>{mod.title}</div>
                    <div style={{ fontSize: 12, color: isDone ? COLORS.teal : isPublished ? COLORS.inkMid : COLORS.inkFaint, marginTop: 3, fontWeight: isDone ? 700 : 400 }}>
                      {isDone ? "Completed" : isPublished ? (row?.status === "viewed" ? "In progress" : "Not started") : "Coming soon"}
                    </div>
                  </div>
                </div>

                {mod.description && (
                  <p style={{ fontSize: 12.5, color: COLORS.inkMid, lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{mod.description}</p>
                )}

                {isPublished && hasRichContent ? (
                  <button
                    onClick={() => setOpenModuleId(mod.id)}
                    style={{
                      marginTop: 14, background: color, color: "#fff", border: "none", borderRadius: 10,
                      padding: "9px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 800,
                    }}
                  >
                    {row ? "Continue module" : "Open module"} →
                  </button>
                ) : (
                  <>
                    <VideoBlock url={isPublished ? mod.videoUrl : null} color={color} bg={bg} />
                    {mod.contentUrl && (
                      <a href={mod.contentUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 8, fontSize: 12, fontWeight: 700, color }}>
                        Open resource →
                      </a>
                    )}
                    {isPublished && <TrainingModuleQuiz moduleId={mod.id} color={color} onResult={(outcome) => progressApi.recordQuizResult(mod.id, outcome)} />}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {progressApi.certificate?.status === "approved" && (
        <TrainingCertificate
          name={user.displayName || user.email}
          tierLabel={TIER_LABEL[profile?.role]}
          issuedAt={progressApi.certificate.issuedAt}
        />
      )}

      {progressApi.certificate?.status === "pending" && (
        <div style={{
          marginTop: 28, borderRadius: 16, padding: "22px 24px",
          background: COLORS.orangeLight, border: `1px solid ${COLORS.orange}`,
        }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.orange, marginBottom: 4 }}>
            All modules complete — awaiting review
          </div>
          <div style={{ fontSize: 13, color: COLORS.inkMid, lineHeight: 1.6 }}>
            You've passed every module's quiz. Your admin will review your results and issue your certificate — it'll appear here once approved.
          </div>
        </div>
      )}
    </>
  );
}

export default function MemberArea({ user, profile, view, onView }) {
  const isLanding = view === "landing";
  // Training's certificate status ("pending" | "approved" | null), reported
  // up by Training so the "Continue to my dashboard" link below can be
  // suppressed for the entire training flow until the admin has approved
  // the certificate — a trainee shouldn't be nudged toward "done" anywhere
  // in Training before that happens. Doesn't affect the purchase view.
  const [trainingCertStatus, setTrainingCertStatus] = useState(null);
  const awaitingApproval = view === "training" && trainingCertStatus !== "approved";

  return (
    <Shell
      profile={profile}
      onBack={isLanding ? null : () => onView("landing")}
      backLabel="← Back"
    >
      {isLanding && <Landing profile={profile} onView={onView} />}
      {view === "training" && (
        <Training user={user} profile={profile} onCertificateStatusChange={setTrainingCertStatus} />
      )}
      {view === "purchase" && (
        <>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 900, color: COLORS.ink, marginBottom: 28 }}>Buy The Puzzle Box Screener</h1>
          <PurchaseContent user={user} />
        </>
      )}
      {!isLanding && !awaitingApproval && (
        <div style={{ marginTop: 40 }}>
          <button onClick={() => onView(null)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 800, color: COLORS.teal }}>
            Continue to my dashboard →
          </button>
        </div>
      )}
      {awaitingApproval && trainingCertStatus === "pending" && (
        <p style={{ marginTop: 40, fontSize: 12.5, color: COLORS.inkFaint, lineHeight: 1.6 }}>
          Your dashboard link will reappear here once your admin approves your certificate.
        </p>
      )}
    </Shell>
  );
}