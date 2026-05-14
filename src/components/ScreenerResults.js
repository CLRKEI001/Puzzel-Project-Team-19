import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
 
const T = {
  en: {
    search: "Search by name or school...",
    filterStatus: "All Stages", showing: "Showing", of: "of", sessions: "sessions",
    childID: "Child Name", school: "School", age: "Age", language: "Language",
    score: "Score", date: "Date", examiner: "Examiner",
    sessionStatus: "Session Status", followUp: "Follow-up", actions: "Actions",
    view: "View", noResults: "No sessions found", noResultsSub: "Try adjusting your search",
    stage1: "Not Started", stage2: "Registered", stage3: "Processing", stage4: "Completed",
    fu1: "Not Required", fu2: "Awaiting First Follow-up",
    fu3: "Follow-up In Progress", fu4: "Follow-up Completed",
    fu5: "Referred to Specialist", fu6: "Pending Parent Response",
    sessionDetail: "Session Detail", close: "Close",
    onTrack: "On Track", progressing: "Progressing", devConcerns: "Developmental Concerns",
    cognitive: "Cognitive", motor: "Fine Motor", lang: "Language",
    social: "Social", emotion: "Emotion", moral: "Moral",
    domainScores: "Domain Scores", totalScore: "Total Score",
    followUpInfo: "Follow-up Information",
    followUpDate: "Follow-up Date", followUpPsych: "Assigned Psychologist",
    followUpReason: "Reason", followUpStatus: "Status",
    noFollowUp: "No follow-up scheduled for this child",
    deleteSession: "Delete Session",
    deleteConfirm: "Are you sure you want to delete this session?",
    cancel: "Cancel",
  },
  af: {
    search: "Soek op naam of skool...",
    filterStatus: "Alle Stadiums", showing: "Wys", of: "van", sessions: "sessies",
    childID: "Kind Naam", school: "Skool", age: "Ouderdom", language: "Taal",
    score: "Punt", date: "Datum", examiner: "Ondersoeker",
    sessionStatus: "Sessie Status", followUp: "Opvolg", actions: "Aksies",
    view: "Sien", noResults: "Geen sessies", noResultsSub: "Probeer aanpas",
    stage1: "Nie Begin", stage2: "Geregistreer", stage3: "Verwerking", stage4: "Voltooi",
    fu1: "Nie Nodig", fu2: "Wag op Eerste Opvolg",
    fu3: "Opvolg aan die Gang", fu4: "Opvolg Voltooi",
    fu5: "Verwys na Spesialis", fu6: "Wag op Ouer",
    sessionDetail: "Sessie Detail", close: "Maak Toe",
    onTrack: "Op Koers", progressing: "Vordering", devConcerns: "Ontwikkelingsbekommernisse",
    cognitive: "Kognitief", motor: "Fyn Motories", lang: "Taal",
    social: "Sosiaal", emotion: "Emosie", moral: "Moreel",
    domainScores: "Domeinpunte", totalScore: "Totale Punt",
    followUpInfo: "Opvolg Inligting",
    followUpDate: "Opvolgdatum", followUpPsych: "Sielkundige",
    followUpReason: "Rede", followUpStatus: "Status",
    noFollowUp: "Geen opvolg geskeduleer",
    deleteSession: "Verwyder Sessie",
    deleteConfirm: "Is jy seker?",
    cancel: "Kanselleer",
  },
  xh: {
    search: "Khangela ngegama...",
    filterStatus: "Zonke iziGaba", showing: "Ibonisa", of: "kwi", sessions: "iiseshoni",
    childID: "Igama loMntwana", school: "Isikolo", age: "Iminyaka", language: "Ulwimi",
    score: "Amanqaku", date: "Umhla", examiner: "Umhloli",
    sessionStatus: "Imeko", followUp: "Ukulandelwa", actions: "Izenzo",
    view: "Jonga", noResults: "Akufumaneki", noResultsSub: "Zama ukuguqula",
    stage1: "Akuqalanga", stage2: "Ibhaliswe", stage3: "Iyacutshungulwa", stage4: "Iphelile",
    fu1: "Ayifunekanga", fu2: "Ilindele Ukulandelwa Kokuqala",
    fu3: "Ukulandelwa Kuyaqhuba", fu4: "Ukulandelwa Kuphelile",
    fu5: "Kuthunyelwe kochwephesha", fu6: "Ilindele Impendulo Yomzali",
    sessionDetail: "Iinkcukacha", close: "Vala",
    onTrack: "Esendleleni", progressing: "Inkqubela", devConcerns: "Iingxaki Zentlalo",
    cognitive: "Ukucinga", motor: "Amandla", lang: "Ulwimi",
    social: "Uluntu", emotion: "Imvakalelo", moral: "Isimo",
    domainScores: "Amanqaku eMihlaba", totalScore: "Iyonke",
    followUpInfo: "Ulwazi Lokulandelwa",
    followUpDate: "Umhla", followUpPsych: "Isazi Sengqondo",
    followUpReason: "Isizathu", followUpStatus: "Imeko",
    noFollowUp: "Akukho kulandelwa",
    deleteSession: "Cima iSeshoni",
    deleteConfirm: "Uqinisekile?",
    cancel: "Rhoxisa",
  }
};
 
