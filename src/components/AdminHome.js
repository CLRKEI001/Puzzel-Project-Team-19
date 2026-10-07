// AdminHome.js — the home screen an Administrator lands on after a
// verified login. Allows administrators to approve pending accounts,
// manage users, and view a system-wide overview.
// I have removed the "full analytics for now" section, since we don't have any analytics yet. This will be added back in later.
// Flags & Alerts has also been removed from this screen.

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { mapUserRow, mapChildRow, mapPurchaseRequestRow, mapTrainingCertificateRow } from "../lib/mappers";
import RoleSidebar from "./RoleSidebar";
import RoleHero from "./RoleHero";
import StatRing from "./StatRing";
import ChildrenTable from "./ChildrenTable";
import { resolveManualConsentReview } from "../lib/consentForms";
import SummaryReport from "./SummaryReport";
import TrainingModulesAdmin from "./TrainingModulesAdmin";
import ScreenerContentAdmin from "./ScreenerContentAdmin";
import "./TeacherHome.css";
import "./AdminHome.css";
import "./RoleHomeKit.css";

// Roles an admin can hand out. "admin" is deliberately left out of the
// reassignment dropdown — promoting/demoting other admins from this list
// is easy to fat-finger, so that stays a database-level action for now.
const ASSIGNABLE_ROLES = ["educator", "psychologist", "admin"];

