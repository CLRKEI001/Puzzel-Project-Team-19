// PuzzleBoxScreener.js — Phase 2 of the PuzzleBox Screener feature
// (see feature/puzzlebox-screener branch).
//
// Implements: teacher entry point, child search/select + confirm, the
// digital screening form itself (content-driven from
// src/data/puzzleBoxContent.v1.js), back/forward navigation without losing
// data, and autosave to Supabase as the teacher progresses.
//
// Deliberately NOT in this file yet (later phases, per the requirements doc):
//   - Phase 3: the live puzzle timer / automatic "Over Time" flag. Item 1
//     and item 19 currently take a manually-entered time so the form is
//     still usable end-to-end; PuzzleTimer.js will replace the manual
//     entry for the puzzle section without changing the content model.
//   - Phase 4: psychologist notification on submit.
//   - Phase 5: Admin Content Management (this already reads its content
//     from a single data-driven object, so swapping that object for a
//     Supabase-backed one later shouldn't require touching this file).

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import {
  puzzleBoxContentV1,
  scoreFromAgeTable,
  interpretationBands,
} from "../data/puzzleBoxContent.v1";
import "./PuzzleBoxScreener.css";

const T = {
  en: {
    title: "PuzzleBox Screener",
    selectChild: "Select a Child",
    searchPlaceholder: "Search by child name or school...",
    noChildren: "No children found",
    noChildrenSub: "Try a different search, or add the child on the Children page first.",
    resumeBadge: "In progress",
    confirmChild: "Confirm Child",
    confirmSub: "Make sure this is the right child before you begin.",
    name: "Name", school: "School", age: "Age", language: "Language",
    goBack: "← Choose a different child",
    startScreening: "Start Screening",
    resumeScreening: "Resume Screening",
    back: "Back", next: "Next", submit: "Submit Screening",
    saving: "Saving…", saved: "Saved",
    sectionOf: "Section", of: "of",
    observations: "Observations / Notes",
    observationsPlaceholder: "Anything else worth noting about this screening...",
    submitConfirmTitle: "Submit this screening?",
    submitConfirmBody: "questions are still unanswered. You can still submit — the psychologist will see which items were skipped.",
    submitConfirmBodyComplete: "All questions have been answered.",
    cancel: "Cancel",
    confirmSubmit: "Yes, Submit",
    submitted: "Screening Submitted",
    submittedSub: "has been saved to",
    submittedBackHome: "Back to My Home",
    recordTime: "Record Time",
    min: "min", sec: "sec",
    computedScore: "Score",
    exit: "Exit",
    exitConfirm: "Leave the screening? Your progress has already been saved and you can resume later.",
    notAgeSupported: "This screener's age-based scoring covers 5 and 6 year olds — a raw time/count is still recorded for this child, but no 0–2 score can be derived automatically.",
    checklistCount: "checked",
  },
};

function useDebouncedSave(fn, delay = 700) {
  const timer = useRef(null);
  const savedFn = useRef(fn);
  savedFn.current = fn;
  return useCallback((...args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => savedFn.current(...args), delay);
  }, [delay]);
}

// Sums up every question's derived score into a raw total.
function computeRawScore(responses) {
  let total = 0;
  for (const section of puzzleBoxContentV1.sections) {
    for (const q of section.questions) {
      const r = responses[q.id];
      if (r && typeof r.score === "number") total += r.score;
    }
  }
  return total;
}

function computeBand(age, rawScore) {
  const rows = interpretationBands[age];
  if (!rows) return null;
  for (const row of rows) {
    const min = row.min ?? -Infinity;
    const max = row.max ?? Infinity;
    if (rawScore >= min && rawScore <= max) return row;
  }
  return null;
}

