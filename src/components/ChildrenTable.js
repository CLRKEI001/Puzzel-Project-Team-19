import React, { useState } from "react";
 
const T = {
  en: {
    search: "Search by name or school...", filterProvince: "All Provinces", filterStatus: "All Statuses",
    filterLang: "All Languages", showing: "Showing", of: "of", children: "children",
    id: "Child ID", name: "Name", school: "School", age: "Age", language: "Language",
    status: "Status", score: "Score", date: "Date", examiner: "Examiner", actions: "Actions",
    view: "View", onTrack: "On Track", progressing: "Progressing", devConcerns: "Developmental Concerns",
    childDetail: "Child Detail", close: "Close", domainScores: "Domain Scores",
    cognitive: "Cognitive", motor: "Fine Motor", lang: "Language", social: "Social",
    emotion: "Emotion", moral: "Moral", totalScore: "Total Score", flag: "Flagged",
    noFlag: "No Flag", province: "Province", gender: "Gender", noResults: "No children found",
    noResultsSub: "Try adjusting your search or filters"
  },
  af: {
    search: "Soek op naam of skool...", filterProvince: "Alle Provinsies", filterStatus: "Alle Statusse",
    filterLang: "Alle Tale", showing: "Wys", of: "van", children: "kinders",
    id: "Kind ID", name: "Naam", school: "Skool", age: "Ouderdom", language: "Taal",
    status: "Status", score: "Punt", date: "Datum", examiner: "Ondersoeker", actions: "Aksies",
    view: "Sien", onTrack: "Op Koers", progressing: "Vordering", devConcerns: "Ontwikkelingsbekommernisse",
    childDetail: "Kind Detail", close: "Maak Toe", domainScores: "Domeinpunte",
    cognitive: "Kognitief", motor: "Fyn Motories", lang: "Taal", social: "Sosiaal",
    emotion: "Emosie", moral: "Moreel", totalScore: "Totale Punt", flag: "Gevlag",
    noFlag: "Geen Vlag", province: "Provinsie", gender: "Geslag", noResults: "Geen kinders gevind",
    noResultsSub: "Probeer om jou soektog of filters aan te pas"
  },
  xh: {
    search: "Khangela ngegama okanye isikolo...", filterProvince: "Zonke iZifundazwe", filterStatus: "Zonke iziMeko",
    filterLang: "Zonke iilwimi", showing: "Ibonisa", of: "kwi", children: "abantwana",
    id: "ID yoMntwana", name: "Igama", school: "Isikolo", age: "Iminyaka", language: "Ulwimi",
    status: "Imeko", score: "Amanqaku", date: "Umhla", examiner: "Umhloli", actions: "Izenzo",
    view: "Jonga", onTrack: "Esendleleni", progressing: "Inkqubela", devConcerns: "Iingxaki Zentlalo",
    childDetail: "Iinkcukacha zoMntwana", close: "Vala", domainScores: "Amanqaku eMihlaba",
    cognitive: "Ukucinga", motor: "Amandla", lang: "Ulwimi", social: "Uluntu",
    emotion: "Imvakalelo", moral: "Isimo", totalScore: "Amanqaku Apheleleyo", flag: "Ikhombiwe",
    noFlag: "Akukho Mkhomba", province: "Isifundazwe", gender: "Isini", noResults: "Akufumaneki bantwana",
    noResultsSub: "Zama ukuguqula ukukhangela okanye iifilta"
  }
};
 
const statusColors = {
  "On Track": "pill-teal",
  "Progressing": "pill-orange",
  "Developmental Concerns": "pill-pink"
};
 
const domainColors = {
  cognitive: "#009B8D", motor: "#6B2F8A", language_score: "#F26522",
  social: "#E8175D", emotion: "#009B8D", moral: "#6B2F8A"
};
 
