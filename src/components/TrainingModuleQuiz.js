// TrainingModuleQuiz.js
//
// The quiz a teacher/psychologist takes for one training module, once
// it's published. Pulls its questions from Supabase (admin-managed via
// Admin → Training Modules → Quiz) and scores the attempt in the browser
// — nothing is written back, so retaking is always available.

import React, { useState } from "react";
import { COLORS } from "./SiteChrome";
import { useTrainingQuestions } from "../lib/useTrainingQuestions";

export default function TrainingModuleQuiz({ moduleId, color }) {
  const { questions, loading, error } = useTrainingQuestions(moduleId);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({}); // questionId -> choiceId
  const [result, setResult] = useState(null); // { score, total, percent }
  const [missing, setMissing] = useState(false);

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const choose = (questionId, choiceId) => {
    setAnswers({ ...answers, [questionId]: choiceId });
    setMissing(false);
  };

  const submit = () => {
    const unanswered = questions.some((q) => !answers[q.id]);
    if (unanswered) { setMissing(true); return; }

    const score = questions.reduce(
      (sum, q) => sum + (answers[q.id] === q.correctChoiceId ? q.points : 0),
      0
    );
    setResult({ score, total: totalPoints, percent: totalPoints ? Math.round((score / totalPoints) * 100) : 0 });
  };

  const retake = () => {
    setAnswers({});
    setResult(null);
    setMissing(false);
  };

  if (loading) return null;
  if (error) return <p style={{ fontSize: 12.5, color: COLORS.inkFaint }}>{error}</p>;
  if (questions.length === 0) return null;

  if (!started) {
    return (
      <button
        onClick={() => setStarted(true)}
        style={{
          marginTop: 10, background: "none", border: `1.5px solid ${color}`, borderRadius: 10,
          padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 800, color,
        }}
      >
        Take quiz ({questions.length} question{questions.length === 1 ? "" : "s"})
      </button>
    );
  }

  if (result) {
    const passed = result.percent >= 70;
    return (
      <div style={{ marginTop: 12, padding: "16px 18px", borderRadius: 12, background: passed ? COLORS.tealLight : COLORS.pinkLight }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, color: passed ? COLORS.teal : COLORS.pink, marginBottom: 4 }}>
          {result.score} / {result.total} ({result.percent}%)
        </div>
        <div style={{ fontSize: 13, color: COLORS.inkMid, marginBottom: 12 }}>
          {passed ? "Nice work — you've passed this module's quiz." : "Not quite there yet — have another look and try again."}
        </div>
        <button onClick={retake} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 800, color }}>
          Retake quiz
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 16 }}>
      {questions.map((q, qi) => (
        <div key={q.id}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink, marginBottom: 8 }}>
            {qi + 1}. {q.text}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.choices.map((c) => (
              <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.inkMid, cursor: "pointer" }}>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === c.id}
                  onChange={() => choose(q.id, c.id)}
                />
                {c.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {missing && (
        <div style={{ fontSize: 12.5, color: COLORS.pink, fontWeight: 700 }}>Please answer every question before submitting.</div>
      )}

      <button
        onClick={submit}
        style={{
          alignSelf: "flex-start", background: color, color: "#fff", border: "none", borderRadius: 10,
          padding: "10px 22px", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800,
        }}
      >
        Submit
      </button>
    </div>
  );
}