import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const T = {
  en: {
    activeFlags: "Active Flags", total: "total", referred: "Referred", cases: "cases",
    resolved: "Resolved", flagTypes: "Weak Domains", noFlags: "No flags raised",
    noFlagsSub: "All children are currently within normal developmental range",
    requiresFollowUp: "Requires follow-up", referredPsych: "Referred to psychologist",
    cognitive: "Cognitive", motor: "Fine Motor", social: "Social", emotion: "Emotion",
    devConcerns: "Developmental Concerns", progressing: "Progressing", onTrack: "On Track",
    flaggedOn: "Flagged on", school: "School", score: "Score",
    sendMessage: "Send Diagnosis to Teacher", sending: "Sending...", sent: "Message Sent ✓",
    msgTitle: "Send Diagnosis Report to Teacher",
    teacherEmail: "Teacher Email Address", teacherName: "Teacher Name",
    childName: "Child", diagnosis: "Diagnosis Summary", language: "Message Language",
    send: "Send Report", cancel: "Cancel",
    diagPlaceholder: "Enter the diagnosis summary for the teacher to share with the parent...",
    msgSuccess: "Message saved successfully. Teacher will be notified.",
    viewMessages: "View Sent Messages", hideMessages: "Hide Messages",
    noMessages: "No messages sent yet", sentOn: "Sent on", to: "To",
    lang_en: "English", lang_af: "Afrikaans", lang_xh: "isiXhosa",
    diagTemplate_en: "Dear Teacher,\n\nPlease be advised that [CHILD] has been assessed using the PuzzleBox Screener and the results indicate Developmental Concerns.\n\nThe child scored [SCORE]% overall. Areas requiring attention are listed in the domain scores above. This is not a clinical diagnosis — please share this information with the parent and recommend they seek further professional assessment.\n\nKind regards,\nThe Puzzle Project Psychologist",
    diagTemplate_af: "Geagte Onderwyser,\n\nHierby word u in kennis gestel dat [CHILD] geassesseer is met die PuzzleBox Sifter en die resultate dui op Ontwikkelingsbekommernisse.\n\nDie kind het [SCORE]% behaal. Gebiede wat aandag benodig word hierbo gelys. Dit is nie 'n kliniese diagnose nie — deel hierdie inligting met die ouer en beveel verdere professionele assessering aan.\n\nVriendelike groete,\nDie Puzzle Project Sielkundige",
    diagTemplate_xh: "Mfundisi Ohloniphekileyo,\n\nNdicela ukukwazisa ukuba [CHILD] uhlolwe ngeSixhobo se-PuzzleBox kwaye iziphumo zibonisa Iingxaki Zentlalo.\n\nUmntwana ufikelele ku-[SCORE]% iyonke. Iindawo ezifuna ingqalelo zibonisiwe ngentla. Oku akukhonto ngokwezonyango — nceda yabelane ngolu lwazi nomzali uze ucebise uhlolo oluqhubelekileyo.\n\nNgobubele,\nIsazi sengqondo se-Puzzle Project"
  },
  af: {
    activeFlags: "Aktiewe Vlae", total: "totaal", referred: "Verwys", cases: "gevalle",
    resolved: "Opgelos", flagTypes: "Swak Domeine", noFlags: "Geen vlae",
    noFlagsSub: "Alle kinders is binne normale ontwikkelingsreeks",
    requiresFollowUp: "Vereis opvolg", referredPsych: "Verwys na sielkundige",
    cognitive: "Kognitief", motor: "Fyn Motories", social: "Sosiaal", emotion: "Emosie",
    devConcerns: "Ontwikkelingsbekommernisse", progressing: "Vordering", onTrack: "Op Koers",
    flaggedOn: "Gevlag op", school: "Skool", score: "Punt",
    sendMessage: "Stuur Diagnose na Onderwyser", sending: "Stuur...", sent: "Gestuur ✓",
    msgTitle: "Stuur Diagnose na Onderwyser",
    teacherEmail: "Onderwyser E-pos", teacherName: "Onderwyser Naam",
    childName: "Kind", diagnosis: "Diagnose Opsomming", language: "Boodskaптааl",
    send: "Stuur Verslag", cancel: "Kanselleer",
    diagPlaceholder: "Voer die diagnose-opsomming in...",
    msgSuccess: "Boodskap suksesvol gestoor.",
    viewMessages: "Sien Gestuurde Boodskappe", hideMessages: "Verberg Boodskappe",
    noMessages: "Nog geen boodskappe", sentOn: "Gestuur op", to: "Aan",
    lang_en: "Engels", lang_af: "Afrikaans", lang_xh: "isiXhosa",
    diagTemplate_en: "", diagTemplate_af: "", diagTemplate_xh: ""
  },
  xh: {
    activeFlags: "Izikhombisi Ezisebenzayo", total: "iyonke", referred: "Zathunyelwa", cases: "amatyala",
    resolved: "Zixazululiwe", flagTypes: "IMihlaba Ebuthathaka", noFlags: "Akukho zikhombisi",
    noFlagsSub: "Bonke abantwana basezingeni eliqhelekileyo",
    requiresFollowUp: "Ifuna ukulandelwa", referredPsych: "Ithunyelwe kwisazi sengqondo",
    cognitive: "Ukucinga", motor: "Amandla", social: "Uluntu", emotion: "Imvakalelo",
    devConcerns: "Iingxaki Zentlalo", progressing: "Inkqubela", onTrack: "Esendleleni",
    flaggedOn: "Ikhombiwe ngo", school: "Isikolo", score: "Amanqaku",
    sendMessage: "Thumela Ukuhlolwa", sending: "Ithumela...", sent: "Uthunyelwe ✓",
    msgTitle: "Thumela Ingxelo Kumfundisi",
    teacherEmail: "I-Imeyile", teacherName: "Igama loMfundisi",
    childName: "Umntwana", diagnosis: "Isishwankathelo", language: "Ulwimi",
    send: "Thumela", cancel: "Rhoxisa",
    diagPlaceholder: "Faka isishwankathelo...",
    msgSuccess: "Umyalezo ugcinwe ngempumelelo.",
    viewMessages: "Jonga Imiyalezo", hideMessages: "Fihla Imiyalezo",
    noMessages: "Akukho myalezo", sentOn: "Ithunyelwe ngo", to: "Ku",
    lang_en: "IsiNgesi", lang_af: "IsiBhulu", lang_xh: "IsiXhosa",
    diagTemplate_en: "", diagTemplate_af: "", diagTemplate_xh: ""
  }
};

