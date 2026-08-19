// TeacherHome.js — the home screen an Educator/Teacher lands on after a
// verified login. Personalized greeting, EN/AF/XH language switcher,
// a feed of the diagnosis messages psychologists have sent them
// (from the existing "messages" collection FlagsAlerts.js already writes
// to), and navigation to the Screener, Messages and Profile.

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import RoleSidebar from "./RoleSidebar";
import RoleHero from "./RoleHero";
import StatRing from "./StatRing";
import TodayList from "./TodayList";
import PuzzleBoxScreener from "./PuzzleBoxScreener";
import "./TeacherHome.css";
import "./RoleHomeKit.css";

const T = {
  en: {
    roleLabel: "Educator",
    navHome: "My Home",
    navMessages: "Messages",
    navScreener: "PuzzleBox Screener",
    navProfile: "My Profile",

    screenerSub: "Start a new PuzzleBox screening for one of your children.",
    openScreener: "Start Screening",
    openScreenerSub: "Begin a new PuzzleBox Screener session.",

    section1: "Overview",
    section2: "Screenings & Reports",
    section3: "Account",

    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",

    homeSub: "Here's what's new for your class.",
    messagesSub: "Diagnosis reports sent to you by the screening psychologist.",
    profileSub: "Your account details and verification status.",

    statMessages: "Messages Received",
    statFlagged: "Children Flagged",
    statMonth: "This Month",

    total: "total",
    newLabel: "new",
    cases: "cases",

    recentMessages: "Recent Messages",
    viewAll: "View all",
    noMessages: "No messages yet",
    noMessagesSub:
      "When a psychologist sends you a diagnosis report, it will appear here.",

    quickLinks: "Quick Links",

    search: "Search by child or school...",
    of: "of",
    messagesWord: "messages",

    view: "View",
    school: "School",
    score: "Score",
    sentOn: "Sent on",
    language: "Language",

    diagnosis: "Diagnosis Summary",
    domainScores: "Domain Scores",

    cognitive: "Cognitive",
    motor: "Fine Motor",
    social: "Social",
    emotion: "Emotion",

    close: "Close",

    profileName: "Full Name",
    profileEmail: "Email Address",
    profileRole: "Role",
    profileStaff: "Staff / Teacher Number",
    profileStatus: "Verification Status",
    verified: "Verified",

    lang_en: "English",
    lang_af: "Afrikaans",
    lang_xh: "isiXhosa",
  },

  af: {
    roleLabel: "Opvoeder",
    navHome: "My Tuisblad",
    navMessages: "Boodskappe",
    navScreener: "PuzzleBox Sifter",
    navProfile: "My Profiel",

    screenerSub:
      "Begin 'n nuwe PuzzleBox-sifting vir een van jou kinders.",
    openScreener: "Begin Sifting",
    openScreenerSub: "Begin 'n nuwe PuzzleBox Sifter-sessie.",

    section1: "Oorsig",
    section2: "Verslae",
    section3: "Rekening",

    goodMorning: "Goeie môre",
    goodAfternoon: "Goeie middag",
    goodEvening: "Goeie naand",

    homeSub: "Hier is wat nuut is vir jou klas.",
    messagesSub:
      "Diagnoseverslae wat die sielkundige aan jou gestuur het.",
    profileSub: "Jou rekeningbesonderhede en verifikasiestatus.",

    statMessages: "Boodskappe Ontvang",
    statFlagged: "Kinders Gevlag",
    statMonth: "Hierdie Maand",

    total: "totaal",
    newLabel: "nuut",
    cases: "gevalle",

    recentMessages: "Onlangse Boodskappe",
    viewAll: "Sien almal",
    noMessages: "Nog geen boodskappe",
    noMessagesSub:
      "Wanneer 'n sielkundige 'n diagnoseverslag stuur, verskyn dit hier.",

    quickLinks: "Vinnige Skakels",

    search: "Soek volgens kind of skool...",
    of: "van",
    messagesWord: "boodskappe",

    view: "Sien",
    school: "Skool",
    score: "Punt",
    sentOn: "Gestuur op",
    language: "Taal",

    diagnosis: "Diagnose Opsomming",
    domainScores: "Domeinpunte",

    cognitive: "Kognitief",
    motor: "Fyn Motories",
    social: "Sosiaal",
    emotion: "Emosie",

    close: "Maak Toe",

    profileName: "Volle Naam",
    profileEmail: "E-pos",
    profileRole: "Rol",
    profileStaff: "Personeel- / Onderwysernommer",
    profileStatus: "Verifikasiestatus",
    verified: "Geverifieer",

    lang_en: "Engels",
    lang_af: "Afrikaans",
    lang_xh: "isiXhosa",
  },

  xh: {
    roleLabel: "Umfundisi",
    navHome: "Ikhaya Lam",
    navMessages: "Imiyalezo",
    navScreener: "Isikrini se-PuzzleBox",
    navProfile: "Iprofayile Yam",

    screenerSub:
      "Qalisa uhlolo lwe-PuzzleBox olutsha lomnye wabantwana bakho.",
    openScreener: "Qalisa Uhlolo",
    openScreenerSub:
      "Qalisa iseshoni entsha ye-PuzzleBox Screener.",

    section1: "Uhlolo",
    section2: "Iingxelo",
    section3: "Iakhawunti",

    goodMorning: "Molo",
    goodAfternoon: "Molo Emini",
    goodEvening: "Molo Ngokuhlwa",

    homeSub: "Nazi iindaba ezintsha zeklasi yakho.",
    messagesSub:
      "Iingxelo zohlolo ezithunyelwe nguSazi Sengqondo.",
    profileSub:
      "Iinkcukacha zeakhawunti yakho nemeko yokuqinisekiswa.",

    statMessages: "Imiyalezo Efunyenweyo",
    statFlagged: "Abantwana Abakhonjiweyo",
    statMonth: "Le Nyanga",

    total: "iyonke",
    newLabel: "entsha",
    cases: "amatyala",

    recentMessages: "Imiyalezo Yamva Nje",
    viewAll: "Jonga Yonke",
    noMessages: "Akukho miyalezo",
    noMessagesSub:
      "Xa isazi sengqondo sithumela ingxelo, izakuvela apha.",

    quickLinks: "Amakhonkco Akhawulezayo",

    search: "Khangela ngomntwana okanye isikolo...",
    of: "kwi",
    messagesWord: "imiyalezo",

    view: "Jonga",
    school: "Isikolo",
    score: "Amanqaku",
    sentOn: "Ithunyelwe ngo",
    language: "Ulwimi",

    diagnosis: "Isishwankathelo Sohlolo",
    domainScores: "Amanqaku eMihlaba",

    cognitive: "Ukucinga",
    motor: "Amandla",
    social: "Uluntu",
    emotion: "Imvakalelo",

    close: "Vala",

    profileName: "Igama Elipheleleyo",
    profileEmail: "I-imeyile",
    profileRole: "Indima",
    profileStaff: "Inombolo Yomsebenzi",
    profileStatus: "Imeko Yokuqinisekiswa",
    verified: "Kuqinisekisiwe",

    lang_en: "IsiNgesi",
    lang_af: "IsiBhulu",
    lang_xh: "IsiXhosa",
  },
};

