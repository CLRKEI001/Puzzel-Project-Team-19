import React, { useState, useEffect } from "react";
import Doodle from "./Doodle";
import { supabase } from "../supabaseClient";
import { mapFollowUpRow } from "../lib/mappers";
 
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
 
 
export default function ScreenerResults({ lang, sessions = [] }) {
  const t = T[lang];
  const [followUps, setFollowUps] = useState({});
  const [search, setSearch] = useState("");
 const [stageFilter, setStageFilter] = useState("");
const [ageFilter, setAgeFilter] = useState("");
const [languageFilter, setLanguageFilter] = useState("");
const [scoreFilter, setScoreFilter] = useState("");
const [followUpFilter, setFollowUpFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const loading = false;
 
  // Sessions now come in as a prop: one row per real, submitted PuzzleBox
  // screening (built in lib/analyticsData.js). This page used to read the
  // demo `screening_sessions` table — and even auto-inserted fake rows into
  // it when empty — which is why it never matched the real results.

  // Load follow-ups in real time — replaces onSnapshot(collection(db, "followUps"), ...)
  useEffect(() => {
    let isMounted = true;

    const loadFollowUps = async () => {
      const { data, error } = await supabase.from("follow_ups").select("*");
      if (error) {
        console.error("Error loading follow-ups:", error);
        return;
      }
      const map = {};
      data.forEach(row => {
        map[row.child_name] = mapFollowUpRow(row);
      });
      if (isMounted) setFollowUps(map);
    };

    loadFollowUps();

    const channel = supabase
      .channel("follow-ups-changes-results")
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () => {
        loadFollowUps();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
 
 const filtered = sessions.filter(s => {
  const matchSearch = !search ||
    s.childName?.toLowerCase().includes(search.toLowerCase()) ||
    s.school?.toLowerCase().includes(search.toLowerCase());
  const matchStage = !stageFilter || s.stage === stageFilter;
  const matchAge = !ageFilter || String(s.age) === ageFilter;
  const matchLanguage = !languageFilter || s.language === languageFilter;
  const matchScore =
    !scoreFilter ? true
    : scoreFilter === "low" ? s.score < 35
    : scoreFilter === "mid" ? s.score >= 35 && s.score < 50
    : scoreFilter === "high" ? s.score >= 50
    : true;
  const matchFollowUp = !followUpFilter || s.followUpStage === followUpFilter;
  return matchSearch && matchStage && matchAge && matchLanguage && matchScore && matchFollowUp;
});
 
  const statusLabel = (s) => {
    if (s === "On Track") return t.onTrack;
    if (s === "Progressing") return t.progressing;
    if (s === "Developmental Concerns") return t.devConcerns;
    return s;
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
        <div className="top-filter-bar" style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}></div>
        <div className="filter-heading">Student Filters</div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center" }}><Doodle name="clipboard" size={56} /></div>
            <div className="empty-state-title">Loading sessions...</div>
            <div className="empty-state-sub">Setting up database</div>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <>
    <div className="top-filter-bar" style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
  <div className="filter-heading">Student Filters</div>

  {/* SEARCH */}
  <div className="filter-group" style={{  minWidth: 200, flex: "2 1 200px" }}>
    <label>Search</label>
    <input
      className="search-input"
      placeholder={t.search}
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={{ height: 48, borderRadius: 16, border: "1.5px solid transparent", background: "#F8F8FC", padding: "0 16px", fontSize: 14, fontWeight: 700, color: "var(--ink-mid)", outline: "none" }}
    />
  </div>

  {/* SESSION STATUS */}
  <div className="filter-group" style={{ minWidth: 160, flex: "1 1 160px" }}>
    <label>Session Status</label>
    <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
      <option value="">{t.filterStatus}</option>
      <option value="stage1">{t.stage1}</option>
      <option value="stage2">{t.stage2}</option>
      <option value="stage3">{t.stage3}</option>
      <option value="stage4">{t.stage4}</option>
    </select>
  </div>

  {/* AGE */}
  <div className="filter-group" style={{ minWidth: 160, flex: "1 1 160px" }}>
    <label>Age</label>
    <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
      <option value="">All Ages</option>
      <option value="5">5 years</option>
      <option value="6">6 years</option>
    </select>
  </div>

  {/* LANGUAGE */}
  <div className="filter-group" style={{ minWidth: 160, flex: "1 1 160px" }}>
    <label>Language</label>
    <select value={languageFilter} onChange={e => setLanguageFilter(e.target.value)}>
      <option value="">All Languages</option>
      <option value="isiXhosa">isiXhosa</option>
      <option value="English">English</option>
      <option value="Afrikaans">Afrikaans</option>
    </select>
  </div>

  {/* SCORE */}
  <div className="filter-group" style={{ minWidth: 160, flex: "1 1 160px" }}>
    <label>Score Range</label>
    <select value={scoreFilter} onChange={e => setScoreFilter(e.target.value)}>
      <option value="">All Scores</option>
      <option value="low">Below 40 — Critical</option>
      <option value="mid">40–60 — Concern</option>
      <option value="high">Above 60 — Good</option>
    </select>
  </div>

  {/* FOLLOW UP */}
  <div className="filter-group" style={{ minWidth: 160, flex: "1 1 160px" }}>
    <label>Follow-up Status</label>
    <select value={followUpFilter} onChange={e => setFollowUpFilter(e.target.value)}>
      <option value="">All Follow-ups</option>
      <option value="fu1">{t.fu1}</option>
      <option value="fu2">{t.fu2}</option>
      <option value="fu3">{t.fu3}</option>
      <option value="fu4">{t.fu4}</option>
      <option value="fu5">{t.fu5}</option>
      <option value="fu6">{t.fu6}</option>
    </select>
  </div>

  {/* RESULTS COUNT */}
  <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, alignSelf: "center", whiteSpace: "nowrap" }}>
    {t.showing} {filtered.length} {t.of} {sessions.length} {t.sessions}
  </div>
    </div>

 
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Doodle name="magnifier" size={64} /></div>
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
                        <button className="btn btn-teal btn-sm" onClick={() => setSelected(s)}>{t.view}</button>
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
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 900 }}>{selected.score}%</span>
            </div>
 
            {/* RAW SCORE + REVIEW OUTCOME (real PuzzleBox screening) */}
            <div style={{ padding: 14, background: "var(--surface)", borderRadius: 12, fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.6 }}>
              <div><strong>Raw score:</strong> {selected.rawScore}{selected.maxScore ? ` / ${selected.maxScore}` : ""}</div>
              <div><strong>Screening:</strong> {selected.screeningStatus === "reviewed" ? "Reviewed by a psychologist" : "Awaiting psychologist review"}</div>
              {selected.reviewVerdict && (
                <div><strong>Psychologist's verdict:</strong> {selected.reviewVerdict === "concerns" ? "Developmental concerns" : "No concerns"}</div>
              )}
              {selected.reviewNotes && <div><strong>Notes:</strong> {selected.reviewNotes}</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}