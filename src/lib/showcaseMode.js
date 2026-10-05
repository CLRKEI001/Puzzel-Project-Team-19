// ─────────────────────────────────────────────────────────────────────────
// SHOWCASE MODE — a short version of the PuzzleBox Screener for demos.
//
//   SHOWCASE_MODE = true   → the screener shrinks to the 4 short sections
//                            (2 questions each) listed in SHOWCASE_PLAN below,
//                            so a whole screening takes a couple of minutes.
//   SHOWCASE_MODE = false  → the full 40-question screener, exactly as before.
//
// Nothing is deleted: the full question set stays in the database and in
// src/data/puzzleBoxContent.v1.js. This only hides questions at display time.
// To go back to the full screener, set SHOWCASE_MODE to false below and
// redeploy — that is the only change needed.
//
// Interpretation bands are scaled to match, so a child who does well on the
// short version is still "On Track" (the real thresholds are written for 40
// questions and would otherwise make everyone look like "Concerns").
// Screenings saved in showcase mode are short; they are not comparable with
// full screenings or the real norms — don't use them as real results.
// ─────────────────────────────────────────────────────────────────────────

export const SHOWCASE_MODE = true;

// The short screener: 4 sections, 2 questions each. Sections and questions
// are matched by name (so this works whether the content comes from the
// database or the built-in default). Edit the names to change what is shown.
export const SHOWCASE_PLAN = [
  { section: "Counting & Positioning", questions: ["Identify the puzzle piece with oranges", "Position — left"] },
  { section: "Language", questions: ["Tell a story about the puzzle", "Sentence repetition — shop"] },
  { section: "Emotion Recognition", questions: ["Identify happy / sad / cross", "Understanding others' feelings"] },
  { section: "Social Problem-Solving", questions: ["Granny drops the oranges", "Sharing the last cold drink"] },
];

const norm = (t) => String(t || "").toLowerCase().replace(/^\s*\d+\.\s*/, "").trim();

function countQuestions(content) {
  return content.sections.reduce((n, s) => n + s.questions.length, 0);
}

// Re-draws the band cut-offs for a shorter test: each "min" shrinks in
// proportion to the shorter test, and each band runs up to just below the
// next one.
function scaleBands(bands, ratio) {
  const scaled = {};
  for (const [age, rows] of Object.entries(bands || {})) {
    const order = { on_track: 3, progressing: 2, concerns: 1 };
    const sorted = [...rows].sort((a, b) => (order[b.band] || 0) - (order[a.band] || 0));
    let nextMin = null; // min of the band above
    scaled[age] = sorted.map((row) => {
      const min = row.min == null ? undefined : Math.max(1, Math.ceil(row.min * ratio));
      const max = nextMin == null ? undefined : nextMin - 1;
      if (min != null) nextMin = min;
      return { ...row, min, max };
    });
  }
  return scaled;
}

export function applyShowcaseMode(content, bands) {
  if (!SHOWCASE_MODE || !content) return { content, bands };

  const fullCount = countQuestions(content);
  const sections = [];
  SHOWCASE_PLAN.forEach((plan) => {
    const sec = content.sections.find((s) => norm(s.title).includes(norm(plan.section)));
    if (!sec) return;
    let picked = plan.questions
      .map((label) => sec.questions.find((q) => norm(q.label).includes(norm(label))))
      .filter(Boolean);
    // If a name no longer matches, fill up from the start of the section
    if (picked.length < plan.questions.length) {
      const have = new Set(picked.map((q) => q.id));
      sec.questions.forEach((q) => {
        if (picked.length < plan.questions.length && !have.has(q.id)) picked.push(q);
      });
    }
    sections.push({
      ...sec,
      title: `${sections.length + 1}. ${String(sec.title).replace(/^\s*\d+\.\s*/, "")}`,
      questions: picked,
    });
  });
  // Nothing matched at all — better to show the full screener than nothing
  if (sections.length === 0) return { content, bands };

  const shortContent = { ...content, sections };
  const ratio = fullCount > 0 ? countQuestions(shortContent) / fullCount : 1;
  return { content: shortContent, bands: scaleBands(bands, ratio) };
}