const stageColors = {
  stage1: { bg: "#F0EDF8", color: "#6B2F8A" },
  stage2: { bg: "#FEF0E7", color: "#F26522" },
  stage3: { bg: "#FCE6EE", color: "#E8175D" },
  stage4: { bg: "#E0F5F3", color: "#009B8D" },
};
 
const followUpColors = {
  fu1: { bg: "#F7F6FF", color: "#8888a8" },
  fu2: { bg: "#FEF0E7", color: "#F26522" },
  fu3: { bg: "#FCE6EE", color: "#E8175D" },
  fu4: { bg: "#E0F5F3", color: "#009B8D" },
  fu5: { bg: "#F0E8F7", color: "#6B2F8A" },
  fu6: { bg: "#FEF0E7", color: "#F26522" },
};
 
const domainColors = {
  cognitive: "#009B8D", motor: "#6B2F8A", language_score: "#F26522",
  social: "#E8175D", emotion: "#009B8D", moral: "#6B2F8A"
};
 
const SEED_SESSIONS = [
  { childName: "Child PB-001", school: "Adelaide Primary", age: 5, language: "isiXhosa", score: 69, date: "2026-02-10", examiner: "Dr. Mokoena", status: "Progressing", stage: "stage4", followUpStage: "fu1", cognitive: 72, motor: 85, language_score: 68, social: 60, emotion: 74, moral: 55 },
  { childName: "Child PB-002", school: "Adelaide Primary", age: 6, language: "isiXhosa", score: 42, date: "2026-02-10", examiner: "Dr. Mokoena", status: "Developmental Concerns", stage: "stage4", followUpStage: "fu2", cognitive: 45, motor: 52, language_score: 40, social: 38, emotion: 42, moral: 35 },
  { childName: "Child PB-003", school: "Komani ECD", age: 5, language: "English", score: 88, date: "2026-02-14", examiner: "Dr. Mokoena", status: "On Track", stage: "stage4", followUpStage: "fu1", cognitive: 88, motor: 92, language_score: 85, social: 90, emotion: 88, moral: 82 },
  { childName: "Child PB-004", school: "Komani ECD", age: 6, language: "Afrikaans", score: 34, date: "2026-02-14", examiner: "Dr. Mokoena", status: "Developmental Concerns", stage: "stage3", followUpStage: "fu5", cognitive: 35, motor: 40, language_score: 32, social: 28, emotion: 38, moral: 30 },
  { childName: "Child PB-005", school: "Fort Beaufort", age: 5, language: "isiXhosa", score: 76, date: "2026-02-18", examiner: "Dr. Mokoena", status: "On Track", stage: "stage3", followUpStage: "fu4", cognitive: 78, motor: 80, language_score: 75, social: 72, emotion: 79, moral: 70 },
  { childName: "Child PB-006", school: "Fort Beaufort", age: 6, language: "isiXhosa", score: 55, date: "2026-02-18", examiner: "Dr. Mokoena", status: "Progressing", stage: "stage2", followUpStage: "fu2", cognitive: 55, motor: 60, language_score: 58, social: 52, emotion: 56, moral: 50 },
  { childName: "Child PB-007", school: "Stutterheim Primary", age: 5, language: "Afrikaans", score: 89, date: "2026-02-21", examiner: "Dr. Mokoena", status: "On Track", stage: "stage4", followUpStage: "fu1", cognitive: 90, motor: 88, language_score: 92, social: 87, emotion: 91, moral: 85 },
  { childName: "Child PB-008", school: "Stutterheim Primary", age: 6, language: "English", score: 39, date: "2026-02-21", examiner: "Dr. Mokoena", status: "Developmental Concerns", stage: "stage2", followUpStage: "fu6", cognitive: 42, motor: 38, language_score: 45, social: 35, emotion: 40, moral: 32 },
  { childName: "Child PB-009", school: "Adelaide Primary", age: 5, language: "isiXhosa", score: 65, date: "2026-02-25", examiner: "Dr. Mokoena", status: "Progressing", stage: "stage1", followUpStage: "fu1", cognitive: 65, motor: 70, language_score: 62, social: 68, emotion: 66, moral: 60 },
  { childName: "Child PB-010", school: "Komani ECD", age: 6, language: "isiXhosa", score: 81, date: "2026-02-25", examiner: "Dr. Mokoena", status: "On Track", stage: "stage4", followUpStage: "fu1", cognitive: 82, motor: 79, language_score: 84, social: 80, emotion: 83, moral: 78 },
  { childName: "Child PB-011", school: "Fort Beaufort", age: 5, language: "English", score: 30, date: "2026-03-03", examiner: "Dr. Mokoena", status: "Developmental Concerns", stage: "stage1", followUpStage: "fu5", cognitive: 30, motor: 35, language_score: 28, social: 25, emotion: 32, moral: 27 },
  { childName: "Child PB-012", school: "Adelaide Primary", age: 6, language: "Afrikaans", score: 75, date: "2026-03-03", examiner: "Dr. Mokoena", status: "On Track", stage: "stage3", followUpStage: "fu1", cognitive: 75, motor: 77, language_score: 73, social: 76, emotion: 74, moral: 72 },
  { childName: "Child PB-013", school: "Stutterheim Primary", age: 5, language: "isiXhosa", score: 57, date: "2026-03-07", examiner: "Dr. Mokoena", status: "Progressing", stage: "stage1", followUpStage: "fu1", cognitive: 58, motor: 62, language_score: 55, social: 60, emotion: 57, moral: 52 },
  { childName: "Child PB-014", school: "Komani ECD", age: 6, language: "English", score: 47, date: "2026-03-07", examiner: "Dr. Mokoena", status: "Progressing", stage: "stage2", followUpStage: "fu3", cognitive: 48, motor: 50, language_score: 46, social: 44, emotion: 49, moral: 43 },
  { childName: "Child PB-015", school: "Adelaide Primary", age: 5, language: "isiXhosa", score: 92, date: "2026-03-10", examiner: "Dr. Mokoena", status: "On Track", stage: "stage1", followUpStage: "fu1", cognitive: 93, motor: 90, language_score: 95, social: 92, emotion: 94, moral: 88 },
];
 
