// PsychologistHome.js — the home screen a Psychologist lands on after a
// verified login. Personalized greeting, EN/AF/XH switcher, a quick read
// on flagged children and scheduled follow-ups (from the existing
// "children" and "followUps" collections ChildrenTable.js already
// manages), and a menu item into the full analytics Dashboard so
// everything stays linked together rather than living on separate
// disconnected screens.
 
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { mapChildRow, mapFollowUpRow } from "../lib/mappers";
import RoleSidebar from "./RoleSidebar";
import Dashboard from "./Dashboard";
import RoleHero from "./RoleHero";
import StatRing from "./StatRing";
import TodayList from "./TodayList";
import "./TeacherHome.css"; // shared th-quicklink / th-back-fab styles
import "./RoleHomeKit.css";
 
const T = {
  en: {
    roleLabel: "Psychologist",
    navHome: "My Home", navFollowUps: "Follow-ups", navDashboard: "Full Analytics Dashboard", navProfile: "My Profile",
    section1: "Overview", section2: "Caseload", section3: "Account",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    homeSub: "Here's what needs your attention today.",
    followUpsSub: "All follow-up appointments scheduled across the pilot.",
    profileSub: "Your account details and verification status.",
    statFlagged: "Flagged Children", statFollowUps: "Follow-ups Scheduled", statMessages: "Messages Sent",
    total: "total", pending: "pending", allTime: "all time",
    upcomingFollowUps: "Upcoming Follow-ups", viewAll: "View all", noFollowUps: "No follow-ups scheduled",
    noFollowUpsSub: "Appointments you schedule from Student Records will appear here.",
    recentlyFlagged: "Recently Flagged Children", noFlagged: "No flagged children",
    noFlaggedSub: "Children flagged for developmental concerns will appear here.",
    quickLinks: "Quick Links", openDashboard: "Open Full Analytics Dashboard",
    openDashboardSub: "Screening results, trends, and student records.",
    openFlags: "Flags & Alerts", openFlagsSub: "Send diagnosis reports to teachers.",
    backToHome: "← My Home",
    search: "Search by child or school...", of: "of", entriesWord: "follow-ups",
    view: "View", school: "School", date: "Date", status: "Status", reason: "Reason", psychLabel: "Psychologist",
    close: "Close",
    fu1: "Not Required", fu2: "Awaiting First Follow-up",
    fu3: "Follow-up In Progress", fu4: "Follow-up Completed",
    fu5: "Referred to Specialist", fu6: "Pending Parent Response",
    profileName: "Full Name", profileEmail: "Email Address", profileRole: "Role",
    profileStaff: "Staff Number", profileStatus: "Verification Status", verified: "Verified",
  },
  af: {
    roleLabel: "Sielkundige",
    navHome: "My Tuisblad", navFollowUps: "Opvolge", navDashboard: "Volledige Paneelbord", navProfile: "My Profiel",
    section1: "Oorsig", section2: "Gevallelading", section3: "Rekening",
    goodMorning: "Goeie môre", goodAfternoon: "Goeie middag", goodEvening: "Goeie naand",
    homeSub: "Hier is wat vandag jou aandag nodig het.",
    followUpsSub: "Alle opvolgafsprake geskeduleer regoor die loodsprojek.",
    profileSub: "Jou rekeningbesonderhede en verifikasiestatus.",
    statFlagged: "Gevlagde Kinders", statFollowUps: "Opvolge Geskeduleer", statMessages: "Boodskappe Gestuur",
    total: "totaal", pending: "hangend", allTime: "nog altyd",
    upcomingFollowUps: "Komende Opvolge", viewAll: "Sien almal", noFollowUps: "Geen opvolge geskeduleer",
    noFollowUpsSub: "Afsprake wat jy skeduleer sal hier verskyn.",
    recentlyFlagged: "Onlangs Gevlagde Kinders", noFlagged: "Geen gevlagde kinders",
    noFlaggedSub: "Kinders wat gevlag word sal hier verskyn.",
    quickLinks: "Vinnige Skakels", openDashboard: "Maak Volledige Paneelbord Oop",
    openDashboardSub: "Siftingsresultate, neigings en leerlingrekords.",
    openFlags: "Vlae & Waarskuwings", openFlagsSub: "Stuur diagnoseverslae aan onderwysers.",
    backToHome: "← My Tuisblad",
    search: "Soek volgens kind of skool...", of: "van", entriesWord: "opvolge",
    view: "Sien", school: "Skool", date: "Datum", status: "Status", reason: "Rede", psychLabel: "Sielkundige",
    close: "Maak Toe",
    fu1: "Nie Nodig", fu2: "Wag op Eerste Opvolg",
    fu3: "Opvolg aan die Gang", fu4: "Opvolg Voltooi",
    fu5: "Verwys na Spesialis", fu6: "Wag op Ouer Reaksie",
    profileName: "Volle Naam", profileEmail: "E-pos", profileRole: "Rol",
    profileStaff: "Personeelnommer", profileStatus: "Verifikasiestatus", verified: "Geverifieer",
  },
  xh: {
    roleLabel: "Isazi Sengqondo",
    navHome: "Ikhaya Lam", navFollowUps: "Ukulandelwa", navDashboard: "Ideshibhodi Epheleleyo", navProfile: "Iprofayile Yam",
    section1: "Uhlolo", section2: "Umthwalo Wamatyala", section3: "Iakhawunti",
    goodMorning: "Molo", goodAfternoon: "Molo Emini", goodEvening: "Molo Ngokuhlwa",
    homeSub: "Nazi izinto ezidinga ingqalelo yakho namhlanje.",
    followUpsSub: "Zonke iindibano zokulandelwa ezicwangciselweyo.",
    profileSub: "Iinkcukacha zeakhawunti yakho nemeko yokuqinisekiswa.",
    statFlagged: "Abantwana Abakhonjiweyo", statFollowUps: "Ukulandelwa Okucwangcisiweyo", statMessages: "Imiyalezo Ethunyelweyo",
    total: "iyonke", pending: "kulindile", allTime: "sonke isihlandlo",
    upcomingFollowUps: "Ukulandelwa Okuzayo", viewAll: "Jonga Yonke", noFollowUps: "Akukho kulandelwa okucwangcisiweyo",
    noFollowUpsSub: "Iindibano ozicwangcisayo ziya kubonakala apha.",
    recentlyFlagged: "Abantwana Abakhonjwe Kutsha Nje", noFlagged: "Akukho bantwana abakhonjiweyo",
    noFlaggedSub: "Abantwana abakhonjiweyo baya kubonakala apha.",
    quickLinks: "Amakhonkco Akhawulezayo", openDashboard: "Vula Ideshibhodi Epheleleyo",
    openDashboardSub: "Iziphumo zohlolo, iinkqubela neerekhodi zabafundi.",
    openFlags: "Izikhombisi & Izisilumkiso", openFlagsSub: "Thumela iingxelo kootitshala.",
    backToHome: "← Ikhaya Lam",
    search: "Khangela ngomntwana okanye isikolo...", of: "kwi", entriesWord: "ukulandelwa",
    view: "Jonga", school: "Isikolo", date: "Umhla", status: "Imeko", reason: "Isizathu", psychLabel: "Isazi Sengqondo",
    close: "Vala",
    fu1: "Ayifunekanga", fu2: "Ilindele Ukulandelwa Kokuqala",
    fu3: "Ukulandelwa Kuyaqhuba", fu4: "Ukulandelwa Kuphelile",
    fu5: "Kuthunyelwe kochwephesha", fu6: "Ilindele Impendulo Yomzali",
    profileName: "Igama Elipheleleyo", profileEmail: "I-imeyile", profileRole: "Indima",
    profileStaff: "Inombolo Yomsebenzi", profileStatus: "Imeko Yokuqinisekiswa", verified: "Kuqinisekisiwe",
  },
};
 