export default function ChildrenTable({ children, lang, resultsView }) {
  const t = T[lang];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [selected, setSelected] = useState(null);
 
  const statusLabel = (s) => {
    if (s === "On Track") return t.onTrack;
    if (s === "Progressing") return t.progressing;
    if (s === "Developmental Concerns") return t.devConcerns;
    return s;
  };
 
  const filtered = children.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.school?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchLang = !langFilter || c.language === langFilter;
    return matchSearch && matchStatus && matchLang;
  });
 
  const domains = [
    { key: "cognitive", label: t.cognitive },
    { key: "motor", label: t.motor },
    { key: "language_score", label: t.lang },
    { key: "social", label: t.social },
    { key: "emotion", label: t.emotion },
    { key: "moral", label: t.moral },
  ];
 
  return (
    <div className="page-fade">
      <div className="search-bar">
        <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">{t.filterStatus}</option>
          <option value="On Track">{t.onTrack}</option>
          <option value="Progressing">{t.progressing}</option>
          <option value="Developmental Concerns">{t.devConcerns}</option>
        </select>
        <select className="filter-select" value={langFilter} onChange={e => setLangFilter(e.target.value)}>
          <option value="">{t.filterLang}</option>
          <option value="isiXhosa">isiXhosa</option>
          <option value="English">English</option>
          <option value="Afrikaans">Afrikaans</option>
        </select>
        <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginLeft: "auto" }}>
          {t.showing} {filtered.length} {t.of} {children.length} {t.children}
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
                  <th>{t.id}</th>
                  <th>{t.school}</th>
                  <th>{t.age}</th>
                  <th>{t.language}</th>
                  <th>{t.score}</th>
                  <th>{t.status}</th>
                  <th>{t.date}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((child, i) => (
                  <tr key={child.id || i} onClick={() => setSelected(child)}>
                    <td style={{ fontWeight: 700 }}>{child.name}</td>
                    <td>{child.school}</td>
                    <td>{child.age} yrs</td>
                    <td>{child.language}</td>
                    <td><strong>{child.total}%</strong></td>
                    <td>
                      <span className={`pill ${statusColors[child.status] || "pill-purple"}`}>
                        {statusLabel(child.status)}
                      </span>
                    </td>
                    <td style={{ color: "var(--ink-faint)" }}>{child.date}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelected(child); }}>
                        {t.view}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
 
      {/* CHILD DETAIL MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
 
            <div className="report-section">
              <div className="report-section-title">{t.childDetail}</div>
              <div className="report-row"><span className="report-row-label">{t.school}</span><span className="report-row-value">{selected.school}</span></div>
              <div className="report-row"><span className="report-row-label">{t.province}</span><span className="report-row-value">{selected.province}</span></div>
              <div className="report-row"><span className="report-row-label">{t.age}</span><span className="report-row-value">{selected.age} years</span></div>
              <div className="report-row"><span className="report-row-label">{t.gender}</span><span className="report-row-value">{selected.gender}</span></div>
              <div className="report-row"><span className="report-row-label">{t.language}</span><span className="report-row-value">{selected.language}</span></div>
              <div className="report-row"><span className="report-row-label">{t.examiner}</span><span className="report-row-value">{selected.examiner}</span></div>
              <div className="report-row"><span className="report-row-label">{t.date}</span><span className="report-row-value">{selected.date}</span></div>
            </div>
 
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
 
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: selected.status === "Developmental Concerns" ? "var(--pink-lt)" : selected.status === "On Track" ? "var(--teal-lt)" : "var(--orange-lt)", borderRadius: 12 }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: selected.status === "Developmental Concerns" ? "var(--pink)" : selected.status === "On Track" ? "var(--teal)" : "var(--orange)" }}>
                {statusLabel(selected.status)}
              </span>
              <span style={{ fontFamily: "Nunito", fontSize: 28, fontWeight: 900, color: "var(--ink)" }}>{selected.total}%</span>
            </div>
 
            {selected.flagged && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                ⚑ {t.flag} — referral for further assessment recommended
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}