export default function ScreenerResults({ lang }) {
  const t = T[lang];
  const [sessions, setSessions] = useState([]);
  const [followUps, setFollowUps] = useState({});
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
 
  // Load sessions
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "screeningSessions"), async (snap) => {
      const realDocs = snap.docs.filter(d => d.data().childName);
      if (realDocs.length === 0) {
        for (const s of SEED_SESSIONS) {
          await addDoc(collection(db, "screeningSessions"), { ...s, createdAt: serverTimestamp() });
        }
      } else {
        setSessions(realDocs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);
 
  // Load follow-ups in real time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "followUps"), (snap) => {
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        map[data.childName] = { ...data, docId: d.id };
      });
      setFollowUps(map);
    });
    return () => unsub();
  }, []);
 
  const filtered = sessions.filter(s => {
    const matchSearch = !search ||
      s.childName?.toLowerCase().includes(search.toLowerCase()) ||
      s.school?.toLowerCase().includes(search.toLowerCase());
    const matchStage = !stageFilter || s.stage === stageFilter;
    return matchSearch && matchStage;
  });
 
  const statusLabel = (s) => {
    if (s === "On Track") return t.onTrack;
    if (s === "Progressing") return t.progressing;
    if (s === "Developmental Concerns") return t.devConcerns;
    return s;
  };
 
  const handleDeleteSession = async () => {
    if (!selected?.id) return;
    await deleteDoc(doc(db, "screeningSessions", selected.id));
    setSelected(null);
    setShowDeleteConfirm(false);
  };
 
  const domains = [
    { key: "cognitive", label: t.cognitive },
    { key: "motor", label: t.motor },
    { key: "language_score", label: t.lang },
    { key: "social", label: t.social },
    { key: "emotion", label: t.emotion },
    { key: "moral", label: t.moral },
  ];
 
  if (loading) {
    return (
      <div className="page-fade">
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-title">Loading sessions...</div>
            <div className="empty-state-sub">Setting up database</div>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="page-fade">
      <div className="search-bar">
        <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          <option value="">{t.filterStatus}</option>
          <option value="stage1">{t.stage1}</option>
          <option value="stage2">{t.stage2}</option>
          <option value="stage3">{t.stage3}</option>
          <option value="stage4">{t.stage4}</option>
        </select>
        <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginLeft: "auto" }}>
          {t.showing} {filtered.length} {t.of} {sessions.length} {t.sessions}
        </span>
      </div>
 
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">{t.noResults}</div>
            <div className="empty-state-sub">{t.noResultsSub}</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.childID}</th>
                  <th>{t.school}</th>
                  <th>{t.age}</th>
                  <th>{t.language}</th>
                  <th>{t.score}</th>
                  <th>{t.date}</th>
                  <th>{t.sessionStatus}</th>
                  <th>{t.followUp}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const sc = stageColors[s.stage] || stageColors.stage1;
                  const rawKey = s.followUpStage || "fu1";