const followUpColors = {
  fu1: { bg: "#F7F6FF", color: "#8888a8" },
  fu2: { bg: "#FEF0E7", color: "#F26522" },
  fu3: { bg: "#FCE6EE", color: "#E8175D" },
  fu4: { bg: "#E0F5F3", color: "#009B8D" },
  fu5: { bg: "#F0E8F7", color: "#6B2F8A" },
  fu6: { bg: "#FEF0E7", color: "#F26522" },
};
 
const NAV_ICONS = {
  home: <svg viewBox="0 0 16 16" fill="none"><path d="M2 7l6-5 6 5v7a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  followUps: <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2.5" width="12" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M2 6h12M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  dashboard: <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg>,
  profile: <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
};
 
export default function PsychologistHome({ user, profile }) {
  const [activePage, setActivePage] = useState("home");
  const [lang, setLang] = useState("en");
  const [children, setChildren] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
 
  const t = T[lang];
  const langLabels = { en: "EN", af: "AF", xh: "XH" };
 
  useEffect(() => {
    let isMounted = true;

    const loadChildren = async () => {
      const { data, error } = await supabase.from("children").select("*");
      if (error) { console.error("Error loading children:", error); return; }
      if (isMounted) {
        setChildren(data.map(mapChildRow));
        setLoading(false);
      }
    };
    const loadFollowUps = async () => {
      const { data, error } = await supabase.from("follow_ups").select("*");
      if (error) { console.error("Error loading follow-ups:", error); return; }
      if (isMounted) {
        const mapped = data
          .map(mapFollowUpRow)
          .sort((a, b) => (a.followUpDate || "").localeCompare(b.followUpDate || ""));
        setFollowUps(mapped);
      }
    };
    const loadMessageCount = async () => {
      const { count, error } = await supabase.from("messages").select("*", { count: "exact", head: true });
      if (error) { console.error("Error loading message count:", error); return; }
      if (isMounted) setMessageCount(count || 0);
    };

    loadChildren();
    loadFollowUps();
    loadMessageCount();

    const childrenChannel = supabase
      .channel("psych-children-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "children" }, () => loadChildren())
      .subscribe();
    const followUpsChannel = supabase
      .channel("psych-followups-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () => loadFollowUps())
      .subscribe();
    const messagesChannel = supabase
      .channel("psych-messages-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => loadMessageCount())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(childrenChannel);
      supabase.removeChannel(followUpsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);
  const displayName = profile?.name || user?.email?.split("@")[0] || "Psychologist";
 
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  }, [t]);
 
  const flaggedChildren = useMemo(() => children.filter((c) => c.flagged), [children]);
  const pendingFollowUps = useMemo(
    () => followUps.filter((f) => f.followUpType && f.followUpType !== "fu4" && f.followUpType !== "fu1").length,
    [followUps]
  );
 
  const filteredFollowUps = followUps.filter((f) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return f.childName?.toLowerCase().includes(s) || f.school?.toLowerCase().includes(s);
  });
 
  const navItems = [
    { id: "home", label: t.navHome, section: t.section1, icon: NAV_ICONS.home },
    { id: "followups", label: t.navFollowUps, section: t.section2, icon: NAV_ICONS.followUps },
    { id: "dashboard", label: t.navDashboard, section: t.section2, icon: NAV_ICONS.dashboard },
    { id: "profile", label: t.navProfile, section: t.section3, icon: NAV_ICONS.profile },
  ];
 
  if (activePage === "dashboard") {
    return (
      <div className="th-dashboard-embed">
        <button className="th-back-fab" onClick={() => setActivePage("home")}>
          {t.backToHome}
        </button>
        <Dashboard user={user} />
      </div>
    );
  }
 
  return (
    <div className="dashboard-layout rh-shell" style={{ "--rh-accent": "#E8175D", "--rh-accent-soft": "#FFE6EF" }}>
      <RoleSidebar
        navItems={navItems}
        activePage={activePage}
        setActivePage={setActivePage}
        roleLabel={t.roleLabel}
        displayName={displayName}
      />
 
      <div className="main-content page-fade">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">
              {activePage === "followups" && t.navFollowUps}
              {activePage === "profile" && t.navProfile}
            </div>
            <div className="page-sub">
              {activePage === "followups" && t.followUpsSub}
              {activePage === "profile" && t.profileSub}
            </div>
          </div>
          <div className="topbar-right">
            <div className="lang-switcher">
              {Object.entries(langLabels).map(([code, label]) => (
                <button key={code} className={`lang-btn ${lang === code ? "active" : ""}`} onClick={() => setLang(code)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
 
        {activePage === "home" && (
          <>
            <RoleHero
              tint="pink"
              eyebrow="The Puzzle Project · Psychologist"
              greeting={`${greeting}, ${displayName.split(" ")[0]}`}
              subtitle={t.homeSub}
            >
              <StatRing value={flaggedChildren.length} max={10} color="#fff" label={t.statFlagged} />
              <StatRing value={followUps.length} max={10} color="#fff" label={t.statFollowUps} />
              <StatRing value={messageCount} max={10} color="#fff" label={t.statMessages} />
            </RoleHero>
 
            <div className="rh-home-grid">
              <div>
                <TodayList
                  title={t.upcomingFollowUps}
                  actionLabel={t.viewAll}
                  onAction={() => setActivePage("followups")}
                  emptyIcon="🗓"
                  emptyTitle={t.noFollowUps}
                  emptySub={t.noFollowUpsSub}
                  onItemClick={(f) => setSelected(f)}
                  items={loading ? null : followUps.slice(0, 5).map((f) => ({
                    icon: "🗓", color: (followUpColors[f.followUpType] || followUpColors.fu1).color,
                    title: f.childName, meta: `${f.school} · ${t.date}: ${f.followUpDate || "—"}`,
                    badge: t[f.followUpType] || f.followUpType,
                  }))}
                />
                <TodayList
                  title={t.recentlyFlagged}
                  emptyIcon="✅"
                  emptyTitle={t.noFlagged}
                  emptySub={t.noFlaggedSub}
                  items={flaggedChildren.slice(0, 5).map((c) => ({
                    icon: "⚑", color: "#E8175D", title: c.name, meta: c.school,
                  }))}
                />
              </div>
 
              <div>
                <div className="rh-profile-card">
                  <div className="rh-profile-avatar" style={{ background: "#E8175D" }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="rh-profile-name">{displayName}</div>
                  <span className="rh-profile-role" style={{ background: "#E8175D1a", color: "#E8175D" }}>{t.roleLabel}</span>
                  <div className="rh-profile-verified">✓ Verified account</div>
                  <div className="rh-chip-grid">
                    <div className="rh-chip">
                      <div className="rh-chip-value">{flaggedChildren.length}</div>
                      <div className="rh-chip-label">{t.statFlagged}</div>
                    </div>
                    <div className="rh-chip">
                      <div className="rh-chip-value">{pendingFollowUps}</div>
                      <div className="rh-chip-label">{t.pending}</div>
                    </div>
                  </div>
                </div>
 
                <div className="rh-card">
                  <div className="rh-card-head"><div className="rh-card-title">{t.quickLinks}</div></div>
                  <button className="th-quicklink" onClick={() => setActivePage("dashboard")}>
                    <div className="th-quicklink-icon">📊</div>
                    <div>
                      <div className="th-quicklink-title">{t.openDashboard}</div>
                      <div className="th-quicklink-sub">{t.openDashboardSub}</div>
                    </div>
                    <div className="th-quicklink-arrow">→</div>
                  </button>
                  <button className="th-quicklink" onClick={() => setActivePage("dashboard")} style={{ marginBottom: 0 }}>
                    <div className="th-quicklink-icon">✉</div>
                    <div>
                      <div className="th-quicklink-title">{t.openFlags}</div>
                      <div className="th-quicklink-sub">{t.openFlagsSub}</div>
                    </div>
                    <div className="th-quicklink-arrow">→</div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
 
        {activePage === "followups" && (
          <>
            <div className="search-bar">
              <input className="search-input" placeholder={t.search} value={search} onChange={(e) => setSearch(e.target.value)} />
              <span style={{ fontSize: 12, color: "var(--ink-faint)", fontWeight: 600, marginLeft: "auto" }}>
                {filteredFollowUps.length} {t.of} {followUps.length} {t.entriesWord}
              </span>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {filteredFollowUps.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🗓</div>
                  <div className="empty-state-title">{t.noFollowUps}</div>
                  <div className="empty-state-sub">{t.noFollowUpsSub}</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t.upcomingFollowUps.replace("Upcoming ", "").replace("Komende ", "").replace("Okuzayo", "")}</th>
                        <th>{t.school}</th>
                        <th>{t.date}</th>
                        <th>{t.status}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFollowUps.map((f) => {
                        const fc = followUpColors[f.followUpType] || followUpColors.fu1;
                        return (
                          <tr key={f.id}>
                            <td style={{ fontWeight: 700 }}>{f.childName}</td>
                            <td>{f.school}</td>
                            <td style={{ color: "var(--ink-faint)", fontSize: 12 }}>{f.followUpDate || "—"}</td>
                            <td>
                              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: fc.bg, color: fc.color }}>
                                {t[f.followUpType] || f.followUpType}
                              </span>
                            </td>
                            <td><button className="btn btn-teal btn-sm" onClick={() => setSelected(f)}>{t.view}</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
 
        {activePage === "profile" && (
          <div className="card" style={{ maxWidth: 520 }}>
            <div className="report-section" style={{ marginBottom: 0 }}>
              <div className="report-row"><span className="report-row-label">{t.profileName}</span><span className="report-row-value">{displayName}</span></div>
              <div className="report-row"><span className="report-row-label">{t.profileEmail}</span><span className="report-row-value">{user?.email}</span></div>
              <div className="report-row"><span className="report-row-label">{t.profileRole}</span><span className="report-row-value">{t.roleLabel}</span></div>
              {profile?.staffNumber && (
                <div className="report-row"><span className="report-row-label">{t.profileStaff}</span><span className="report-row-value">{profile.staffNumber}</span></div>
              )}
              <div className="report-row">
                <span className="report-row-label">{t.profileStatus}</span>
                <span style={{ fontWeight: 700, color: "var(--teal)" }}>✓ {t.verified}</span>
              </div>
            </div>
          </div>
        )}
      </div>
 
      {/* FOLLOW-UP DETAIL MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.childName}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="report-section">
              <div className="report-row"><span className="report-row-label">{t.school}</span><span className="report-row-value">{selected.school}</span></div>
              <div className="report-row"><span className="report-row-label">{t.date}</span><span className="report-row-value">{selected.followUpDate || "—"}</span></div>
              <div className="report-row"><span className="report-row-label">{t.psychLabel}</span><span className="report-row-value">{selected.followUpPsych || "—"}</span></div>
              <div className="report-row">
                <span className="report-row-label">{t.status}</span>
                <span style={{ fontWeight: 700, color: (followUpColors[selected.followUpType] || followUpColors.fu1).color }}>
                  {t[selected.followUpType] || selected.followUpType}
                </span>
              </div>
              {selected.followUpReason && (
                <div className="report-row"><span className="report-row-label">{t.reason}</span><span className="report-row-value">{selected.followUpReason}</span></div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}