const domainColors = {
  cognitive: "#009B8D",
  motor: "#6B2F8A",
  social: "#E8175D",
  emotion: "#F26522",
};

const NAV_ICONS = {
  home: (
    <svg viewBox="0 0 16 16" fill="none">
      <path
        d="M2 7l6-5 6 5v7a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),

  messages: (
    <svg viewBox="0 0 16 16" fill="none">
      <rect
        x="1.5"
        y="3"
        width="13"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 4l6 5 6-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  profile: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="5"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  screener: (
    <svg viewBox="0 0 16 16" fill="none">
      <rect
        x="1.5"
        y="1.5"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="8.5"
        y="1.5"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="1.5"
        y="8.5"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.5 8.5v6M8.5 11.5h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export default function TeacherHome({ user, profile }) {
  const [activePage, setActivePage] = useState("home");
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const t = T[lang];

  const langLabels = {
    en: "EN",
    af: "AF",
    xh: "XH",
  };

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "messages"),
      where("teacherEmail", "==", user.email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
        .sort(
          (a, b) =>
            (b.sentAt?.seconds || 0) -
            (a.sentAt?.seconds || 0)
        );

      setMessages(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.email]);

  const displayName =
    profile?.name ||
    user?.email?.split("@")[0] ||
    "Educator";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;

    return t.goodEvening;
  }, [t]);

  const flaggedCount = useMemo(
    () => new Set(messages.map((m) => m.childName)).size,
    [messages]
  );

  const thisMonthCount = useMemo(() => {
    const now = new Date();

    return messages.filter((m) => {
      const d = m.sentAt?.seconds
        ? new Date(m.sentAt.seconds * 1000)
        : null;

      return (
        d &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [messages]);

  const filtered = messages.filter((m) => {
    if (!search) return true;

    const s = search.toLowerCase();

    return (
      m.childName?.toLowerCase().includes(s) ||
      m.school?.toLowerCase().includes(s)
    );
  });

  const formatDate = (ts) =>
    ts?.seconds
      ? new Date(ts.seconds * 1000).toLocaleDateString()
      : "—";

  const navItems = [
  {
    id: "home",
    label: t.navHome,
    section: t.section1,
    icon: NAV_ICONS.home,
  },
  {
    id: "messages",
    label: t.navMessages,
    section: t.section2,
    icon: NAV_ICONS.messages,
  },
  {
    id: "screener",
    label: t.navScreener,
    section: t.section2,
    icon: NAV_ICONS.screener,
  },
  {
    id: "profile",
    label: t.navProfile,
    section: t.section3,
    icon: NAV_ICONS.profile,
  },
];

  // PuzzleBox Screener is its own multi-step flow.
  if (activePage === "screener") {
    return (
      <PuzzleBoxScreener
        user={user}
        profile={profile}
        onExit={() => setActivePage("home")}
      />
    );
  }

  return (
    <div
      className="dashboard-layout rh-shell"
      style={{
        "--rh-accent": "#F26522",
        "--rh-accent-soft": "#FFEFE3",
      }}
    >
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
              {activePage === "messages" && t.navMessages}
              {activePage === "profile" && t.navProfile}
            </div>

            <div className="page-sub">
              {activePage === "messages" && t.messagesSub}
              {activePage === "profile" && t.profileSub}
            </div>
          </div>

          <div className="topbar-right">
            <div className="lang-switcher">
              {Object.entries(langLabels).map(([code, label]) => (
                <button
                  key={code}
                  className={`lang-btn ${
                    lang === code ? "active" : ""
                  }`}
                  onClick={() => setLang(code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activePage === "home" && (
          <>
            <RoleHero
              tint="orange"
              eyebrow="The Puzzle Project · Educator"
              greeting={`${greeting}, ${
                displayName.split(" ")[0]
              }`}
              subtitle={t.homeSub}
            >
              <StatRing
                value={messages.length}
                max={10}
                color="#fff"
                label={t.statMessages}
              />

              <StatRing
                value={flaggedCount}
                max={10}
                color="#fff"
                label={t.statFlagged}
              />

              <StatRing
                value={thisMonthCount}
                max={10}
                color="#fff"
                label={t.statMonth}
              />
            </RoleHero>

            <div className="rh-home-grid">
              <div>
                <TodayList
                  title={t.recentMessages}
                  actionLabel={t.viewAll}
                  onAction={() => setActivePage("messages")}
                  emptyIcon=""
                  emptyTitle={t.noMessages}
                  emptySub={t.noMessagesSub}
                  onItemClick={(m) => setSelected(m)}
                  items={
                    loading
                      ? null
                      : messages.slice(0, 5).map((m) => ({
                          icon: "✉",
                          color: "#F26522",
                          title: m.childName,
                          meta: `${m.school} · ${t.sentOn} ${formatDate(
                            m.sentAt
                          )}`,
                        }))
                  }
                />

                <div className="rh-card">
                  <div className="rh-card-head">
                    <div className="rh-card-title">
                      {t.quickLinks}
                    </div>
                  </div>

                  <button
                    className="th-quicklink"
                    onClick={() => setActivePage("screener")}
                  >
                    <div className="th-quicklink-icon">
                      🧩
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.openScreener}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.openScreenerSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>
                  </button>

                  <button
                    className="th-quicklink"
                    onClick={() => setActivePage("messages")}
                    style={{ marginBottom: 0 }}
                  >
                    <div className="th-quicklink-icon">
                      ✉
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.navMessages}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.messagesSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div className="rh-profile-card">
                  <div
                    className="rh-profile-avatar"
                    style={{ background: "#F26522" }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="rh-profile-name">
                    {displayName}
                  </div>

                  <span
                    className="rh-profile-role"
                    style={{
                      background: "#F265221a",
                      color: "#F26522",
                    }}
                  >
                    {t.roleLabel}
                  </span>

                  <div className="rh-profile-verified">
                    ✓ Verified account
                  </div>

                  <div className="rh-chip-grid">
                    <div className="rh-chip">
                      <div className="rh-chip-value">
                        {messages.length}
                      </div>

                      <div className="rh-chip-label">
                        {t.statMessages}
                      </div>
                    </div>

                    <div className="rh-chip">
                      <div className="rh-chip-value">
                        {flaggedCount}
                      </div>

                      <div className="rh-chip-label">
                        {t.statFlagged}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activePage === "messages" && (
          <>
            <div className="search-bar">
              <input
                className="search-input"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-faint)",
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                {filtered.length} {t.of} {messages.length}{" "}
                {t.messagesWord}
              </span>
            </div>

            <div
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
              }}
            >
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    📭
                  </div>

                  <div className="empty-state-title">
                    {t.noMessages}
                  </div>

                  <div className="empty-state-sub">
                    {t.noMessagesSub}
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          {t.recentMessages.replace(
                            "Recent ",
                            ""
                          )}
                        </th>

                        <th>{t.school}</th>
                        <th>{t.score}</th>
                        <th>{t.sentOn}</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 700 }}>
                            {m.childName}
                          </td>

                          <td>{m.school}</td>

                          <td>
                            <strong>
                              {m.childScore}%
                            </strong>
                          </td>

                          <td
                            style={{
                              color: "var(--ink-faint)",
                              fontSize: 12,
                            }}
                          >
                            {formatDate(m.sentAt)}
                          </td>

                          <td>
                            <button
                              className="btn btn-teal btn-sm"
                              onClick={() => setSelected(m)}
                            >
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
          </>
        )}

        {activePage === "profile" && (
          <div
            className="card"
            style={{ maxWidth: 520 }}
          >
            <div
              className="report-section"
              style={{ marginBottom: 0 }}
            >
              <div className="report-row">
                <span className="report-row-label">
                  {t.profileName}
                </span>

                <span className="report-row-value">
                  {displayName}
                </span>
              </div>

              <div className="report-row">
                <span className="report-row-label">
                  {t.profileEmail}
                </span>

                <span className="report-row-value">
                  {user?.email}
                </span>
              </div>

              <div className="report-row">
                <span className="report-row-label">
                  {t.profileRole}
                </span>

                <span className="report-row-value">
                  {t.roleLabel}
                </span>
              </div>

              {profile?.staffNumber && (
                <div className="report-row">
                  <span className="report-row-label">
                    {t.profileStaff}
                  </span>

                  <span className="report-row-value">
                    {profile.staffNumber}
                  </span>
                </div>
              )}

              <div className="report-row">
                <span className="report-row-label">
                  {t.profileStatus}
                </span>

                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--teal)",
                  }}
                >
                  ✓ {t.verified}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MESSAGE DETAIL MODAL */}
      {selected && (
        <div
          className="modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                {selected.childName}
              </div>

              <button
                className="modal-close"
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: "12px 16px",
                background: "var(--teal-lt)",
                borderRadius: 12,
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "var(--teal)",
                  }}
                >
                  {selected.school}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-mid)",
                  }}
                >
                  {t.sentOn}{" "}
                  {formatDate(selected.sentAt)}
                </div>
              </div>

              <span className="pill pill-pink">
                {selected.childScore}%
              </span>
            </div>

            {selected.domains && (
              <div style={{ marginBottom: 20 }}>
                {[
                  "cognitive",
                  "motor",
                  "social",
                  "emotion",
                ].map((k) => (
                  <div
                    className="domain-bar"
                    key={k}
                  >
                    <div className="domain-bar-header">
                      <span>{t[k]}</span>

                      <span>
                        {selected.domains[k] || 0}%
                      </span>
                    </div>

                    <div className="domain-bar-track">
                      <div
                        className="domain-bar-fill"
                        style={{
                          width: `${
                            selected.domains[k] || 0
                          }%`,
                          background:
                            domainColors[k],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="report-section">
              <div className="report-section-title">
                {t.diagnosis}
              </div>

              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "var(--ink-mid)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selected.diagnosis}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-ghost"
                onClick={() => setSelected(null)}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}