const followUpKey = rawKey.startsWith("followUp")
  ? rawKey.replace("followUp", "fu")
  : rawKey;
const fc = followUpColors[followUpKey] || followUpColors.fu1;
                  return (
                    <tr key={s.id || i}>
                      <td style={{ fontWeight: 700 }}>{s.childName}</td>
                      <td>{s.school}</td>
                      <td>{s.age} yrs</td>
                      <td>{s.language}</td>
                      <td><strong>{s.score}%</strong></td>
                      <td style={{ color: "var(--ink-faint)", fontSize: 12 }}>{s.date}</td>
                      <td>
                        <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {t[s.stage] || s.stage}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: fc.bg, color: fc.color }}>
                          {t[followUpKey] || t[rawKey] || followUpKey}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-teal btn-sm" onClick={() => { setSelected(s); setShowDeleteConfirm(false); }}>{t.view}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
 
      {/* VIEW MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.childName}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
 
            {/* SESSION DETAILS */}
            <div className="report-section">
              <div className="report-section-title">{t.sessionDetail}</div>
              <div className="report-row"><span className="report-row-label">{t.school}</span><span className="report-row-value">{selected.school}</span></div>
              <div className="report-row"><span className="report-row-label">{t.age}</span><span className="report-row-value">{selected.age} years</span></div>
              <div className="report-row"><span className="report-row-label">{t.language}</span><span className="report-row-value">{selected.language}</span></div>
              <div className="report-row"><span className="report-row-label">{t.examiner}</span><span className="report-row-value">{selected.examiner}</span></div>
              <div className="report-row"><span className="report-row-label">{t.date}</span><span className="report-row-value">{selected.date}</span></div>
              <div className="report-row">
                <span className="report-row-label">{t.sessionStatus}</span>
                <span style={{ fontWeight: 700, color: stageColors[selected.stage]?.color }}>{t[selected.stage]}</span>
              </div>
            </div>
 
            {/* FOLLOW-UP INFO FROM STUDENT RECORDS */}
            <div className="report-section">
              <div className="report-section-title"> {t.followUpInfo}</div>
              {followUps[selected.childName] ? (
                <div style={{ padding: 14, background: "var(--teal-lt)", borderRadius: 12, border: "1px solid rgba(0,155,141,0.2)" }}>
                  <div style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 2 }}>
                    <div className="report-row">
                      <span className="report-row-label">{t.followUpStatus}</span>
                      <span style={{ fontWeight: 700, color: followUpColors[followUps[selected.childName].followUpType]?.color }}>
                        {t[followUps[selected.childName].followUpType]}
                      </span>
                    </div>
                    <div className="report-row">
                      <span className="report-row-label">{t.followUpDate}</span>
                      <span className="report-row-value">{followUps[selected.childName].followUpDate}</span>
                    </div>
                    <div className="report-row">
                      <span className="report-row-label">{t.followUpPsych}</span>
                      <span className="report-row-value">{followUps[selected.childName].followUpPsych}</span>
                    </div>
                    {followUps[selected.childName].followUpReason && (
                      <div className="report-row">
                        <span className="report-row-label">{t.followUpReason}</span>
                        <span className="report-row-value">{followUps[selected.childName].followUpReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", background: "var(--surface)", borderRadius: 10, fontSize: 13, color: "var(--ink-faint)", fontWeight: 600 }}>
                  {t.noFollowUp}
                </div>
              )}
            </div>
 
            {/* DOMAIN SCORES */}
            <div className="report-section">
              <div className="report-section-title">{t.domainScores}</div>
              {domains.map(d => (
                <div className="domain-bar" key={d.key}>
                  <div className="domain-bar-header">
                    <span>{d.label}</span>
                    <span>{selected[d.key] || 0}%</span>
                  </div>
                  <div className="domain-bar-track">
                    <div className="domain-bar-fill" style={{ width: `${selected[d.key] || 0}%`, background: domainColors[d.key] }}></div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* RESULT */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16,
              background: selected.status === "Developmental Concerns" ? "var(--pink-lt)" : selected.status === "On Track" ? "var(--teal-lt)" : "var(--orange-lt)",
              borderRadius: 12, marginBottom: 12
            }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: selected.status === "Developmental Concerns" ? "var(--pink)" : selected.status === "On Track" ? "var(--teal)" : "var(--orange)" }}>
                {statusLabel(selected.status)}
              </span>
              <span style={{ fontFamily: "Nunito", fontSize: 28, fontWeight: 900 }}>{selected.score}%</span>
            </div>
 
            {/* DELETE SESSION */}
            {!showDeleteConfirm ? (
              <button
                className="btn btn-sm"
                style={{ width: "100%", background: "var(--pink-lt)", color: "var(--pink)", border: "1px solid rgba(232,23,93,0.2)" }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑 {t.deleteSession}
              </button>
            ) : (
              <div style={{ padding: 14, background: "var(--pink-lt)", borderRadius: 12, border: "1px solid rgba(232,23,93,0.2)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)", marginBottom: 10 }}>{t.deleteConfirm}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>{t.cancel}</button>
                  <button className="btn btn-sm" style={{ flex: 1, background: "var(--pink)", color: "#fff", border: "none" }} onClick={handleDeleteSession}>
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 