export default function PuzzleBoxScreener({ user, profile, onExit }) {
  const t = T.en;
  const [view, setView] = useState("select"); // select | confirm | form | submitted
  const [search, setSearch] = useState("");
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [existingSession, setExistingSession] = useState(null);

  const [session, setSession] = useState(null); // the puzzlebox_screenings row
  const [responses, setResponses] = useState({});
  const [observations, setObservations] = useState("");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState("saved"); // saving | saved | error
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [error, setError] = useState("");

  const teacherEmail = user?.email || "";
  const teacherName = profile?.name || user?.email?.split("@")[0] || "Educator";

  const sections = puzzleBoxContentV1.sections;
  const currentSection = sections[sectionIndex];

  // ── Child search ──────────────────────────────────────────────────
  useEffect(() => {
    if (view !== "select") return;
    let active = true;
    setLoadingChildren(true);
    const run = async () => {
      let query = supabase.from("children").select("*").order("name", { ascending: true }).limit(50);
      if (search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,school.ilike.%${search.trim()}%`);
      }
      const { data, error: qErr } = await query;
      if (!active) return;
      if (qErr) {
        setError("Could not load children: " + qErr.message);
        setChildren([]);
      } else {
        setChildren(data || []);
      }
      setLoadingChildren(false);
    };
    const debounce = setTimeout(run, 250);
    return () => { active = false; clearTimeout(debounce); };
  }, [search, view]);

  // ── Selecting a child → check for an in-progress screening to resume ──
  const selectChild = async (child) => {
    setSelectedChild(child);
    setError("");
    const { data } = await supabase
      .from("puzzlebox_screenings")
      .select("*")
      .eq("child_id", child.id)
      .eq("status", "in_progress")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setExistingSession(data || null);
    setView("confirm");
  };

  // ── Start (or resume) the screening session ──────────────────────────
  const beginScreening = async (resume) => {
    setError("");
    if (resume && existingSession) {
      setSession(existingSession);
      setResponses(existingSession.responses || {});
      setObservations(existingSession.observations || "");
      setView("form");
      return;
    }

    const { data, error: insertErr } = await supabase
      .from("puzzlebox_screenings")
      .insert({
        child_id: selectedChild.id,
        child_name: selectedChild.name,
        school: selectedChild.school,
        child_age: selectedChild.age,
        teacher_email: teacherEmail,
        teacher_name: teacherName,
        content_version: puzzleBoxContentV1.version,
        status: "in_progress",
        responses: {},
      })
      .select()
      .single();

    if (insertErr) {
      setError("Could not start the screening: " + insertErr.message);
      return;
    }
    setSession(data);
    setResponses({});
    setObservations("");
    setSectionIndex(0);
    setView("form");
  };

  // ── Autosave ──────────────────────────────────────────────────────
  const persist = useCallback(async (patch) => {
    if (!session?.id) return;
    setSaveStatus("saving");
    const { error: saveErr } = await supabase
      .from("puzzlebox_screenings")
      .update(patch)
      .eq("id", session.id);
    setSaveStatus(saveErr ? "error" : "saved");
  }, [session?.id]);

  const debouncedPersist = useDebouncedSave(persist, 700);

  const updateResponse = (questionId, patch) => {
    setResponses((prev) => {
      const next = { ...prev, [questionId]: { ...prev[questionId], ...patch } };
      debouncedPersist({ responses: next });
      return next;
    });
  };

  const updateObservations = (value) => {
    setObservations(value);
    debouncedPersist({ observations: value });
  };

  // ── Scoring helpers per question type ────────────────────────────
  const setBinary = (q, score) => updateResponse(q.id, { score });

  const setTimeValue = (q, minutes, seconds) => {
    const mins = Number.isFinite(minutes) ? minutes : 0;
    const secs = Number.isFinite(seconds) ? seconds : 0;
    const totalSeconds = mins * 60 + secs;
    const age = selectedChild?.age;
    const score = age && q.ageTable ? scoreFromAgeTable(q.ageTable, age, totalSeconds) : null;
    updateResponse(q.id, { rawValueSeconds: totalSeconds, score });
  };

  const toggleChecklist = (q, option) => {
    const current = responses[q.id]?.checked || [];
    const next = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    const age = selectedChild?.age;
    const score = age && q.ageTable ? scoreFromAgeTable(q.ageTable, age, next.length) : null;
    updateResponse(q.id, { checked: next, score });
  };

  // ── Progress ──────────────────────────────────────────────────────
  const allQuestions = useMemo(() => sections.flatMap((s) => s.questions), [sections]);
  const answeredCount = allQuestions.filter((q) => {
    const r = responses[q.id];
    return r && (typeof r.score === "number" || (r.checked && r.checked.length > 0));
  }).length;
  const unansweredCount = allQuestions.length - answeredCount;

  const sectionAnswered = (section) =>
    section.questions.filter((q) => responses[q.id] && typeof responses[q.id].score === "number").length;

  // ── Submit ────────────────────────────────────────────────────────
  const doSubmit = async () => {
    const rawScore = computeRawScore(responses);
    const band = computeBand(selectedChild?.age, rawScore);
    const { error: submitErr } = await supabase
      .from("puzzlebox_screenings")
      .update({
        responses,
        observations,
        status: "completed",
        completed_at: new Date().toISOString(),
        raw_score: rawScore,
        interpretation_band: band?.band || null,
        content_snapshot: puzzleBoxContentV1,
      })
      .eq("id", session.id);

    if (submitErr) {
      setError("Could not submit the screening: " + submitErr.message);
      return;
    }
    setShowSubmitConfirm(false);
    setView("submitted");
  };

  // ── Question renderer ────────────────────────────────────────────
  const renderQuestion = (q) => {
    const r = responses[q.id] || {};
    return (
      <div className="pbs-question" key={q.id}>
        <div className="pbs-question-head">
          <div className="pbs-question-label">{q.label}</div>
          {saveStatusBadgeFor(q.id)}
        </div>
        {q.instruction && <div className="pbs-question-instruction">{q.instruction}</div>}
        {q.toPass && <div className="pbs-question-topass"><strong>To Pass:</strong> {q.toPass}</div>}

        {q.scoringType === "binary" && (
          <div className="pbs-score-row">
            {[0, 1].map((val) => (
              <button
                key={val}
                className={`pbs-score-btn ${r.score === val ? "active" : ""}`}
                onClick={() => setBinary(q, val)}
              >
                {val}
              </button>
            ))}
          </div>
        )}

        {q.scoringType === "scale3" && (
          <div className="pbs-score-row">
            {[0, 1, 2].map((val) => (
              <button
                key={val}
                className={`pbs-score-btn ${r.score === val ? "active" : ""}`}
                onClick={() => setBinary(q, val)}
              >
                {val}
              </button>
            ))}
          </div>
        )}

        {q.scoringType === "age_table" && (
          <div className="pbs-time-entry">
            <label className="pbs-time-label">{t.recordTime}:</label>
            <input
              type="number" min="0" className="pbs-time-input"
              value={r.rawValueSeconds != null ? Math.floor(r.rawValueSeconds / 60) : ""}
              placeholder="0"
              onChange={(e) => setTimeValue(q, Number(e.target.value), r.rawValueSeconds ? r.rawValueSeconds % 60 : 0)}
            />
            <span>{t.min}</span>
            <input
              type="number" min="0" max="59" className="pbs-time-input"
              value={r.rawValueSeconds != null ? r.rawValueSeconds % 60 : ""}
              placeholder="0"
              onChange={(e) => setTimeValue(q, r.rawValueSeconds ? Math.floor(r.rawValueSeconds / 60) : 0, Number(e.target.value))}
            />
            <span>{t.sec}</span>
            {r.rawValueSeconds != null && (
              r.score != null
                ? <span className="pbs-computed-score">{t.computedScore}: {r.score}</span>
                : <span className="pbs-computed-score pbs-computed-score-warn">{t.notAgeSupported}</span>
            )}
            {q.needsConfirmation && (
              <div className="pbs-tbd-note">Scoring for going over the time limit is still being finalised by the psychologists — the time is recorded either way.</div>
            )}
          </div>
        )}

        {q.scoringType === "checklist" && (
          <div className="pbs-checklist">
            {q.checklistOptions.map((opt) => (
              <label key={opt} className="pbs-checklist-item">
                <input
                  type="checkbox"
                  checked={(r.checked || []).includes(opt)}
                  onChange={() => toggleChecklist(q, opt)}
                />
                {opt}
              </label>
            ))}
            <div className="pbs-checklist-count">
              {(r.checked || []).length} {t.checklistCount}
              {r.score != null && <span className="pbs-computed-score"> · {t.computedScore}: {r.score}</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // small no-op placeholder kept for a future per-question save indicator
  const saveStatusBadgeFor = () => null;

  // ── Views ─────────────────────────────────────────────────────────

  if (view === "select") {
    return (
      <div className="pbs-shell">
        <div className="pbs-topbar">
          <div className="pbs-topbar-title">{t.title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onExit}>{t.exit}</button>
        </div>
        <div className="pbs-body pbs-body-narrow">
          <h2 className="pbs-h2">{t.selectChild}</h2>
          <input
            className="search-input"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {error && <div className="pbs-error">{error}</div>}
          <div className="pbs-child-list">
            {loadingChildren && <div className="pbs-loading">…</div>}
            {!loadingChildren && children.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-title">{t.noChildren}</div>
                <div className="empty-state-sub">{t.noChildrenSub}</div>
              </div>
            )}
            {!loadingChildren && children.map((child) => (
              <button key={child.id} className="pbs-child-row" onClick={() => selectChild(child)}>
                <div className="pbs-child-avatar">{(child.name || "?").charAt(0).toUpperCase()}</div>
                <div className="pbs-child-info">
                  <div className="pbs-child-name">{child.name}</div>
                  <div className="pbs-child-meta">{child.school} · {t.age} {child.age ?? "—"} · {child.language || "—"}</div>
                </div>
                <div className="pbs-child-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === "confirm") {
    return (
      <div className="pbs-shell">
        <div className="pbs-topbar">
          <div className="pbs-topbar-title">{t.title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onExit}>{t.exit}</button>
        </div>
        <div className="pbs-body pbs-body-narrow">
          <h2 className="pbs-h2">{t.confirmChild}</h2>
          <p className="pbs-sub">{t.confirmSub}</p>
          <div className="card pbs-confirm-card">
            <div className="pbs-child-avatar pbs-child-avatar-lg">{(selectedChild.name || "?").charAt(0).toUpperCase()}</div>
            <div className="pbs-confirm-name">{selectedChild.name}</div>
            {existingSession && <span className="pill pill-pink">{t.resumeBadge}</span>}
            <div className="pbs-confirm-grid">
              <div><div className="pbs-confirm-label">{t.school}</div><div>{selectedChild.school || "—"}</div></div>
              <div><div className="pbs-confirm-label">{t.age}</div><div>{selectedChild.age ?? "—"}</div></div>
              <div><div className="pbs-confirm-label">{t.language}</div><div>{selectedChild.language || "—"}</div></div>
            </div>
          </div>
          {error && <div className="pbs-error">{error}</div>}
          <div className="pbs-confirm-actions">
            <button className="btn btn-ghost" onClick={() => setView("select")}>{t.goBack}</button>
            <button className="btn btn-teal" onClick={() => beginScreening(!!existingSession)}>
              {existingSession ? t.resumeScreening : t.startScreening}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "submitted") {
    return (
      <div className="pbs-shell">
        <div className="pbs-body pbs-body-narrow pbs-submitted">
          <div className="pbs-submitted-icon">✓</div>
          <h2 className="pbs-h2">{t.submitted}</h2>
          <p className="pbs-sub">{selectedChild?.name} {t.submittedSub} {selectedChild?.school || "the child's record"}.</p>
          <button className="btn btn-teal" onClick={onExit}>{t.submittedBackHome}</button>
        </div>
      </div>
    );
  }

  // view === "form"
  return (
    <div className="pbs-shell">
      <div className="pbs-topbar">
        <div>
          <div className="pbs-topbar-title">{selectedChild.name}</div>
          <div className="pbs-topbar-sub">{t.sectionOf} {sectionIndex + 1} {t.of} {sections.length} · {currentSection.title}</div>
        </div>
        <div className="pbs-topbar-right">
          <span className={`pbs-save-indicator pbs-save-${saveStatus}`}>
            {saveStatus === "saving" ? t.saving : saveStatus === "error" ? "⚠" : t.saved}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowExitConfirm(true)}>{t.exit}</button>
        </div>
      </div>

      <div className="pbs-progress-track">
        <div className="pbs-progress-fill" style={{ width: `${(answeredCount / allQuestions.length) * 100}%` }} />
      </div>

      <div className="pbs-section-tabs">
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={`pbs-section-tab ${i === sectionIndex ? "active" : ""} ${sectionAnswered(s) === s.questions.length ? "done" : ""}`}
            onClick={() => setSectionIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="pbs-body">
        <h2 className="pbs-h2">{currentSection.title}</h2>
        {currentSection.description && <p className="pbs-section-desc">{currentSection.description}</p>}
        {error && <div className="pbs-error">{error}</div>}

        <div className="pbs-question-list">
          {currentSection.questions.map(renderQuestion)}
        </div>

        {sectionIndex === sections.length - 1 && (
          <div className="pbs-observations">
            <label className="pbs-question-label">{t.observations}</label>
            <textarea
              className="pbs-observations-input"
              placeholder={t.observationsPlaceholder}
              value={observations}
              onChange={(e) => updateObservations(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="pbs-footer">
        <button
          className="btn btn-ghost"
          disabled={sectionIndex === 0}
          onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
        >
          {t.back}
        </button>
        {sectionIndex < sections.length - 1 ? (
          <button className="btn btn-teal" onClick={() => setSectionIndex((i) => Math.min(sections.length - 1, i + 1))}>
            {t.next}
          </button>
        ) : (
          <button className="btn btn-teal" onClick={() => setShowSubmitConfirm(true)}>
            {t.submit}
          </button>
        )}
      </div>

      {showSubmitConfirm && (
        <div className="modal-overlay" onClick={() => setShowSubmitConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{t.submitConfirmTitle}</div>
              <button className="modal-close" onClick={() => setShowSubmitConfirm(false)}>✕</button>
            </div>
            <p>
              {unansweredCount > 0
                ? `${unansweredCount} ${t.submitConfirmBody}`
                : t.submitConfirmBodyComplete}
            </p>
            <div className="pbs-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowSubmitConfirm(false)}>{t.cancel}</button>
              <button className="btn btn-teal" onClick={doSubmit}>{t.confirmSubmit}</button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>{t.exitConfirm}</p>
            <div className="pbs-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowExitConfirm(false)}>{t.cancel}</button>
              <button className="btn btn-teal" onClick={onExit}>{t.exit}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
