// analyticsData.js
//
// The analytics pages (Overview, Student Records, Screener Results,
// Flags & Alerts, Summary Report) were built before the PuzzleBox Screener
// existed, so they read the legacy `children.total / status / cognitive…`
// columns and the `screening_sessions` table — which only ever held demo
// data. Real screenings live in `puzzlebox_screenings`. This module is the
// single bridge: it loads both, and DERIVES the fields the analytics pages
// already understand from each child's most recent real screening, so every
// page agrees with what teachers and psychologists actually did.
//
// Scores: each question is scored 0 (Fail) / 1 (Pass) / 2 (Passed
// Confidently), so a percentage here is "points earned out of the maximum
// possible" (a child who simply Passes everything is ~50%). The status
// (On Track / Progressing / Developmental Concerns) is NOT derived from that
// percentage — it comes from the age-specific interpretation band stored on
// the screening, or from the psychologist's verdict once reviewed.

import { useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { mapChildRow } from "../utils/mappers";

// Only screenings the teacher actually submitted — never in-progress drafts.
const SUBMITTED = ["awaiting_review", "reviewed", "completed"];

// The old six "domains" → which PuzzleBox section domains feed each one.
// Matched on each section's own `domain` field (saved in the screening's
// snapshot), not on its id: section ids are database UUIDs, so they can't be
// relied on to read "sec_puzzle" etc.
const DOMAIN_SECTIONS = {
  cognitive: ["cognitive"],
  motor: ["fine_motor"],
  language_score: ["language"],
  social: ["social"],
  emotion: ["emotional"],
  moral: ["moral"],
};

const BAND_STATUS = {
  on_track: "On Track",
  progressing: "Progressing",
  concerns: "Developmental Concerns",
};

export function statusForScreening(s) {
  if (s.status === "reviewed" && s.review_verdict === "concerns") return "Developmental Concerns";
  if (s.status === "reviewed" && s.review_verdict === "fine") {
    // The psychologist cleared the child; keep "Progressing" if that's the band, otherwise On Track.
    return s.interpretation_band === "progressing" ? "Progressing" : "On Track";
  }
  return BAND_STATUS[s.interpretation_band] || "Progressing";
}

const pct = (earned, possible) => (possible > 0 ? Math.round((earned / possible) * 100) : 0);

// Points earned / possible, overall and per legacy domain, from the
// screening's own saved snapshot (so edits to the live questionnaire later
// don't rewrite history).
function scoreBreakdown(screening) {
  const sections = screening.content_snapshot?.sections || [];
  const responses = screening.responses || {};
  const bySection = {};
  let earned = 0;
  let possible = 0;
  for (const sec of sections) {
    let se = 0;
    let sp = 0;
    for (const q of sec.questions || []) {
      sp += 2;
      const r = responses[q.id];
      if (r && typeof r.score === "number") se += r.score;
    }
    bySection[sec.id] = { earned: se, possible: sp, domain: sec.domain };
    earned += se;
    possible += sp;
  }
  const domains = {};
  for (const [key, sectionDomains] of Object.entries(DOMAIN_SECTIONS)) {
    let de = 0;
    let dp = 0;
    Object.values(bySection).forEach((sec) => {
      if (sectionDomains.includes(sec.domain)) {
        de += sec.earned;
        dp += sec.possible;
      }
    });
    domains[key] = pct(de, dp);
  }
  // Fall back to the stored raw score if the snapshot is missing.
  if (!possible && typeof screening.raw_score === "number") earned = screening.raw_score;
  return { earned, possible, total: pct(earned, possible), domains };
}

const dateOnly = (iso) => (iso ? String(iso).slice(0, 10) : null);

// One analytics "session" row per submitted screening.
export function buildSessions(childrenById, followUpByChildId, screenings) {
  return screenings
    .filter((s) => SUBMITTED.includes(s.status))
    .map((s) => {
      const child = childrenById[s.child_id] || {};
      const b = scoreBreakdown(s);
      return {
        id: s.id,
        screeningId: s.id,
        childId: s.child_id,
        // child_name on a screening is the student number; prefer the
        // child's name as this viewer is allowed to see it.
        childName: child.name || s.child_name,
        school: s.school || child.school,
        age: s.child_age ?? child.age,
        language: child.language,
        gender: child.gender,
        score: b.total,
        rawScore: s.raw_score ?? b.earned,
        maxScore: b.possible,
        date: dateOnly(s.completed_at || s.created_at),
        examiner: s.teacher_name || s.teacher_email || child.examiner,
        status: statusForScreening(s),
        stage: s.status === "awaiting_review" ? "stage3" : "stage4",
        screeningStatus: s.status,
        reviewVerdict: s.review_verdict,
        reviewNotes: s.review_notes,
        followUpStage: followUpByChildId[s.child_id] || "fu1",
        ...b.domains,
      };
    });
}

// One row per CHILD: the legacy fields are overwritten from that child's most
// recent submitted screening. Children with no submitted screening keep their
// own record but get no score ("not screened yet").
export function buildChildren(childRows, screenings) {
  const latest = {};
  screenings
    .filter((s) => SUBMITTED.includes(s.status))
    .forEach((s) => {
      const cur = latest[s.child_id];
      const when = s.completed_at || s.created_at;
      if (!cur || when > (cur.completed_at || cur.created_at)) latest[s.child_id] = s;
    });

  const rows = childRows.map((row) => {
    const base = mapChildRow(row);
    const s = latest[row.id];
    // Most recent activity = last submitted screening, else when the child was added.
    const lastActivityAt = (s && (s.completed_at || s.created_at)) || row.created_at || "";
    if (!s) return { ...base, screened: false, total: null, lastActivityAt };
    const b = scoreBreakdown(s);
    const status = statusForScreening(s);
    return {
      ...base,
      screened: true,
      total: b.total,
      status,
      flagged: status === "Developmental Concerns",
      date: dateOnly(s.completed_at || s.created_at),
      examiner: s.teacher_name || s.teacher_email || base.examiner,
      rawScore: s.raw_score ?? b.earned,
      maxScore: b.possible,
      screeningId: s.id,
      screeningStatus: s.status,
      reviewVerdict: s.review_verdict,
      lastActivityAt,
      ...b.domains,
    };
  });

  // Newest first, everywhere the analytics pages list children.
  return rows.sort((a, b) => String(b.lastActivityAt).localeCompare(String(a.lastActivityAt)));
}

const FU_TYPES = { fu1: "fu1", fu2: "fu2", fu3: "fu3", fu4: "fu4", fu5: "fu5", fu6: "fu6" };

// Loads everything and stays live. Returns:
//   allChildren      – every child record (with derived scores where screened)
//   screenedChildren – only children with a submitted screening
//   sessions         – one row per submitted screening (newest first)
export function useAnalyticsData() {
  const [childRows, setChildRows] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [c, s, f] = await Promise.all([
      // children_named adds the real name for psychologists (admins get null
      // and see the student number) — see supabase/database/01.
      supabase.from("children_named").select("*").order("created_at", { ascending: true }),
      supabase
        .from("puzzlebox_screenings")
        .select("id, child_id, child_name, school, child_age, teacher_email, teacher_name, status, responses, content_snapshot, raw_score, interpretation_band, review_verdict, review_notes, completed_at, created_at")
        .in("status", SUBMITTED)
        .order("completed_at", { ascending: false }),
      supabase.from("follow_ups").select("child_id, follow_up_type"),
    ]);
    if (c.error) console.error("Error loading children:", c.error);
    if (s.error) console.error("Error loading screenings:", s.error);
    if (!c.error) setChildRows(c.data || []);
    if (!s.error) setScreenings(s.data || []);
    if (!f.error) setFollowUps(f.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("analytics-data")
      .on("postgres_changes", { event: "*", schema: "public", table: "children" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "puzzlebox_screenings" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const allChildren = buildChildren(childRows, screenings);
  const childrenById = Object.fromEntries(childRows.map((r) => [r.id, mapChildRow(r)]));
  const fuByChild = {};
  followUps.forEach((f) => {
    if (f.child_id) fuByChild[f.child_id] = FU_TYPES[f.follow_up_type] || "fu1";
  });
  const sessions = buildSessions(childrenById, fuByChild, screenings);

  return {
    loading,
    allChildren,
    screenedChildren: allChildren.filter((c) => c.screened),
    sessions,
  };
}