const domainColors = {
  cognitive: "#009B8D", motor: "#6B2F8A", social: "#E8175D", emotion: "#F26522"
};

export default function FlagsAlerts({ children, lang }) {
  const t = T[lang];
  const [selectedChild, setSelectedChild] = useState(null);
  const [msgLang, setMsgLang] = useState("en");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [success, setSuccess] = useState("");
    // =========================
  // FILTER STATES
  // =========================
  const [selectedDomain, setSelectedDomain] = useState("all");
const [selectedStatus, setSelectedStatus] = useState("flagged");
const [selectedScore, setSelectedScore] = useState("all");
const [sortOrder, setSortOrder] = useState("highest");
//const flagged = children.filter(c => c.flagged);
    // =========================
  // FILTER LOGIC
  // =========================
 const filteredChildren = children
  .filter(child => {

    // STATUS FILTER
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "flagged" && child.flagged) ||
      (selectedStatus === "referred" && child.referred) ||
      (selectedStatus === "resolved" && child.resolved);

    // DOMAIN FILTER
    const domainMatch =
      selectedDomain === "all"
        ? child.flagged
        : (child[selectedDomain] || 0) <= 2;

        // SCORE FILTER
    const scoreMatch =
      selectedScore === "all"
        ? true
        : (child[selectedDomain] || 0) === Number(selectedScore);

    return statusMatch && domainMatch && scoreMatch;
  })

  .sort((a, b) => {

    if (selectedDomain === "all") return 0;

    const aScore = a[selectedDomain] || 0;
    const bScore = b[selectedDomain] || 0;

    return sortOrder === "highest"
      ? aScore - bScore
      : bScore - aScore;
  });
  const flagged = filteredChildren.filter(c => c.flagged);
  const domainKeys = ["cognitive", "motor", "social", "emotion"];
  const domainLabels = {
    cognitive: t.cognitive, motor: t.motor, social: t.social, emotion: t.emotion
  };

  const domainFlagCounts = {};
  flagged.forEach(c => {
    domainKeys.forEach(k => {
      if ((c[k] || 0) < 50) {
        domainFlagCounts[k] = (domainFlagCounts[k] || 0) + 1;
      }
    });
  });

  const openMessageModal = (child) => {
    setSelectedChild(child);
    setSentId(null);
    setSuccess("");
    setTeacherEmail("");
    setTeacherName("");
    setMsgLang("en");
    const template = T.en.diagTemplate_en
      .replace("[CHILD]", child.name)
      .replace("[SCORE]", child.total);
    setDiagnosis(template);
  };

  const handleLangChange = (newLang) => {
    setMsgLang(newLang);
    if (!selectedChild) return;
    const templateKey = `diagTemplate_${newLang}`;
    const template = (T.en[templateKey] || T.en.diagTemplate_en)
      .replace("[CHILD]", selectedChild.name)
      .replace("[SCORE]", selectedChild.total);
    setDiagnosis(template);
  };

  const sendMessage = async () => {
    if (!teacherEmail || !diagnosis) return;
    setSending(true);
    try {
      const docRef = await addDoc(collection(db, "messages"), {
        childName: selectedChild.name,
        childScore: selectedChild.total,
        childStatus: selectedChild.status,
        school: selectedChild.school,
        teacherEmail,
        teacherName,
        diagnosis,
        language: msgLang,
        sentAt: serverTimestamp(),
        sentBy: "Psychologist",
        domains: {
          cognitive: selectedChild.cognitive,
          motor: selectedChild.motor,
          social: selectedChild.social,
          emotion: selectedChild.emotion
        }
      });
      setMessages(prev => [...prev, {
        id: docRef.id,
        childName: selectedChild.name,
        teacherEmail,
        teacherName,
        diagnosis,
        language: msgLang,
        sentAt: new Date().toLocaleDateString()
      }]);
      setSentId(docRef.id);
      setSuccess(t.msgSuccess);
      setShowMessages(true);
    } catch (err) {
      console.error("Error sending message:", err);
    }
    setSending(false);
  };

  if (flagged.length === 0) {
    return (
      <div className="page-fade">
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">{t.noFlags}</div>
            <div className="empty-state-sub">{t.noFlagsSub}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade">

      {/* SUMMARY STATS */}
      <div className="three-col" style={{ marginBottom: 20 }}>
        <div className="stat-card c4" style={{ marginBottom: 0 }}>
          <div className="stat-label">{t.activeFlags}</div>
          <div className="stat-value">{filteredChildren.length}</div>
          <div className="stat-change down">{filteredChildren.length} {t.total}</div>
        </div>
        <div className="stat-card c2" style={{ marginBottom: 0 }}>
          <div className="stat-label">{t.referred}</div>
          <div className="stat-value">{messages.length}</div>
          <div className="stat-change">{messages.length} {t.cases}</div>
        </div>
        <div className="stat-card c1" style={{ marginBottom: 0 }}>
          <div className="stat-label">{t.resolved}</div>
          <div className="stat-value">{Math.floor(filteredChildren.length * 0.2)}</div>
          <div className="stat-change">↑ this month</div>
        </div>
      </div>

      <div className="top-filter-bar">

  <div className="filter-heading">
    Student Filters
  </div>

  {/* STATUS */}
  <div className="filter-group">
    <label>Status</label>

    <select
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
    >
      <option value="all">All Students</option>
      <option value="flagged">Flagged</option>
      <option value="referred">Referred</option>
      <option value="resolved">Resolved</option>
    </select>
  </div>

  {/* DOMAIN */}
  <div className="filter-group">
    <label>Weak Domain</label>

    <select
      value={selectedDomain}
      onChange={(e) => setSelectedDomain(e.target.value)}
    >
      <option value="all">All Domains</option>
      <option value="cognitive">Cognitive</option>
      <option value="motor">Fine Motor</option>
      <option value="social">Social</option>
      <option value="emotion">Emotion</option>
    </select>
  </div>

  {/* SCORE */}
  <div className="filter-group">
    <label>Domain Score</label>

    <select
      value={selectedScore}
      onChange={(e) => setSelectedScore(e.target.value)}
    >
      <option value="all">All Scores</option>
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
  </div>

  {/* SORT */}
  <div className="filter-group">
    <label>Sort Scores</label>

    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
    >
      <option value="highest">Highest → Lowest</option>
      <option value="lowest">Lowest → Highest</option>
    </select>
  </div>

</div>
 
        {/* FLAGGED CHILDREN LIST */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.activeFlags}</div>
            <span className="card-badge badge-pink">{filteredChildren.length} {t.total}</span>
          </div>
          <div className="flag-list">
            {filteredChildren.map((child, i) => (
              <div className="flag-item" key={child.id || i}>
                <div className="flag-icon" style={{ background: "var(--pink-lt)", color: "var(--pink)" }}>⚑</div>
                <div style={{ flex: 1 }}>
                  <div className="flag-name">{child.name}</div>
               <div className="flag-meta">
  {child.school}
</div>

{selectedDomain !== "all" && (
  <div
    style={{
      marginTop: 6,
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      background: "var(--pink-lt)",
      color: "var(--pink)",
      fontWeight: 800,
      fontSize: 12
    }}
  >
    {domainLabels[selectedDomain]} Score:
    {" "}
    {child[selectedDomain] || 0}
  </div>
)}
                  <div className="flag-meta">{t.flaggedOn} {child.date}</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openMessageModal(child)}
                  style={{ fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  ✉ Send
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* DOMAIN WEAKNESS */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.flagTypes}</div>
            <span className="card-badge badge-orange">Summary</span>
          </div>
          <div className="bar-chart">
            {Object.entries(domainFlagCounts).map(([key, count]) => (
              <div className="bar-row" key={key}>
                <div className="bar-label">{domainLabels[key] || key}</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(count / flagged.length) * 100}%`, background: domainColors[key] || "var(--pink)" }}></div>
                </div>
                <div className="bar-pct">{count}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowMessages(!showMessages)}
              style={{ width: "100%", marginBottom: 12 }}
            >
              {showMessages ? t.hideMessages : t.viewMessages} ({messages.length})
            </button>
            {showMessages && (
              messages.length === 0
                ? <div style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", padding: 12 }}>{t.noMessages}</div>
                : messages.map((m, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{m.childName}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{t.to}: {m.teacherEmail}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{t.sentOn} {m.sentAt}</div>
                  </div>
                ))
            )}
          </div>
        </div>
     

      {/* SEND MESSAGE MODAL */}
      {selectedChild && !sentId && (
        <div className="modal-overlay" onClick={() => setSelectedChild(null)}>
          <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{t.msgTitle}</div>
              <button className="modal-close" onClick={() => setSelectedChild(null)}>✕</button>
            </div>

            {/* CHILD SUMMARY BAR */}
            <div style={{ padding: "12px 16px", background: "var(--pink-lt)", borderRadius: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--pink)" }}>{selectedChild.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-mid)" }}>{selectedChild.school} · Score: {selectedChild.total}%</div>
              </div>
              <span className="pill pill-pink">⚑ {t.requiresFollowUp}</span>
            </div>

            {/* DOMAIN SCORES */}
            <div style={{ marginBottom: 20 }}>
              {domainKeys.map(k => (
                <div className="domain-bar" key={k}>
                  <div className="domain-bar-header">
                    <span>{domainLabels[k]}</span>
                    <span style={{ color: (selectedChild[k] || 0) < 50 ? "var(--pink)" : "var(--teal)" }}>
                      {selectedChild[k] || 0}%
                    </span>
                  </div>
                  <div className="domain-bar-track">
                    <div className="domain-bar-fill" style={{
                      width: `${selectedChild[k] || 0}%`,
                      background: (selectedChild[k] || 0) < 50 ? "var(--pink)" : domainColors[k]
                    }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* TEACHER DETAILS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 6 }}>
                  {t.teacherName}
                </label>
                <input
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none" }}
                  placeholder="e.g. Ms Nkosi"
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 6 }}>
                  {t.teacherEmail}
                </label>
                <input
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none" }}
                  placeholder="teacher@school.co.za"
                  value={teacherEmail}
                  onChange={e => setTeacherEmail(e.target.value)}
                  type="email"
                />
              </div>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 8 }}>
                {t.language}
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {["en", "af", "xh"].map(code => (
                  <button
                    key={code}
                    className={`lang-btn ${msgLang === code ? "active" : ""}`}
                    onClick={() => handleLangChange(code)}
                  >
                    {T.en[`lang_${code}`]}
                  </button>
                ))}
              </div>
            </div>

            {/* DIAGNOSIS TEXT */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 8 }}>
                {t.diagnosis}
              </label>
              <textarea
                style={{ width: "100%", padding: 12, border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontFamily: "inherit", minHeight: 160, resize: "vertical", outline: "none", lineHeight: 1.6 }}
                placeholder={t.diagPlaceholder}
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setSelectedChild(null)}>{t.cancel}</button>
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={sending || !teacherEmail || !diagnosis}
              >
                {sending ? t.sending : `✉ ${t.send}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {sentId && (
        <div className="modal-overlay" onClick={() => setSentId(null)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: "Nunito", fontSize: 20, fontWeight: 900, color: "var(--ink)", marginBottom: 8 }}>{t.sent}</div>
            <div style={{ fontSize: 13, color: "var(--ink-faint)", marginBottom: 24, lineHeight: 1.6 }}>{success}</div>
            <div style={{ padding: "12px 16px", background: "var(--teal-lt)", borderRadius: 12, fontSize: 12, color: "var(--teal)", fontWeight: 600, marginBottom: 20, textAlign: "left" }}>
              <div>📧 {t.to}: {teacherEmail}</div>
              <div>👤 {selectedChild?.name}</div>
              <div>🌐 {T.en[`lang_${msgLang}`]}</div>
            </div>
            <button
              className="btn btn-teal"
              onClick={() => { setSentId(null); setSelectedChild(null); }}
              style={{ width: "100%" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}