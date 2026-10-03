// AdminHome.js — the home screen an Administrator lands on after a
// verified login. Allows administrators to approve pending accounts,
// manage users, and view a system-wide overview.
// I have removed the "full analytics for now" section, since we don't have any analytics yet. This will be added back in later.

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { mapUserRow, mapChildRow } from "../lib/mappers";
import RoleSidebar from "./RoleSidebar";
import RoleHero from "./RoleHero";
import StatRing from "./StatRing";
import ChildrenTable from "./ChildrenTable";
import FlagsAlerts from "./FlagsAlerts";
import SummaryReport from "./SummaryReport";
import "./TeacherHome.css";
import "./AdminHome.css";
import "./RoleHomeKit.css";

// Roles an admin can hand out. "admin" is deliberately left out of the
// reassignment dropdown — promoting/demoting other admins from this list
// is easy to fat-finger, so that stays a database-level action for now.
const ASSIGNABLE_ROLES = ["educator", "psychologist", "analyst"];

const T = {
  en: {
    roleLabel: "Administrator",

    navHome: "My Home",
    navUsers: "User Management",
    navChildren: "All Children",
    navFlags: "Flags & Alerts",
    navReports: "Reports",
    navProfile: "My Profile",

    section1: "Overview",
    section2: "System",
    section3: "Account",

    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",

    heroSub: "System-wide overview for the PuzzleBox pilot.",
    usersSub: "Approve new accounts and manage roles across the platform.",
    childrenSub: "Every child registered across every teacher and school, not just one class.",
    flagsSub: "Flags and open follow-ups across the whole program.",
    reportsSub: "Export summary reports across the whole program.",
    profileSub: "Your account details and verification status.",

    statUsers: "Total Users",
    statPending: "Pending Approval",
    statChildren: "Children Registered",
    statScreened: "Screened This Period",
    statFlagged: "Open Flags",

    total: "total",
    needsAction: "needs action",
    allTime: "all time",
    thisMonth: "this month",
    unresolved: "unresolved",

    pendingApprovals: "Pending Approvals",
    noPending: "All caught up",
    noPendingSub: "No accounts are waiting on verification right now.",

    approve: "Approve",
    reject: "Reject",

    rejectConfirm:
      "Remove this registration request? They'll need to register again.",

    allUsers: "All Accounts",
    search: "Search by name or email...",
    of: "of",
    usersWord: "accounts",

    name: "Name",
    email: "Email",
    role: "Role",
    staffNumber: "Staff Number",
    status: "Status",

    verified: "Verified",
    pending: "Pending",
    actions: "Actions",
    revoke: "Revoke",

    quickLinks: "Quick Links",

    manageUsers: "Manage User Accounts",
    manageUsersSub: "Approve staff, assign roles, review access.",
    viewChildren: "View All Children",
    viewChildrenSub: "Search and filter every registered child.",
    viewFlags: "View Flags & Alerts",
    viewFlagsSub: "See who needs a follow-up right now.",

    role_educator: "Educator",
    role_psychologist: "Psychologist",
    role_analyst: "Data Analyst",
    role_admin: "Administrator",
    filterAllRoles: "All Roles",

    deactivate: "Deactivate",
    reactivate: "Reactivate",
    active: "Active",
    inactive: "Deactivated",

    addAccountNote:
      "New Teacher and Psychologist accounts are created when staff register themselves — approve them below, then use the role dropdown to assign or correct their role. Ask your engineering team to wire up admin-created accounts if you'd like to skip self-registration entirely.",

    profileName: "Full Name",
    profileEmail: "Email Address",
    profileRole: "Role",
    profileStaff: "Staff Number",
    profileStatus: "Verification Status",

    close: "Close",
  },

  af: {
    roleLabel: "Administrateur",

    navHome: "My Tuisblad",
    navUsers: "Gebruikerbestuur",
    navChildren: "Alle Kinders",
    navFlags: "Vlae & Waarskuwings",
    navReports: "Verslae",
    navProfile: "My Profiel",

    section1: "Oorsig",
    section2: "Stelsel",
    section3: "Rekening",

    goodMorning: "Goeie môre",
    goodAfternoon: "Goeie middag",
    goodEvening: "Goeie naand",

    heroSub: "Stelselwye oorsig vir die PuzzleBox loodsprojek.",
    usersSub:
      "Keur nuwe rekeninge goed en bestuur rolle regoor die platform.",
    childrenSub: "Elke kind wat geregistreer is, regoor alle onderwysers en skole.",
    flagsSub: "Vlae en oop opvolgings regoor die hele program.",
    reportsSub: "Voer opsommingsverslae regoor die hele program uit.",
    profileSub: "Jou rekeningbesonderhede en verifikasiestatus.",

    statUsers: "Totale Gebruikers",
    statPending: "Wag op Goedkeuring",
    statChildren: "Kinders Geregistreer",
    statScreened: "Gesif Vanjaar Maand",
    statFlagged: "Oop Vlae",

    total: "totaal",
    needsAction: "aksie nodig",
    allTime: "nog altyd",
    thisMonth: "hierdie maand",
    unresolved: "onopgelos",

    pendingApprovals: "Hangende Goedkeurings",
    noPending: "Alles op datum",
    noPendingSub: "Geen rekeninge wag tans op verifikasie nie.",

    approve: "Keur Goed",
    reject: "Verwerp",

    rejectConfirm:
      "Verwyder hierdie registrasie-versoek? Hulle sal weer moet registreer.",

    allUsers: "Alle Rekeninge",
    search: "Soek volgens naam of e-pos...",
    of: "van",
    usersWord: "rekeninge",

    name: "Naam",
    email: "E-pos",
    role: "Rol",
    staffNumber: "Personeelnommer",
    status: "Status",

    verified: "Geverifieer",
    pending: "Hangend",
    actions: "Aksies",
    revoke: "Herroep",

    quickLinks: "Vinnige Skakels",

    manageUsers: "Bestuur Gebruikerrekeninge",
    manageUsersSub: "Keur personeel goed, wys rolle toe.",
    viewChildren: "Bekyk Alle Kinders",
    viewChildrenSub: "Soek en filtreer elke geregistreerde kind.",
    viewFlags: "Bekyk Vlae & Waarskuwings",
    viewFlagsSub: "Sien wie nou opvolging benodig.",

    role_educator: "Opvoeder",
    role_psychologist: "Sielkundige",
    role_analyst: "Data-ontleder",
    role_admin: "Administrateur",
    filterAllRoles: "Alle Rolle",

    deactivate: "Deaktiveer",
    reactivate: "Heraktiveer",
    active: "Aktief",
    inactive: "Gedeaktiveer",

    addAccountNote:
      "Nuwe Opvoeder- en Sielkundige-rekeninge word geskep wanneer personeel self registreer — keur hulle hieronder goed en gebruik dan die rol-afrolkieslys om hul rol toe te wys of reg te stel.",

    profileName: "Volle Naam",
    profileEmail: "E-pos",
    profileRole: "Rol",
    profileStaff: "Personeelnommer",
    profileStatus: "Verifikasiestatus",

    close: "Maak Toe",
  },

  xh: {
    roleLabel: "Umlawuli",

    navHome: "Ikhaya Lam",
    navUsers: "Ulawulo Lwabasebenzisi",
    navChildren: "Bonke Abantwana",
    navFlags: "Izikhombisi",
    navReports: "Iingxelo",
    navProfile: "Iprofayile Yam",

    section1: "Uhlolo",
    section2: "Inkqubo",
    section3: "Iakhawunti",

    goodMorning: "Molo",
    goodAfternoon: "Molo Emini",
    goodEvening: "Molo Ngokuhlwa",

    heroSub: "Uhlolo lwenkqubo iphela lwePuzzleBox.",
    usersSub:
      "Vumela iiakhawunti ezintsha kwaye ulawule iindima kwiplatform.",
    childrenSub: "Wonke umntwana obhalisiweyo kubo bonke ootitshala nezikolo.",
    flagsSub: "Izikhombisi nokulandelwa okuvulekileyo kwinkqubo iphela.",
    reportsSub: "Khuphela iingxelo ezishwankathelweyo kwinkqubo iphela.",
    profileSub:
      "Iinkcukacha zeakhawunti yakho nemeko yokuqinisekiswa.",

    statUsers: "Bonke Abasebenzisi",
    statPending: "Kulindele Ukuvunywa",
    statChildren: "Abantwana Ababhalisiweyo",
    statScreened: "Abahloliweyo Kule Nyanga",
    statFlagged: "Izikhombisi Ezivulekileyo",

    total: "iyonke",
    needsAction: "kufuna isenzo",
    allTime: "sonke isihlandlo",
    thisMonth: "le nyanga",
    unresolved: "engasombululwanga",

    pendingApprovals: "Ezilindele Ukuvunywa",
    noPending: "Konke kulungile",
    noPendingSub:
      "Akukho akhawunti ilindele ukuqinisekiswa ngoku.",

    approve: "Vuma",
    reject: "Ala",

    rejectConfirm:
      "Susa esi sicelo sokubhalisa? Kuya kufuneka baphinde babhalise.",

    allUsers: "Zonke Iiakhawunti",
    search: "Khangela ngegama okanye i-imeyile...",
    of: "kwi",
    usersWord: "iiakhawunti",

    name: "Igama",
    email: "I-imeyile",
    role: "Indima",
    staffNumber: "Inombolo Yomsebenzi",
    status: "Imeko",

    verified: "Kuqinisekisiwe",
    pending: "Kulindile",
    actions: "Izenzo",
    revoke: "Rhoxisa",

    quickLinks: "Amakhonkco Akhawulezayo",

    manageUsers: "Lawula Iiakhawunti Zabasebenzisi",
    manageUsersSub:
      "Vumela abasebenzi, wabele iindima.",
    viewChildren: "Jonga Bonke Abantwana",
    viewChildrenSub: "Khangela kwaye uhlungе wonke umntwana obhalisiweyo.",
    viewFlags: "Jonga Izikhombisi",
    viewFlagsSub: "Bona ukuba ngubani ofuna ukulandelwa ngoku.",

    role_educator: "Umfundisi",
    role_psychologist: "Isazi Sengqondo",
    role_analyst: "Umhluzi Wedatha",
    role_admin: "Umlawuli",
    filterAllRoles: "Zonke Iindima",

    deactivate: "Cima",
    reactivate: "Vula Kwakhona",
    active: "Iyasebenza",
    inactive: "Icinyiwe",

    addAccountNote:
      "Iiakhawunti ezintsha zoMfundisi neSazi Sengqondo zenziwa xa abasebenzi bezibhalisa — bavumele ngezantsi, uze usebenzise imenyu yendima ukuwabela indima.",

    profileName: "Igama Elipheleleyo",
    profileEmail: "I-imeyile",
    profileRole: "Indima",
    profileStaff: "Inombolo Yomsebenzi",
    profileStatus: "Imeko Yokuqinisekiswa",

    close: "Vala",
  },
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

  users: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle
        cx="6"
        cy="5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.5 14c0-2.76 2.015-4.5 4.5-4.5s4.5 1.74 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="5.5"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10.8 9.8c1.9.3 3.2 1.8 3.2 4.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  children: (
    <svg viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 6h13" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9.5h4M4 11.5h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  flags: (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M3 1.5v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 2.5h8.5l-2 2.75 2 2.75H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),

  reports: (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M4 1.5h6l3 3v10a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 8.5h5M5.5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
};

const ROLE_COLORS = {
  educator: "#F26522",
  psychologist: "#E8175D",
  analyst: "#009B8D",
  admin: "#6B2F8A",
};

export default function AdminHome({ user, profile }) {
  const [activePage, setActivePage] = useState("home");
  const [lang, setLang] = useState("en");
  const [users, setUsers] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);

  const t = T[lang];

  const langLabels = {
    en: "EN",
    af: "AF",
    xh: "XH",
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*");

      if (error) {
        console.error("Error loading users:", error);
        return;
      }

      if (isMounted) {
        setUsers(data.map(mapUserRow));
        setLoading(false);
      }
    };

    const loadChildren = async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*");

      if (error) {
        console.error("Error loading children:", error);
        return;
      }

      if (isMounted) {
        setChildren(data.map(mapChildRow));
      }
    };

    loadUsers();
    loadChildren();

    const usersChannel = supabase
      .channel("admin-users-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        () => loadUsers()
      )
      .subscribe();

    const childrenChannel = supabase
      .channel("admin-children-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "children",
        },
        () => loadChildren()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(childrenChannel);
    };
  }, []);

  const displayName =
    profile?.name ||
    user?.email?.split("@")[0] ||
    "Administrator";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;

    return t.goodEvening;
  }, [t]);

  const pendingUsers = useMemo(
    () => users.filter((u) => !u.isVerified),
    [users]
  );

  // "Open" mirrors the definition FlagsAlerts already uses: flagged and
  // not yet resolved. This is what the sidebar badge and the overview
  // stat ring both count.
  const openFlaggedChildren = useMemo(
    () => children.filter((c) => c.flagged && !c.resolved),
    [children]
  );

  // Screenings completed this period = assessment date falls within the
  // current calendar month. Falls back to 0 rather than throwing on a
  // missing/malformed date.
  const screenedThisPeriod = useMemo(() => {
    const now = new Date();
    return children.filter((c) => {
      if (!c.date) return false;
      const d = new Date(c.date);
      if (Number.isNaN(d.getTime())) return false;
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }).length;
  }, [children]);

  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;

    if (!search) return true;

    const s = search.toLowerCase();

    return (
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s)
    );
  });

  const handleApprove = async (uid) => {
    const { error } = await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("id", uid);

    if (error) {
      console.error("Error approving user:", error);
      return;
    }

    // Let them know — an in-app message (they'll see it the moment their
    // PendingApproval screen's realtime listener picks up is_verified, or
    // next time they open the app) plus a best-effort push notification if
    // they opted in. Neither should block the approval itself if it fails.
    const approvedUser = users.find((u) => u.id === uid);
    if (approvedUser) {
      supabase
        .from("messages")
        .insert({
          recipient_email: approvedUser.email,
          recipient_role: approvedUser.role,
          recipient_name: approvedUser.name,
          message_type: "account_approved",
          sent_by: "Admin",
          diagnosis: `Your PuzzleBox account has been approved. You can sign in now as ${roleLabel(approvedUser.role)}.`,
        })
        .then(({ error: msgErr }) => {
          if (msgErr) console.error("Could not send approval message:", msgErr.message);
        });

      supabase.functions
        .invoke("send-push", {
          body: {
            userId: uid,
            title: "You're approved! 🎉",
            body: "Your PuzzleBox account is ready — you can sign in now.",
          },
        })
        .catch((err) => console.error("Could not send push notification:", err.message));
    }
  };

  const handleRevoke = async (uid) => {
    const { error } = await supabase
      .from("users")
      .update({ is_verified: false })
      .eq("id", uid);

    if (error) {
      console.error("Error revoking user:", error);
    }
  };

  const handleRoleChange = async (uid, newRole) => {
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", uid);

    if (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleReject = async (uid) => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", uid);

    if (error) {
      console.error("Error rejecting user:", error);
      return;
    }

    setRejectTarget(null);
  };

  const roleLabel = (role) =>
    t[`role_${role}`] || role || "—";

  const navItems = [
    {
      id: "home",
      label: t.navHome,
      section: t.section1,
      icon: NAV_ICONS.home,
    },
    {
      id: "users",
      label: t.navUsers,
      section: t.section2,
      icon: NAV_ICONS.users,
    },
    {
      id: "children",
      label: t.navChildren,
      section: t.section2,
      icon: NAV_ICONS.children,
    },
    {
      id: "flags",
      label: t.navFlags,
      section: t.section2,
      icon: NAV_ICONS.flags,
    },
    {
      id: "reports",
      label: t.navReports,
      section: t.section2,
      icon: NAV_ICONS.reports,
    },
    {
      id: "profile",
      label: t.navProfile,
      section: t.section3,
      icon: NAV_ICONS.profile,
    },
  ];

  return (
    <div
      className="dashboard-layout rh-shell"
      style={{
        "--rh-accent": "#6B2F8A",
        "--rh-accent-soft": "#F3E9FA",
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
              {activePage === "users" && t.navUsers}
              {activePage === "children" && t.navChildren}
              {activePage === "flags" && t.navFlags}
              {activePage === "reports" && t.navReports}
              {activePage === "profile" && t.navProfile}
            </div>

            <div className="page-sub">
              {activePage === "users" && t.usersSub}
              {activePage === "children" && t.childrenSub}
              {activePage === "flags" && t.flagsSub}
              {activePage === "reports" && t.reportsSub}
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
              tint="purple"
              eyebrow="The Puzzle Project · Admin Console"
              greeting={`${greeting}, ${displayName.split(" ")[0]}`}
              subtitle={t.heroSub}
            >
              <StatRing
                value={users.length}
                max={10}
                color="#fff"
                label={t.statUsers}
              />

              <StatRing
                value={pendingUsers.length}
                max={10}
                color="#fff"
                label={t.statPending}
              />

              <StatRing
                value={children.length}
                max={30}
                color="#fff"
                label={t.statChildren}
              />

              <StatRing
                value={screenedThisPeriod}
                max={30}
                color="#fff"
                label={t.statScreened}
              />

              <StatRing
                value={openFlaggedChildren.length}
                max={10}
                color="#fff"
                label={t.statFlagged}
              />
            </RoleHero>

            <div className="rh-home-grid">
              <div>
                <div className="rh-card">
                  <div className="rh-card-head">
                    <div className="rh-card-title">
                      {t.pendingApprovals}
                    </div>

                    {pendingUsers.length > 0 && (
                      <span
                        className="rh-list-badge"
                        style={{
                          background: "#F265221a",
                          color: "#F26522",
                        }}
                      >
                        {pendingUsers.length}
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="rh-empty">
                      <div className="rh-empty-title">…</div>
                    </div>
                  ) : pendingUsers.length === 0 ? (
                    <div className="rh-empty">
                      <div className="rh-empty-icon">
                        ✅
                      </div>

                      <div className="rh-empty-title">
                        {t.noPending}
                      </div>

                      <div className="rh-empty-sub">
                        {t.noPendingSub}
                      </div>
                    </div>
                  ) : (
                    <div className="rh-list">
                      {pendingUsers.map((u) => (
                        <div
                          className="rh-list-row"
                          key={u.id}
                        >
                          <div
                            className="rh-list-icon"
                            style={{
                              background: `${
                                ROLE_COLORS[u.role] ||
                                "#8888a8"
                              }1f`,
                              color:
                                ROLE_COLORS[u.role] ||
                                "#8888a8",
                            }}
                          >
                            {(
                              u.name ||
                              u.email ||
                              "?"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="rh-list-text">
                            <div className="rh-list-title">
                              {u.name || u.email}
                            </div>

                            <div className="rh-list-meta">
                              {roleLabel(u.role)} ·{" "}
                              {u.staffNumber || "—"}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexShrink: 0,
                            }}
                          >
                            <button
                              className="rh-list-btn"
                              style={{
                                background:
                                  "var(--teal, #009B8D)",
                              }}
                              onClick={() =>
                                handleApprove(u.id)
                              }
                            >
                              {t.approve}
                            </button>

                            <button
                              className="rh-list-btn"
                              style={{
                                background:
                                  "var(--pink, #E8175D)",
                              }}
                              onClick={() =>
                                setRejectTarget(u)
                              }
                            >
                              {t.reject}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="rh-profile-card">
                  <div
                    className="rh-profile-avatar"
                    style={{
                      background: "#6B2F8A",
                    }}
                  >
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="rh-profile-name">
                    {displayName}
                  </div>

                  <span
                    className="rh-profile-role"
                    style={{
                      background: "#6B2F8A1a",
                      color: "#6B2F8A",
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
                        {users.length}
                      </div>

                      <div className="rh-chip-label">
                        {t.statUsers}
                      </div>
                    </div>

                    <div className="rh-chip">
                      <div className="rh-chip-value">
                        {pendingUsers.length}
                      </div>

                      <div className="rh-chip-label">
                        {t.statPending}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rh-card">
                  <div className="rh-card-head">
                    <div className="rh-card-title">
                      {t.quickLinks}
                    </div>
                  </div>

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setActivePage("users")
                    }
                  >
                    <div className="th-quicklink-icon">
                      🛡
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.manageUsers}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.manageUsersSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>
                  </button>

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setActivePage("children")
                    }
                  >
                    <div className="th-quicklink-icon">
                      👧
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.viewChildren}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.viewChildrenSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>
                  </button>

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setActivePage("flags")
                    }
                    style={{ marginBottom: 0 }}
                  >
                    <div className="th-quicklink-icon">
                      🚩
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.viewFlags}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.viewFlagsSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activePage === "users" && (
          <>
            <div
              className="card"
              style={{
                marginBottom: 16,
                fontSize: 12.5,
                lineHeight: 1.6,
                color: "var(--ink-mid)",
              }}
            >
              {t.addAccountNote}
            </div>

            <div className="search-bar">
              <input
                className="search-input"
                placeholder={t.search}
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <select
                className="search-input"
                style={{ maxWidth: 180, flex: "0 0 auto" }}
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
              >
                <option value="">
                  {t.filterAllRoles}
                </option>
                {ASSIGNABLE_ROLES.concat("admin").map(
                  (r) => (
                    <option key={r} value={r}>
                      {roleLabel(r)}
                    </option>
                  )
                )}
              </select>

              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-faint)",
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                {filteredUsers.length} {t.of}{" "}
                {users.length} {t.usersWord}
              </span>
            </div>

            <div
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.name}</th>
                      <th>{t.role}</th>
                      <th>{t.staffNumber}</th>
                      <th>{t.status}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {u.name || "—"}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--ink-faint)",
                            }}
                          >
                            {u.email}
                          </div>
                        </td>

                        <td>
                          {u.role === "admin" ? (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                                background: `${ROLE_COLORS.admin}1a`,
                                color: ROLE_COLORS.admin,
                              }}
                            >
                              {roleLabel(u.role)}
                            </span>
                          ) : (
                            <select
                              value={u.role || ""}
                              onChange={(e) =>
                                handleRoleChange(
                                  u.id,
                                  e.target.value
                                )
                              }
                              style={{
                                border: `1.5px solid ${
                                  ROLE_COLORS[u.role] ||
                                  "#8888a8"
                                }55`,
                                borderRadius: 20,
                                padding: "3px 8px",
                                fontSize: 11,
                                fontWeight: 700,
                                color:
                                  ROLE_COLORS[u.role] ||
                                  "#8888a8",
                                background: `${
                                  ROLE_COLORS[u.role] ||
                                  "#8888a8"
                                }1a`,
                              }}
                            >
                              {ASSIGNABLE_ROLES.map(
                                (r) => (
                                  <option
                                    key={r}
                                    value={r}
                                  >
                                    {roleLabel(r)}
                                  </option>
                                )
                              )}
                            </select>
                          )}
                        </td>

                        <td
                          style={{
                            fontSize: 12,
                            color: "var(--ink-mid)",
                          }}
                        >
                          {u.staffNumber || "—"}
                        </td>

                        <td>
                          {u.isVerified ? (
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: "var(--teal)",
                              }}
                            >
                              ✓ {t.verified}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: "var(--orange)",
                              }}
                            >
                              ● {t.pending}
                            </span>
                          )}
                        </td>

                        <td>
                          {u.isVerified ? (
                            <button
                              className="btn btn-sm"
                              style={{
                                background:
                                  "var(--pink-lt)",
                                color: "var(--pink)",
                                border: "none",
                              }}
                              onClick={() =>
                                handleRevoke(u.id)
                              }
                            >
                              {t.deactivate}
                            </button>
                          ) : (
                            <button
                              className="btn btn-teal btn-sm"
                              onClick={() =>
                                handleApprove(u.id)
                              }
                            >
                              {t.approve}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activePage === "children" && (
          <ChildrenTable children={children} lang={lang} />
        )}

        {activePage === "flags" && (
          <FlagsAlerts children={children} lang={lang} />
        )}

        {activePage === "reports" && (
          <SummaryReport children={children} lang={lang} />
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

      {/* REJECT CONFIRM MODAL */}
      {rejectTarget && (
        <div
          className="modal-overlay"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">
                {rejectTarget.name ||
                  rejectTarget.email}
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setRejectTarget(null)
                }
              >
                ✕
              </button>
            </div>

            <p
              style={{
                fontSize: 13.5,
                color: "var(--ink-mid)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              {t.rejectConfirm}
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-ghost"
                onClick={() =>
                  setRejectTarget(null)
                }
              >
                {t.close}
              </button>

              <button
                className="btn btn-sm"
                style={{
                  background: "var(--pink)",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                }}
                onClick={() =>
                  handleReject(rejectTarget.id)
                }
              >
                {t.reject}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}