const T = {
  en: {
    roleLabel: "Administrator",

    navHome: "My Home",
    navUsers: "User Management",
    navChildren: "All Children",
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
    reportsSub: "Export summary reports across the whole program.",
    profileSub: "Your account details and verification status.",

    statUsers: "Total Users",
    statPending: "Pending Approval",
    statChildren: "Children Registered",
    statScreened: "Screened This Period",

    total: "total",
    needsAction: "needs action",
    allTime: "all time",
    thisMonth: "this month",

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
    reportsSub: "Voer opsommingsverslae regoor die hele program uit.",
    profileSub: "Jou rekeningbesonderhede en verifikasiestatus.",

    statUsers: "Totale Gebruikers",
    statPending: "Wag op Goedkeuring",
    statChildren: "Kinders Geregistreer",
    statScreened: "Gesif Vanjaar Maand",

    total: "totaal",
    needsAction: "aksie nodig",
    allTime: "nog altyd",
    thisMonth: "hierdie maand",

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
    reportsSub: "Khuphela iingxelo ezishwankathelweyo kwinkqubo iphela.",
    profileSub:
      "Iinkcukacha zeakhawunti yakho nemeko yokuqinisekiswa.",

    statUsers: "Bonke Abasebenzisi",
    statPending: "Kulindele Ukuvunywa",
    statChildren: "Abantwana Ababhalisiweyo",
    statScreened: "Abahloliweyo Kule Nyanga",

    total: "iyonke",
    needsAction: "kufuna isenzo",
    allTime: "sonke isihlandlo",
    thisMonth: "le nyanga",

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

  training: (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M1.5 5.5L8 2.5l6.5 3L8 8.5l-6.5-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M4 7.2V10c0 1 1.8 2 4 2s4-1 4-2V7.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),

  screenerContent: (
    <svg viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="8.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 8.5v6M8.5 11.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  purchases: (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M2 4.5l1-2.5h10l1 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 4.5h12v8.5a1 1 0 01-1 1H3a1 1 0 01-1-1V4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 7a2.5 2.5 0 005 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

// A readable default Product number so the admin isn't stuck typing one from
// scratch — they can still overwrite it with whatever numbering scheme the
// physical screener kits actually use.
function generateProductNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easy to read off a sticker
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `PB-${seg(4)}-${seg(4)}`;
}

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

  // Purchase requests ("Buy The Puzzle Box Screener" form submissions)
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [reviewRequest, setReviewRequest] = useState(null);   // request currently open in the modal
  const [prNumber, setPrNumber] = useState("");
  const [prNotes, setPrNotes] = useState("");
  const [prSaving, setPrSaving] = useState(false);
  const [prError, setPrError] = useState("");

  // Training certifications — results surfaced from useTrainingProgress /
  // training_certificates (migrations 015 & 018). A trainee's completion
  // lands here as "pending"; nothing is visible to them until an admin
  // reviews it and approves.
  const [trainingCertificates, setTrainingCertificates] = useState([]);
  const [reviewCertificate, setReviewCertificate] = useState(null); // certificate row open in the modal
  const [certModuleBreakdown, setCertModuleBreakdown] = useState(null); // per-module quiz results for that trainee
  const [certBreakdownLoading, setCertBreakdownLoading] = useState(false);
  const [certSaving, setCertSaving] = useState(false);
  const [certError, setCertError] = useState("");

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

    const loadPurchaseRequests = async () => {
      const { data, error } = await supabase
        .from("purchase_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading purchase requests:", error);
        return;
      }

      if (isMounted) setPurchaseRequests(data.map(mapPurchaseRequestRow));
    };

    const loadTrainingCertificates = async () => {
      const { data, error } = await supabase
        .from("training_certificates")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) {
        console.error("Error loading training certificates:", error);
        return;
      }

      if (isMounted) setTrainingCertificates(data.map(mapTrainingCertificateRow));
    };

    loadUsers();
    loadChildren();
    loadPurchaseRequests();
    loadTrainingCertificates();

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

    const purchaseRequestsChannel = supabase
      .channel("admin-purchase-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "purchase_requests",
        },
        () => loadPurchaseRequests()
      )
      .subscribe();

    const trainingCertificatesChannel = supabase
      .channel("admin-training-certificates-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_certificates",
        },
        () => loadTrainingCertificates()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(childrenChannel);
      supabase.removeChannel(purchaseRequestsChannel);
      supabase.removeChannel(trainingCertificatesChannel);
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

  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewBusy, setReviewBusy] = useState("");
  const [reviewError, setReviewError] = useState("");

  const pendingConsentReviews = useMemo(
    () => children.filter((c) => c.consentReviewStatus === "pending"),
    [children]
  );

  const handleConsentReview = async (child, approve) => {
    setReviewBusy(child.id);
    setReviewError("");
    try {
      const patch = await resolveManualConsentReview({
        childId: child.id,
        approve,
        reviewer: user?.email,
        note: (reviewNotes[child.id] || "").trim(),
      });
      setChildren((prev) => prev.map((c) => c.id === child.id ? {
        ...c,
        consentVerified: patch.consent_verified,
        consentReviewStatus: patch.consent_review_status,
        consentVerificationNotes: patch.consent_verification_notes,
      } : c));
    } catch (e) {
      setReviewError("Couldn't save the decision — " + e.message);
    }
    setReviewBusy("");
  };

  const pendingPurchaseRequests = useMemo(
    () => purchaseRequests.filter((r) => r.status === "pending" || !r.status),
    [purchaseRequests]
  );

  const pendingTrainingCertificates = useMemo(
    () => trainingCertificates.filter((c) => c.status === "pending" || !c.status),
    [trainingCertificates]
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

  const openRequest = (req) => {
    setReviewRequest(req);
    setPrNumber(req.productNumber || generateProductNumber());
    setPrNotes(req.adminNotes || "");
    setPrError("");
  };

  const closeRequest = () => {
    setReviewRequest(null);
    setPrNumber("");
    setPrNotes("");
    setPrError("");
  };

  // Fulfilling a request issues the Product number: it's written to
  // screener_products (the table redeem_product_number() checks against —
  // see migration 003), so it works the moment the buyer types it in after
  // logging in. It also shows up automatically on their own Buy page (the
  // PurchaseContent component matches purchase_requests by the buyer's
  // email) — no email step needed, nothing to send from here.
  const handleFulfil = async () => {
    if (!reviewRequest) return;
    const number = prNumber.trim().toUpperCase();
    if (!number) {
      setPrError("Enter a Product number before marking this fulfilled.");
      return;
    }

    setPrSaving(true);
    setPrError("");

    const productRow = {
      product_number: number,
      notes: `Issued to ${reviewRequest.organisation || reviewRequest.name} — purchase request from ${reviewRequest.email}`,
      active: true,
    };

    // Deliberately NOT using .upsert()/onConflict here. screener_products has
    // no SELECT policy on purpose (migration 003 — numbers can't be listed
    // from the browser, only checked one at a time via redeem_product_number).
    // Postgres' INSERT ... ON CONFLICT DO UPDATE needs a SELECT policy under
    // RLS to resolve the conflict check, even for a number that doesn't
    // already exist — without one it always throws "new row violates
    // row-level security policy", which is what was happening here. A plain
    // INSERT, falling back to a plain UPDATE on an actual duplicate, needs
    // only the INSERT/UPDATE policies we already have and sidesteps that
    // Postgres/RLS interaction entirely.
    const { error: insertErr } = await supabase.from("screener_products").insert(productRow);
    let productErr = insertErr;

    if (insertErr && insertErr.code === "23505") {
      // Number already exists (e.g. re-fulfilling, or a rare random clash) — update it instead.
      const { error: updateProductErr } = await supabase
        .from("screener_products")
        .update(productRow)
        .eq("product_number", number);
      productErr = updateProductErr;
    }

    if (productErr) {
      console.error("Error creating screener product:", productErr.message);
      setPrError(`Couldn't save that Product number: ${productErr.message}`);
      setPrSaving(false);
      return;
    }

    const { error: updateErr } = await supabase
      .from("purchase_requests")
      .update({
        status: "fulfilled",
        product_number: number,
        admin_notes: prNotes.trim() || null,
        fulfilled_by: user?.email || null,
        fulfilled_at: new Date().toISOString(),
      })
      .eq("id", reviewRequest.id);

    setPrSaving(false);

    if (updateErr) {
      console.error("Error marking purchase request fulfilled:", updateErr.message);
      setPrError("The Product number was saved, but updating the request failed — try again.");
      return;
    }

    setReviewRequest((r) => (r ? { ...r, status: "fulfilled", productNumber: number, adminNotes: prNotes.trim() || null } : r));
  };

  const handleDeclineRequest = async () => {
    if (!reviewRequest) return;
    setPrSaving(true);
    const { error } = await supabase
      .from("purchase_requests")
      .update({ status: "declined", admin_notes: prNotes.trim() || null, fulfilled_by: user?.email || null, fulfilled_at: new Date().toISOString() })
      .eq("id", reviewRequest.id);
    setPrSaving(false);

    if (error) {
      console.error("Error declining purchase request:", error.message);
      setPrError("Couldn't update the request — try again.");
      return;
    }
    setReviewRequest((r) => (r ? { ...r, status: "declined", adminNotes: prNotes.trim() || null } : r));
  };

  // Opens a trainee's certificate request and loads their per-module quiz
  // results (training_progress, joined with training_modules for the
  // title/order) so the admin can actually see what they're approving,
  // not just a bare "they're done" flag.
  const openCertificate = async (cert) => {
    setReviewCertificate(cert);
    setCertError("");
    setCertModuleBreakdown(null);
    setCertBreakdownLoading(true);

    const { data, error } = await supabase
      .from("training_progress")
      .select("status, best_score_percent, quiz_passed_at, module_id, training_modules(title, sort_order)")
      .eq("user_id", cert.userId);

    setCertBreakdownLoading(false);

    if (error) {
      console.error("Error loading training progress for certificate review:", error.message);
      setCertModuleBreakdown([]);
      return;
    }

    const rows = (data || [])
      .map((r) => ({
        title: r.training_modules?.title || "Untitled module",
        sortOrder: r.training_modules?.sort_order ?? 0,
        status: r.status,
        bestScorePercent: r.best_score_percent,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    setCertModuleBreakdown(rows);
  };

  const closeCertificate = () => {
    setReviewCertificate(null);
    setCertModuleBreakdown(null);
    setCertError("");
  };

  // Approving is the only action here — there's nothing to "decline":
  // the row only exists because every published module's quiz was
  // already passed. Approving just releases the certificate the trainee
  // sees on their own Training tab (see MemberArea.js's
  // progressApi.certificate?.status === "approved" check) — still no
  // email step, matching how Product numbers are delivered.
  const handleApproveCertificate = async () => {
    if (!reviewCertificate) return;
    setCertSaving(true);
    setCertError("");
    const { error } = await supabase
      .from("training_certificates")
      .update({
        status: "approved",
        issued_at: new Date().toISOString(),
        reviewed_by: user?.email || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", reviewCertificate.userId);
    setCertSaving(false);

    if (error) {
      console.error("Error approving training certificate:", error.message);
      setCertError("Couldn't approve this certificate — try again.");
      return;
    }
    setReviewCertificate((c) => (c ? { ...c, status: "approved" } : c));
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
      id: "reports",
      label: t.navReports,
      section: t.section2,
      icon: NAV_ICONS.reports,
    },
    {
      id: "consent-reviews",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          Consent Reviews
          {pendingConsentReviews.length > 0 && (
            <span style={{
              marginLeft: "auto", background: "#F2652233", color: "#F26522",
              borderRadius: 20, fontSize: 10.5, fontWeight: 800, padding: "1px 7px",
            }}>
              {pendingConsentReviews.length}
            </span>
          )}
        </span>
      ),
      section: t.section2,
      icon: NAV_ICONS.children,
    },
    {
      id: "training-modules",
      label: "Training Modules",
      section: t.section2,
      icon: NAV_ICONS.training,
    },
    {
      id: "training-certifications",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          Training Certifications
          {pendingTrainingCertificates.length > 0 && (
            <span style={{
              marginLeft: "auto", background: "#F2652233", color: "#F26522",
              borderRadius: 20, fontSize: 10.5, fontWeight: 800, padding: "1px 7px",
            }}>
              {pendingTrainingCertificates.length}
            </span>
          )}
        </span>
      ),
      section: t.section2,
      icon: NAV_ICONS.training,
    },
    {
      id: "screener-content",
      label: "Screener Content",
      section: t.section2,
      icon: NAV_ICONS.screenerContent,
    },
    {
      id: "purchase-requests",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
          Purchase Requests
          {pendingPurchaseRequests.length > 0 && (
            <span style={{
              marginLeft: "auto", background: "#F2652233", color: "#F26522",
              borderRadius: 20, fontSize: 10.5, fontWeight: 800, padding: "1px 7px",
            }}>
              {pendingPurchaseRequests.length}
            </span>
          )}
        </span>
      ),
      section: t.section2,
      icon: NAV_ICONS.purchases,
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
              {activePage === "reports" && t.navReports}
               {activePage === "training-modules" && "Training Modules"} 
              {activePage === "training-certifications" && "Training Certifications"}
              {activePage === "consent-reviews" && "Consent Reviews"}
              {activePage === "screener-content" && "Screener Content"}
              {activePage === "purchase-requests" && "Purchase Requests"}
              {activePage === "profile" && t.navProfile}
            </div>

            <div className="page-sub">
              {activePage === "consent-reviews" && "Consent forms the automatic check couldn't verify because the service was busy. Open the file, then accept or reject it."}
              {activePage === "training-modules" && "Add, reorder, publish and edit the modules shown on the Training page."} 
              {activePage === "training-certifications" && "Trainees who've passed every module's quiz land here. Review their results and approve to release their certificate."}
              {activePage === "screener-content" && "Manage the PuzzleBox Screener's sections, questions and scoring rules."}
              {activePage === "purchase-requests" && "Requests submitted from the \"Buy The Puzzle Box Screener\" page. Fulfil a request to issue its Product number."}
              {activePage === "users" && t.usersSub}
              {activePage === "children" && t.childrenSub}
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
                    style={{ marginBottom: 0 }}
                  >
                    <div className="th-quicklink-icon">
                      
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

        {activePage === "consent-reviews" && (
          <>
            {reviewError && <div style={{ color: "var(--pink)", fontSize: 13, marginBottom: 12 }}>⚠ {reviewError}</div>}
            {pendingConsentReviews.length === 0 ? (
              <div className="rh-card">
                <div className="rh-empty">
                  <div className="rh-empty-icon">📄</div>
                  <div className="rh-empty-title">No consent forms waiting</div>
                  <div className="rh-empty-sub">When a teacher sends a form for manual review, it will show up here.</div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Child</th>
                        <th>Requested</th>
                        <th>Form</th>
                        <th>Note (optional)</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingConsentReviews.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{c.teacherEmail || c.school || ""}</div>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                            {c.consentReviewRequestedAt ? new Date(c.consentReviewRequestedAt).toLocaleString() : "—"}
                          </td>
                          <td>
                            {c.consentFormUrl ? (
                              <a href={c.consentFormUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--teal)" }}>
                                Open {c.consentFileName || "file"}
                              </a>
                            ) : "—"}
                          </td>
                          <td>
                            <input
                              className="search-input"
                              style={{ minWidth: 200 }}
                              placeholder="e.g. signature present"
                              value={reviewNotes[c.id] || ""}
                              onChange={(e) => setReviewNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                            />
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <button className="btn btn-sm btn-primary" disabled={reviewBusy === c.id} onClick={() => handleConsentReview(c, true)}>Accept</button>{" "}
                            <button className="btn btn-sm btn-ghost" disabled={reviewBusy === c.id} onClick={() => handleConsentReview(c, false)}>Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {activePage === "training-modules" && (
          <TrainingModulesAdmin />
        )}

        {activePage === "training-certifications" && (
          trainingCertificates.length === 0 ? (
            <div className="rh-card">
              <div className="rh-empty">
                <div className="rh-empty-icon">🎓</div>
                <div className="rh-empty-title">No certifications yet</div>
                <div className="rh-empty-sub">Once a trainee passes every published module's quiz, they'll show up here for review.</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Trainee</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingCertificates.map((c) => (
                      <tr key={c.userId}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{c.userName || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{c.userEmail}</div>
                        </td>
                        <td>
                          {c.status === "approved"
                            ? <span style={{ fontWeight: 700, fontSize: 12, color: "var(--teal)" }}>✓ Approved</span>
                            : <span style={{ fontWeight: 700, fontSize: 12, color: "var(--orange)" }}>● Pending review</span>}
                        </td>
                        <td style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                          {c.requestedAt ? new Date(c.requestedAt).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <button className="btn btn-sm" style={{ background: "var(--purple-lt, #F0E8F7)", color: "var(--purple, #6B2F8A)", border: "none" }} onClick={() => openCertificate(c)}>
                            {c.status === "approved" ? "View" : "Review"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {activePage === "screener-content" && (
          <ScreenerContentAdmin />
        )}

        {activePage === "purchase-requests" && (
          purchaseRequests.length === 0 ? (
            <div className="rh-card">
              <div className="rh-empty">
                <div className="rh-empty-icon">📦</div>
                <div className="rh-empty-title">No purchase requests yet</div>
                <div className="rh-empty-sub">Requests submitted from the Buy page will show up here.</div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Requested by</th>
                      <th>Organisation</th>
                      <th>Screeners</th>
                      <th>Status</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequests.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{r.email}</div>
                        </td>
                        <td style={{ fontSize: 12.5, color: "var(--ink-mid)" }}>{r.organisation || "—"}</td>
                        <td style={{ fontSize: 12.5, color: "var(--ink-mid)" }}>{r.numberOfScreeners || "—"}</td>
                        <td>
                          {r.status === "fulfilled" && <span style={{ fontWeight: 700, fontSize: 12, color: "var(--teal)" }}>✓ Fulfilled</span>}
                          {r.status === "declined" && <span style={{ fontWeight: 700, fontSize: 12, color: "var(--pink)" }}>✕ Declined</span>}
                          {(r.status === "pending" || !r.status) && <span style={{ fontWeight: 700, fontSize: 12, color: "var(--orange)" }}>● Pending</span>}
                        </td>
                        <td style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td>
                          <button className="btn btn-sm" style={{ background: "var(--purple-lt, #F0E8F7)", color: "var(--purple, #6B2F8A)", border: "none" }} onClick={() => openRequest(r)}>
                            {r.status === "pending" || !r.status ? "Review" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
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

      {/* PURCHASE REQUEST MODAL */}
      {reviewRequest && (
        <div className="modal-overlay" onClick={closeRequest}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{reviewRequest.name}</div>
              <button className="modal-close" onClick={closeRequest}>✕</button>
            </div>

            <div style={{ display: "grid", gap: 4, marginBottom: 18, fontSize: 13.5 }}>
              <div><strong>Email:</strong> {reviewRequest.email}</div>
              <div><strong>Organisation / school:</strong> {reviewRequest.organisation || "—"}</div>
              {reviewRequest.phone && <div><strong>Phone:</strong> {reviewRequest.phone}</div>}
              <div><strong>Screeners requested:</strong> {reviewRequest.numberOfScreeners || "—"}</div>
              {reviewRequest.message && (
                <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 10, background: "var(--surface)", color: "var(--ink-mid)" }}>
                  {reviewRequest.message}
                </div>
              )}
            </div>

            {reviewRequest.status === "fulfilled" ? (
              <>
                <div style={{
                  padding: "14px 16px", borderRadius: 12, marginBottom: 14,
                  background: "var(--teal-lt, #E0F5F3)", color: "var(--ink)",
                }}>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--teal)", marginBottom: 4 }}>✓ FULFILLED</div>
                  <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, letterSpacing: "0.03em" }}>{reviewRequest.productNumber}</div>
                </div>
                <p style={{ fontSize: 11.5, color: "var(--ink-faint)", lineHeight: 1.6 }}>
                  Nothing further to do — {reviewRequest.email} will see this Product number automatically on their own Buy page once they log in.
                </p>
              </>
            ) : reviewRequest.status === "declined" ? (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--pink-lt, #FCE6EE)", color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
                ✕ This request was declined.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--ink-mid)", marginBottom: 6 }}>Product number</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="search-input"
                      style={{ fontFamily: "monospace", fontWeight: 700 }}
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                    />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPrNumber(generateProductNumber())}>
                      ↻ New
                    </button>
                  </div>
                  <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>
                    This is what they'll enter after logging in to unlock training — it should match the number on the physical kit you're shipping them.
                  </p>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--ink-mid)", marginBottom: 6 }}>Admin notes (optional)</label>
                  <textarea
                    className="search-input"
                    rows={2}
                    style={{ resize: "vertical" }}
                    value={prNotes}
                    onChange={(e) => setPrNotes(e.target.value)}
                  />
                </div>

                {prError && (
                  <div style={{ fontSize: 13, color: "var(--pink)", background: "var(--pink-lt)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                    {prError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" disabled={prSaving} onClick={handleDeclineRequest}>
                    Decline
                  </button>
                  <button className="btn btn-teal" disabled={prSaving} onClick={handleFulfil}>
                    {prSaving ? "Saving…" : "Mark Fulfilled"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TRAINING CERTIFICATE REVIEW MODAL */}
      {reviewCertificate && (
        <div className="modal-overlay" onClick={closeCertificate}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{reviewCertificate.userName || reviewCertificate.userEmail}</div>
              <button className="modal-close" onClick={closeCertificate}>✕</button>
            </div>

            <div style={{ display: "grid", gap: 4, marginBottom: 18, fontSize: 13.5 }}>
              <div><strong>Email:</strong> {reviewCertificate.userEmail}</div>
              <div><strong>Requested:</strong> {reviewCertificate.requestedAt ? new Date(reviewCertificate.requestedAt).toLocaleString() : "—"}</div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-mid)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Module results
            </div>

            {certBreakdownLoading ? (
              <p style={{ fontSize: 13, color: "var(--ink-mid)" }}>Loading results…</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                {(certModuleBreakdown || []).map((m, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 10, background: "var(--surface)", fontSize: 13,
                  }}>
                    <span>{m.title}</span>
                    <span style={{ fontWeight: 700, color: m.status === "quiz_passed" ? "var(--teal)" : "var(--ink-faint)" }}>
                      {m.status === "quiz_passed" ? `✓ Passed${m.bestScorePercent != null ? ` · ${m.bestScorePercent}%` : ""}` : "Not completed"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {reviewCertificate.status === "approved" ? (
              <div style={{
                padding: "14px 16px", borderRadius: 12,
                background: "var(--teal-lt, #E0F5F3)", color: "var(--ink)",
              }}>
                <div style={{ fontWeight: 800, fontSize: 12.5, color: "var(--teal)", marginBottom: 4 }}>✓ APPROVED</div>
                <div style={{ fontSize: 12.5 }}>
                  Certificate released to {reviewCertificate.userEmail}
                  {reviewCertificate.reviewedAt ? ` on ${new Date(reviewCertificate.reviewedAt).toLocaleDateString()}` : ""}.
                </div>
              </div>
            ) : (
              <>
                {certError && (
                  <div style={{ fontSize: 13, color: "var(--pink)", background: "var(--pink-lt)", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                    {certError}
                  </div>
                )}
                <p style={{ fontSize: 11.5, color: "var(--ink-faint)", lineHeight: 1.6, marginBottom: 14 }}>
                  Approving releases the certificate on {reviewCertificate.userEmail}'s own Training tab — nothing is emailed.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" disabled={certSaving} onClick={closeCertificate}>
                    Not yet
                  </button>
                  <button className="btn btn-teal" disabled={certSaving} onClick={handleApproveCertificate}>
                    {certSaving ? "Saving…" : "Approve & issue certificate"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}