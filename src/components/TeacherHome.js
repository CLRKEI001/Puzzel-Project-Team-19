// TeacherHome.js
//
// Teacher/Educator home screen.
//
// IMPORTANT:
// - Teachers can see Student Records from the shared `children` table.
// - Existing students are NOT filtered by examiner name, so records created
//   by psychologists/admins will also appear.
// - Teachers do NOT get access to the full Psychologist/Admin analytics.
// - Teachers can add new students.
// - Teachers can view individual student records.
// - PuzzleBox Screener remains available as its own flow.
// - Messages continue to come from the existing Firestore `messages`
//   collection.

import React, { useState, useEffect, useMemo } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { supabase } from "../supabaseClient";
import { mapChildRow } from "../lib/mappers";

import RoleSidebar from "./RoleSidebar";
import RoleHero from "./RoleHero";
import StatRing from "./StatRing";
import TodayList from "./TodayList";
import PuzzleBoxScreener from "./PuzzleBoxScreener";

import "./TeacherHome.css";
import "./RoleHomeKit.css";


// ============================================================
// STAGE COLOURS
// ============================================================

const stageColors = {
  stage1: {
    bg: "#F0EDF8",
    color: "#6B2F8A",
  },
  stage2: {
    bg: "#FEF0E7",
    color: "#F26522",
  },
  stage3: {
    bg: "#FCE6EE",
    color: "#E8175D",
  },
  stage4: {
    bg: "#E0F5F3",
    color: "#009B8D",
  },
};


// ============================================================
// FORM STYLES
// ============================================================

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 10,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  color: "var(--ink-mid)",
  display: "block",
  marginBottom: 5,
};


// ============================================================
// TRANSLATIONS
// ============================================================

const T = {
  en: {
    roleLabel: "Educator",

    navHome: "My Home",
    navMessages: "Messages",
    navScreener: "PuzzleBox Screener",
    navProfile: "My Profile",
    navStudents: "My Students",

    screenerSub:
      "Start a new PuzzleBox screening for one of your children.",

    openScreener: "Start Screening",
    openScreenerSub:
      "Begin a new PuzzleBox Screener session.",

    addStudent: "Add New Student",
    addStudentSub:
      "Register a new child in the PuzzleBox system.",

    addStudentTitle: "Add New Student",
    editChild: "Edit Child",
    deleteChild: "Delete Child Record",

    childNameLabel: "Child ID",
    schoolLabel: "School",
    ageLabel: "Age",
    genderLabel: "Gender",
    langLabel: "Language",
    examinerLabel: "Examiner",
    dateLabel: "Date",
    stageLabel: "Stage",

    save: "Save",
    cancel: "Cancel",

    stage1: "Not Started",
    stage2: "Registered",
    stage3: "Processing",
    stage4: "Completed",

    duplicateWarning:
      "A child with this name already exists",

    duplicateDetail:
      "already exists in the database. Please check before adding.",

    viewStudents: "Student Records",
    viewStudentsSub:
      "View student records available to you.",

    myStudents: "Student Records",
    myStudentsSub:
      "View student records currently stored on the PuzzleBox platform.",

    filterStatus: "All Stages",

    showing: "Showing",
    of: "of",
    childrenCountWord: "students",

    actions: "Actions",
    childNameCol: "Child",
    stageCol: "Stage",

    noResults: "No students found",
    noResultsSub:
      "Student records will appear here.",

    section1: "Overview",
    section2: "Screenings & Records",
    section3: "Account",

    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",

    homeSub:
      "Here's what's new for your class.",

    messagesSub:
      "Diagnosis reports sent to you by the screening psychologist.",

    profileSub:
      "Your account details and verification status.",

    statMessages: "Messages Received",
    statFlagged: "Children Flagged",
    statMonth: "This Month",

    recentMessages: "Recent Messages",
    viewAll: "View all",

    noMessages: "No messages yet",
    noMessagesSub:
      "When a psychologist sends you a diagnosis report, it will appear here.",

    quickLinks: "Quick Links",

    search:
      "Search by child or school...",

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

    recordDetails: "Student Record",
    status: "Status",
    province: "Province",
    examiner: "Examiner",
    screeningScore: "Screening Score",

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
    navStudents: "Studentrekords",

    screenerSub:
      "Begin 'n nuwe PuzzleBox-sifting vir een van jou kinders.",

    openScreener: "Begin Sifting",
    openScreenerSub:
      "Begin 'n nuwe PuzzleBox Sifter-sessie.",

    addStudent: "Voeg Nuwe Student By",
    addStudentSub:
      "Registreer 'n nuwe kind in die PuzzleBox-stelsel.",

    addStudentTitle: "Voeg Nuwe Student By",
    editChild: "Wysig Kind",
    deleteChild: "Skrap Kindrekord",

    childNameLabel: "Kind ID",
    schoolLabel: "Skool",
    ageLabel: "Ouderdom",
    genderLabel: "Geslag",
    langLabel: "Taal",
    examinerLabel: "Ondersoeker",
    dateLabel: "Datum",
    stageLabel: "Stadium",

    save: "Stoor",
    cancel: "Kanselleer",

    stage1: "Nie Begin Nie",
    stage2: "Geregistreer",
    stage3: "Verwerk",
    stage4: "Voltooi",

    duplicateWarning:
      "'n Kind met hierdie naam bestaan reeds",

    duplicateDetail:
      "bestaan reeds in die databasis. Maak asseblief seker voor jy byvoeg.",

    viewStudents: "Studentrekords",
    viewStudentsSub:
      "Sien studentrekords wat vir jou beskikbaar is.",

    myStudents: "Studentrekords",
    myStudentsSub:
      "Sien studentrekords wat tans op die PuzzleBox-platform gestoor is.",

    filterStatus: "Alle Stadiums",

    showing: "Wys",
    of: "van",
    childrenCountWord: "studente",

    actions: "Aksies",
    childNameCol: "Kind",
    stageCol: "Stadium",

    noResults: "Geen studente gevind nie",
    noResultsSub:
      "Studentrekords sal hier verskyn.",

    section1: "Oorsig",
    section2: "Sifting & Rekords",
    section3: "Rekening",

    goodMorning: "Goeie môre",
    goodAfternoon: "Goeie middag",
    goodEvening: "Goeie naand",

    homeSub:
      "Hier is wat nuut is vir jou klas.",

    messagesSub:
      "Diagnoseverslae wat die sielkundige aan jou gestuur het.",

    profileSub:
      "Jou rekeningbesonderhede en verifikasiestatus.",

    statMessages: "Boodskappe Ontvang",
    statFlagged: "Kinders Gevlag",
    statMonth: "Hierdie Maand",

    recentMessages: "Onlangse Boodskappe",
    viewAll: "Sien almal",

    noMessages: "Nog geen boodskappe",
    noMessagesSub:
      "Wanneer 'n sielkundige 'n diagnoseverslag stuur, verskyn dit hier.",

    quickLinks: "Vinnige Skakels",

    search:
      "Soek volgens kind of skool...",

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

    recordDetails: "Studentrekord",
    status: "Status",
    province: "Provinsie",
    examiner: "Ondersoeker",
    screeningScore: "Siftingspunt",

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
    navStudents: "Iirekhodi Zabafundi",

    screenerSub:
      "Qalisa uhlolo lwe-PuzzleBox olutsha lomnye wabantwana bakho.",

    openScreener: "Qalisa Uhlolo",
    openScreenerSub:
      "Qalisa iseshoni entsha ye-PuzzleBox Screener.",

    addStudent: "Yongeza Umfundi Omtsha",
    addStudentSub:
      "Bhalisa umntwana omtsha kwinkqubo yePuzzleBox.",

    addStudentTitle: "Yongeza Umfundi Omtsha",
    editChild: "Hlela Umntwana",
    deleteChild: "Cima Irekhodi Lomntwana",

    childNameLabel: "ID Yomntwana",
    schoolLabel: "Isikolo",
    ageLabel: "Ubudala",
    genderLabel: "Isini",
    langLabel: "Ulwimi",
    examinerLabel: "Umhloli",
    dateLabel: "Umhla",
    stageLabel: "Inqanaba",

    save: "Gcina",
    cancel: "Rhoxisa",

    stage1: "Ayikaqaliswa",
    stage2: "Ibhalisiwe",
    stage3: "Iyaqhubeka",
    stage4: "Igqityiwe",

    duplicateWarning:
      "Umntwana onegama elifanayo sele ekhona",

    duplicateDetail:
      "sele ekhona kwidatabase. Nceda ujonge phambi kokongeza.",

    viewStudents: "Iirekhodi Zabafundi",
    viewStudentsSub:
      "Jonga iirekhodi zabafundi ezikhoyo kuwe.",

    myStudents: "Iirekhodi Zabafundi",
    myStudentsSub:
      "Jonga iirekhodi zabafundi ezigcinwe kwiplatfomu yePuzzleBox.",

    filterStatus: "Onke Amanqanaba",

    showing: "Ibonisa",
    of: "kwi",
    childrenCountWord: "abafundi",

    actions: "Izenzo",
    childNameCol: "Umntwana",
    stageCol: "Inqanaba",

    noResults: "Akukho bafundi bafunyenweyo",
    noResultsSub:
      "Iirekhodi zabafundi ziya kubonakala apha.",

    section1: "Uhlolo",
    section2: "Ukuhlolwa & Iirekhodi",
    section3: "Iakhawunti",

    goodMorning: "Molo",
    goodAfternoon: "Molo Emini",
    goodEvening: "Molo Ngokuhlwa",

    homeSub:
      "Nazi iindaba ezintsha zeklasi yakho.",

    messagesSub:
      "Iingxelo zohlolo ezithunyelwe nguSazi Sengqondo.",

    profileSub:
      "Iinkcukacha zeakhawunti yakho nemeko yokuqinisekiswa.",

    statMessages: "Imiyalezo Efunyenweyo",
    statFlagged: "Abantwana Abakhonjiweyo",
    statMonth: "Le Nyanga",

    recentMessages: "Imiyalezo Yamva Nje",
    viewAll: "Jonga Yonke",

    noMessages: "Akukho miyalezo",
    noMessagesSub:
      "Xa isazi sengqondo sithumela ingxelo, izakuvela apha.",

    quickLinks: "Amakhonkco Akhawulezayo",

    search:
      "Khangela ngomntwana okanye isikolo...",

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

    recordDetails: "Irekhodi Yomfundi",
    status: "Imeko",
    province: "Iphondo",
    examiner: "Umhloli",
    screeningScore: "Amanqaku Ohlolo",

    lang_en: "IsiNgesi",
    lang_af: "IsiBhulu",
    lang_xh: "IsiXhosa",
  },
};


// ============================================================
// DOMAIN COLOURS
// ============================================================

const domainColors = {
  cognitive: "#009B8D",
  motor: "#6B2F8A",
  social: "#E8175D",
  emotion: "#F26522",
};


// ============================================================
// NAVIGATION ICONS
// ============================================================

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

  addStudent: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle
        cx="6"
        cy="5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M1.5 14c0-2.761 2.015-4.5 4.5-4.5s4.5 1.739 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.5 6v4M10.5 8h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),

  students: (
    <svg viewBox="0 0 16 16" fill="none">
      <circle
        cx="5.5"
        cy="5"
        r="2.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="11"
        cy="6"
        r="1.8"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M1.3 14c0-2.6 1.9-4.2 4.2-4.2s4.2 1.6 4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10 10.2c1.9.15 3.3 1.6 3.3 3.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
};


// ============================================================
// COMPONENT
// ============================================================

export default function TeacherHome({ user, profile }) {
  const [activePage, setActivePage] = useState("home");

  const [lang, setLang] = useState("en");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [search, setSearch] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [studentStageFilter, setStudentStageFilter] = useState("");

  const [selected, setSelected] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [addStudentError, setAddStudentError] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState(null);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    school: "",
    province: "Eastern Cape",
    age: "",
    gender: "Female",
    language: "English",
    date: "",
    examiner: "",
    stage: "stage1",
    flagged: false,
    total: 0,
    status: "Progressing",
  });

  const t = T[lang];

  const langLabels = {
    en: "EN",
    af: "AF",
    xh: "XH",
  };

  const displayName =
    profile?.name ||
    user?.email?.split("@")[0] ||
    "Educator";


  // ============================================================
  // FIRESTORE — PSYCHOLOGIST MESSAGES
  // ============================================================

  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, "messages"),
      where("teacherEmail", "==", user.email)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
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
        setLoadingMessages(false);
      },
      (error) => {
        console.error("Error loading teacher messages:", error);
        setLoadingMessages(false);
      }
    );

    return () => unsub();
  }, [user?.email]);


  // ============================================================
  // SUPABASE — STUDENT RECORDS
  //
  // IMPORTANT FIX:
  //
  // We intentionally DO NOT use:
  //
  // .eq("examiner", displayName)
  //
  // because existing children may have been created by a
  // psychologist/admin or have a different examiner value.
  //
  // Instead, teachers receive the existing student records from
  // the shared `children` table.
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const loadStudents = async () => {
      setLoadingStudents(true);

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error loading student records:",
          error
        );

        if (isMounted) {
          setStudents([]);
          setLoadingStudents(false);
        }

        return;
      }

      if (isMounted) {
        const mappedStudents = (data || []).map(mapChildRow);

        setStudents(mappedStudents);
        setLoadingStudents(false);
      }
    };

    loadStudents();

    // Listen for additions/updates/deletions so that the
    // Student Records section updates automatically.

    const channel = supabase
      .channel("teacher-student-records")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "children",
        },
        () => {
          loadStudents();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);


  // ============================================================
  // GREETING
  // ============================================================

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;

    return t.goodEvening;
  }, [t]);


  // ============================================================
  // MESSAGE STATISTICS
  // ============================================================

  const flaggedCount = useMemo(
    () =>
      new Set(
        messages
          .map((m) => m.childName)
          .filter(Boolean)
      ).size,
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


  // ============================================================
  // MESSAGE SEARCH
  // ============================================================

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (!search) return true;

      const s = search.toLowerCase();

      return (
        m.childName
          ?.toLowerCase()
          .includes(s) ||
        m.school
          ?.toLowerCase()
          .includes(s)
      );
    });
  }, [messages, search]);


  // ============================================================
  // STUDENT SEARCH + FILTER
  // ============================================================

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchValue =
        studentSearch.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        student.name
          ?.toLowerCase()
          .includes(searchValue) ||
        student.school
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStage =
        !studentStageFilter ||
        (student.stage || "stage4") ===
          studentStageFilter;

      return matchesSearch && matchesStage;
    });
  }, [
    students,
    studentSearch,
    studentStageFilter,
  ]);


  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "—";

    if (value?.seconds) {
      return new Date(
        value.seconds * 1000
      ).toLocaleDateString();
    }

    if (typeof value === "string") {
      const parsed = new Date(value);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString();
      }

      return value;
    }

    return "—";
  };


  // ============================================================
  // NAVIGATION
  // ============================================================

  const navItems = [
    {
      id: "home",
      label: t.navHome,
      section: t.section1,
      icon: NAV_ICONS.home,
    },

    {
      id: "screener",
      label: t.navScreener,
      section: t.section2,
      icon: NAV_ICONS.screener,
    },

    {
      id: "students",
      label: t.navStudents,
      section: t.section2,
      icon: NAV_ICONS.students,
    },

    {
      id: "messages",
      label: t.navMessages,
      section: t.section2,
      icon: NAV_ICONS.messages,
    },

    {
      id: "add-student",
      label: t.addStudent,
      section: t.section2,
      icon: NAV_ICONS.addStudent,
      onClick: () => setShowAddStudent(true),
    },

    {
      id: "profile",
      label: t.navProfile,
      section: t.section3,
      icon: NAV_ICONS.profile,
    },
  ];


  // ============================================================
  // ADD STUDENT
  // ============================================================

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.school) {
      return;
    }

    setAddStudentError("");

    // Check for an existing child with the same name — only relevant
    // when adding a brand new record, not when editing one that already
    // exists (its own name obviously already matches itself).

    if (!editingStudentId) {
      const {
        data: existing,
        error: checkError,
      } = await supabase
        .from("children")
        .select("id")
        .eq("name", newStudent.name);

      if (checkError) {
        console.error(
          "Error checking for duplicate child:",
          checkError
        );
        setAddStudentError("Could not check for duplicates — " + checkError.message);
        return;
      }

      if (existing && existing.length > 0) {
        setDuplicateWarning(true);
        return;
      }
    }

    const recordToInsert = {
      ...newStudent,

      // Automatically associate the new record with the
      // educator if they leave Examiner blank.
      examiner:
        newStudent.examiner || displayName,

      age:
        parseInt(newStudent.age, 10) || 5,

      // IMPORTANT: an empty string here is not a valid Postgres `date`
      // value — Supabase rejects it outright and the insert/update fails
      // silently (only a console error, nothing shown to the teacher).
      // "Date of Assessment" is optional in this form, so send null
      // instead of "" whenever it's left blank.
      date: newStudent.date || null,
    };

    const { error: saveError } = editingStudentId
      ? await supabase.from("children").update(recordToInsert).eq("id", editingStudentId)
      : await supabase.from("children").insert(recordToInsert);

    if (saveError) {
      console.error(
        editingStudentId ? "Error updating student:" : "Error adding student:",
        saveError
      );
      setAddStudentError(
        (editingStudentId ? "Could not save changes — " : "Could not add this student — ") + saveError.message
      );
      return;
    }

    setShowAddStudent(false);
    setDuplicateWarning(false);
    setEditingStudentId(null);
    setAddStudentError("");

    setNewStudent({
      name: "",
      school: "",
      province: "Eastern Cape",
      age: "",
      gender: "Female",
      language: "English",
      date: "",
      examiner: "",
      stage: "stage1",
      flagged: false,
      total: 0,
      status: "Progressing",
    });
  };

  const openEditStudent = (student) => {
    setNewStudent({
      name: student.name || "",
      school: student.school || "",
      province: student.province || "Eastern Cape",
      age: student.age || "",
      gender: student.gender || "Female",
      language: student.language || "English",
      date: student.date || "",
      examiner: student.examiner || "",
      stage: student.stage || "stage1",
      flagged: student.flagged || false,
      total: student.total || 0,
      status: student.status || "Progressing",
    });
    setEditingStudentId(student.id);
    setAddStudentError("");
    setSelectedStudent(null);
    setShowAddStudent(true);
  };

  const handleDeleteStudent = async () => {
    if (!confirmDeleteStudent) return;
    const { error: deleteError } = await supabase.from("children").delete().eq("id", confirmDeleteStudent.id);
    if (deleteError) {
      console.error("Error deleting student:", deleteError);
      setAddStudentError("Could not delete this record — " + deleteError.message);
      setConfirmDeleteStudent(null);
      return;
    }
    setConfirmDeleteStudent(null);
    setSelectedStudent(null);
  };


  // ============================================================
  // PUZZLEBOX SCREENER
  // ============================================================

  if (activePage === "screener") {
    return (
      <PuzzleBoxScreener
        user={user}
        profile={profile}
        onExit={() => setActivePage("home")}
      />
    );
  }


  // ============================================================
  // MAIN LAYOUT
  // ============================================================

  return (
    <div
      className="dashboard-layout rh-shell"
      style={{
        "--rh-accent": "#F26522",
        "--rh-accent-soft": "#FFEFE3",
      }}
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <RoleSidebar
        navItems={navItems}
        activePage={activePage}
        setActivePage={setActivePage}
        roleLabel={t.roleLabel}
        displayName={displayName}
      />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="main-content page-fade">

        {/* TOP BAR */}

        <div className="topbar">

          <div className="topbar-left">

            <div className="page-title">

              {activePage === "home" && t.navHome}

              {activePage === "messages" &&
                t.navMessages}

              {activePage === "students" &&
                t.navStudents}

              {activePage === "profile" &&
                t.navProfile}

            </div>

            <div className="page-sub">

              {activePage === "messages" &&
                t.messagesSub}

              {activePage === "profile" &&
                t.profileSub}

              {activePage === "students" &&
                t.myStudentsSub}

            </div>

          </div>


          {/* LANGUAGE SWITCHER — TOP RIGHT */}

          <div className="topbar-right">

            <div className="lang-switcher">

              {Object.entries(langLabels).map(
                ([code, label]) => (
                  <button
                    key={code}
                    className={`lang-btn ${
                      lang === code
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setLang(code)
                    }
                  >
                    {label}
                  </button>
                )
              )}

            </div>

          </div>

        </div>


        {/* ====================================================
            HOME
        ==================================================== */}

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

                {/* RECENT MESSAGES */}

                <TodayList
                  title={t.recentMessages}
                  actionLabel={t.viewAll}
                  onAction={() =>
                    setActivePage("messages")
                  }
                  emptyIcon=""
                  emptyTitle={t.noMessages}
                  emptySub={t.noMessagesSub}
                  onItemClick={(m) =>
                    setSelected(m)
                  }
                  items={
                    loadingMessages
                      ? null
                      : messages
                          .slice(0, 5)
                          .map((m) => ({
                            icon: "✉",
                            color: "#F26522",
                            title: m.childName,
                            meta: `${
                              m.school
                            } · ${
                              t.sentOn
                            } ${formatDate(
                              m.sentAt
                            )}`,
                          }))
                  }
                />


                {/* QUICK LINKS */}

                <div className="rh-card">

                  <div className="rh-card-head">
                    <div className="rh-card-title">
                      {t.quickLinks}
                    </div>
                  </div>


                  {/* SCREENING */}

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setActivePage(
                        "screener"
                      )
                    }
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


                  {/* STUDENT RECORDS */}

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setActivePage(
                        "students"
                      )
                    }
                  >

                    <div className="th-quicklink-icon">
                      👥
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.viewStudents}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.viewStudentsSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>

                  </button>


                  {/* ADD STUDENT */}

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setShowAddStudent(true)
                    }
                  >

                    <div className="th-quicklink-icon">
                      ➕
                    </div>

                    <div>
                      <div className="th-quicklink-title">
                        {t.addStudent}
                      </div>

                      <div className="th-quicklink-sub">
                        {t.addStudentSub}
                      </div>
                    </div>

                    <div className="th-quicklink-arrow">
                      →
                    </div>

                  </button>


                  {/* MESSAGES */}

                  <button
                    className="th-quicklink"
                    onClick={() =>
                      setActivePage(
                        "messages"
                      )
                    }
                    style={{
                      marginBottom: 0,
                    }}
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


              {/* PROFILE CARD */}

              <div>

                <div className="rh-profile-card">

                  <div
                    className="rh-profile-avatar"
                    style={{
                      background:
                        "#F26522",
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
                      background:
                        "#F265221a",
                      color:
                        "#F26522",
                    }}
                  >
                    {t.roleLabel}
                  </span>

                  <div className="rh-profile-verified">
                    ✓ {t.verified}
                  </div>


                  <div className="rh-chip-grid">

                    <div className="rh-chip">

                      <div className="rh-chip-value">
                        {students.length}
                      </div>

                      <div className="rh-chip-label">
                        {t.navStudents}
                      </div>

                    </div>


                    <div className="rh-chip">

                      <div className="rh-chip-value">
                        {messages.length}
                      </div>

                      <div className="rh-chip-label">
                        {t.statMessages}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </>
        )}


        {/* ====================================================
            STUDENT RECORDS
        ==================================================== */}

        {activePage === "students" && (
          <>

            {/* SEARCH + FILTER */}

            <div className="search-bar">

              <input
                className="search-input"
                placeholder={t.search}
                value={studentSearch}
                onChange={(e) =>
                  setStudentSearch(
                    e.target.value
                  )
                }
              />

              <select
                className="filter-select"
                value={
                  studentStageFilter
                }
                onChange={(e) =>
                  setStudentStageFilter(
                    e.target.value
                  )
                }
              >

                <option value="">
                  {t.filterStatus}
                </option>

                <option value="stage1">
                  {t.stage1}
                </option>

                <option value="stage2">
                  {t.stage2}
                </option>

                <option value="stage3">
                  {t.stage3}
                </option>

                <option value="stage4">
                  {t.stage4}
                </option>

              </select>


              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  setShowAddStudent(true)
                }
              >
                + {t.addStudent}
              </button>


              <span
                style={{
                  fontSize: 12,
                  color:
                    "var(--ink-faint)",
                  fontWeight: 600,
                  marginLeft:
                    "auto",
                }}
              >
                {t.showing}{" "}
                {filteredStudents.length}{" "}
                {t.of}{" "}
                {students.length}{" "}
                {t.childrenCountWord}
              </span>

            </div>


            {/* STUDENT TABLE */}

            <div
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
              }}
            >

              {loadingStudents ? (

                <div className="empty-state">

                  <div
                    className="empty-state-icon"
                    style={{
                      fontSize: 28,
                    }}
                  >
                    ⏳
                  </div>

                  <div className="empty-state-title">
                    Loading student records...
                  </div>

                  <div className="empty-state-sub">
                    Please wait while the student
                    records are loaded.
                  </div>

                </div>

              ) : filteredStudents.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-state-icon">
                    🧒
                  </div>

                  <div className="empty-state-title">
                    {t.noResults}
                  </div>

                  <div className="empty-state-sub">
                    {students.length === 0
                      ? "No student records were found in the children database."
                      : t.noResultsSub}
                  </div>

                </div>

              ) : (

                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >

                  <table className="data-table">

                    <thead>

                      <tr>

                        <th>
                          {t.childNameCol}
                        </th>

                        <th>
                          {t.school}
                        </th>

                        <th>
                          {t.stageCol}
                        </th>

                        <th>
                          {t.actions}
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredStudents.map(
                        (child, i) => {

                          const stage =
                            child.stage ||
                            "stage4";

                          const sc =
                            stageColors[
                              stage
                            ] ||
                            stageColors.stage4;

                          return (
                            <tr
                              key={
                                child.id ||
                                i
                              }
                            >

                              <td>

                                <div
                                  style={{
                                    fontWeight:
                                      800,
                                    fontSize: 13,
                                  }}
                                >
                                  {child.name ||
                                    "—"}
                                </div>

                                {child.id && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color:
                                        "var(--ink-faint)",
                                      marginTop:
                                        2,
                                    }}
                                  >
                                    {child.id}
                                  </div>
                                )}

                              </td>


                              <td>
                                {child.school ||
                                  "—"}
                              </td>


                              <td>

                                <span
                                  style={{
                                    display:
                                      "inline-block",
                                    padding:
                                      "5px 12px",
                                    borderRadius:
                                      20,
                                    fontSize:
                                      12,
                                    fontWeight:
                                      700,
                                    background:
                                      sc.bg,
                                    color:
                                      sc.color,
                                  }}
                                >
                                  {t[stage] ||
                                    stage}
                                </span>

                              </td>


                              <td>

                                <button
                                  className="btn btn-teal btn-sm"
                                  onClick={() =>
                                    setSelectedStudent(
                                      child
                                    )
                                  }
                                >
                                  {t.view}
                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {activePage === "messages" && (
          <>

            <div className="search-bar">

              <input
                className="search-input"
                placeholder={t.search}
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              <span
                style={{
                  fontSize: 12,
                  color:
                    "var(--ink-faint)",
                  fontWeight: 600,
                  marginLeft:
                    "auto",
                }}
              >
                {filteredMessages.length}{" "}
                {t.of}{" "}
                {messages.length}{" "}
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

              {filteredMessages.length === 0 ? (

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

                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >

                  <table className="data-table">

                    <thead>

                      <tr>

                        <th>
                          {t.childNameCol}
                        </th>

                        <th>
                          {t.school}
                        </th>

                        <th>
                          {t.score}
                        </th>

                        <th>
                          {t.sentOn}
                        </th>

                        <th></th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredMessages.map(
                        (m) => (

                          <tr
                            key={m.id}
                          >

                            <td
                              style={{
                                fontWeight:
                                  700,
                              }}
                            >
                              {m.childName ||
                                "—"}
                            </td>

                            <td>
                              {m.school ||
                                "—"}
                            </td>

                            <td>
                              <strong>
                                {m.childScore ??
                                  "—"}
                                {m.childScore !=
                                  null &&
                                  "%"}
                              </strong>
                            </td>

                            <td
                              style={{
                                color:
                                  "var(--ink-faint)",
                                fontSize:
                                  12,
                              }}
                            >
                              {formatDate(
                                m.sentAt
                              )}
                            </td>

                            <td>

                              <button
                                className="btn btn-teal btn-sm"
                                onClick={() =>
                                  setSelected(m)
                                }
                              >
                                {t.view}
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}


        {/* ====================================================
            PROFILE
        ==================================================== */}

        {activePage === "profile" && (

          <div
            className="card"
            style={{
              maxWidth: 520,
            }}
          >

            <div
              className="report-section"
              style={{
                marginBottom: 0,
              }}
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
                    color:
                      "var(--teal)",
                  }}
                >
                  ✓ {t.verified}
                </span>

              </div>

            </div>

          </div>

        )}

      </div>


      {/* ======================================================
          MESSAGE DETAIL MODAL
      ====================================================== */}

      {selected && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelected(null)
          }
        >

          <div
            className="modal"
            style={{
              maxWidth: 560,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">
                {selected.childName}
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelected(null)
                }
              >
                ✕
              </button>

            </div>


            <div
              style={{
                padding: "12px 16px",
                background:
                  "var(--teal-lt)",
                borderRadius: 12,
                marginBottom: 20,
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >

              <div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color:
                      "var(--teal)",
                  }}
                >
                  {selected.school}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color:
                      "var(--ink-mid)",
                  }}
                >
                  {t.sentOn}{" "}
                  {formatDate(
                    selected.sentAt
                  )}
                </div>

              </div>


              <span className="pill pill-pink">
                {selected.childScore}%
              </span>

            </div>


            {selected.domains && (

              <div
                style={{
                  marginBottom: 20,
                }}
              >

                {[
                  "cognitive",
                  "motor",
                  "social",
                  "emotion",
                ].map((key) => (

                  <div
                    className="domain-bar"
                    key={key}
                  >

                    <div className="domain-bar-header">

                      <span>
                        {t[key]}
                      </span>

                      <span>
                        {selected
                          .domains[
                            key
                          ] || 0}
                        %
                      </span>

                    </div>

                    <div className="domain-bar-track">

                      <div
                        className="domain-bar-fill"
                        style={{
                          width: `${
                            selected
                              .domains[
                              key
                            ] || 0
                          }%`,
                          background:
                            domainColors[
                              key
                            ],
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
                  color:
                    "var(--ink-mid)",
                  whiteSpace:
                    "pre-wrap",
                }}
              >
                {selected.diagnosis ||
                  "—"}
              </div>

            </div>


            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >

              <button
                className="btn btn-ghost"
                onClick={() =>
                  setSelected(null)
                }
              >
                {t.close}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          ADD NEW STUDENT MODAL
      ====================================================== */}

      {showAddStudent && (

        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddStudent(false);
            setEditingStudentId(null);
            setAddStudentError("");
          }}
        >

          <div
            className="modal"
            style={{
              maxWidth: 560,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">
                {editingStudentId ? t.editChild || "Edit Student" : t.addStudentTitle}
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setShowAddStudent(false);
                  setEditingStudentId(null);
                  setAddStudentError("");
                }}
              >
                ✕
              </button>

            </div>

            {addStudentError && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--pink-lt)",
                  color: "var(--pink)",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                ⚠ {addStudentError}
              </div>
            )}


            {duplicateWarning && (

              <div
                style={{
                  padding:
                    "10px 14px",
                  background:
                    "var(--pink-lt)",
                  color:
                    "var(--pink)",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                ⚠{" "}
                {t.duplicateWarning}{" "}
                — "{newStudent.name}"{" "}
                {t.duplicateDetail}
              </div>

            )}


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >

              {/* CHILD ID */}

              <div>

                <label style={labelStyle}>
                  {t.childNameLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder="Child PB-016"
                  value={
                    newStudent.name
                  }
                  onChange={(e) => {

                    setNewStudent({
                      ...newStudent,
                      name:
                        e.target.value,
                    });

                    setDuplicateWarning(
                      false
                    );

                  }}
                />

              </div>


              {/* SCHOOL */}

              <div>

                <label style={labelStyle}>
                  {t.schoolLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder="School name"
                  value={
                    newStudent.school
                  }
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      school:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* AGE */}

              <div>

                <label style={labelStyle}>
                  {t.ageLabel}
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  placeholder="5"
                  value={
                    newStudent.age
                  }
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      age:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* GENDER */}

              <div>

                <label style={labelStyle}>
                  {t.genderLabel}
                </label>

                <select
                  style={inputStyle}
                  value={
                    newStudent.gender
                  }
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      gender:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Female
                  </option>

                  <option>
                    Male
                  </option>
                </select>

              </div>


              {/* LANGUAGE */}

              <div>

                <label style={labelStyle}>
                  {t.langLabel}
                </label>

                <select
                  style={inputStyle}
                  value={
                    newStudent.language
                  }
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      language:
                        e.target.value,
                    })
                  }
                >

                  <option>
                    English
                  </option>

                  <option>
                    Afrikaans
                  </option>

                  <option>
                    isiXhosa
                  </option>

                </select>

              </div>


              {/* EXAMINER */}

              <div>

                <label style={labelStyle}>
                  {t.examinerLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder={
                    displayName
                  }
                  value={
                    newStudent.examiner
                  }
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      examiner:
                        e.target.value,
                    })
                  }
                />

              </div>


              {/* DATE */}

              <div
                style={{
                  gridColumn:
                    "span 2",
                }}
              >

                <label style={labelStyle}>
                  {t.dateLabel}
                </label>

                <input
                  style={inputStyle}
                  type="date"
                  value={
                    newStudent.date
                  }
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      date:
                        e.target.value,
                    })
                  }
                />

              </div>

            </div>


            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent:
                  "flex-end",
              }}
            >

              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowAddStudent(false);
                  setEditingStudentId(null);
                  setAddStudentError("");
                }}
              >
                {t.cancel}
              </button>

              <button
                className="btn btn-primary"
                onClick={
                  handleAddStudent
                }
                disabled={
                  !newStudent.name ||
                  !newStudent.school
                }
              >
                {editingStudentId ? (t.save || "Save") : t.save}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          STUDENT RECORD DETAIL MODAL
      ====================================================== */}

      {selectedStudent && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedStudent(null)
          }
        >

          <div
            className="modal"
            style={{
              maxWidth: 520,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">
                {selectedStudent.name ||
                  "Student"}
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedStudent(
                    null
                  )
                }
              >
                ✕
              </button>

            </div>


            {/* RECORD SUMMARY */}

            <div
              style={{
                padding:
                  "14px 16px",
                background:
                  "#FFF7F1",
                borderRadius: 12,
                marginBottom: 20,
              }}
            >

              <div
                style={{
                  fontSize: 12,
                  color:
                    "var(--ink-mid)",
                  marginBottom: 4,
                }}
              >
                {t.recordDetails}
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color:
                    "var(--ink)",
                }}
              >
                {selectedStudent.name ||
                  "—"}
              </div>

            </div>


            {/* RECORD FIELDS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}
            >

              {/* SCHOOL */}

              <div>

                <label style={labelStyle}>
                  {t.schoolLabel}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.school ||
                    "—"}
                </div>

              </div>


              {/* STAGE */}

              <div>

                <label style={labelStyle}>
                  {t.stageLabel}
                </label>

                {(() => {

                  const stage =
                    selectedStudent.stage ||
                    "stage4";

                  const sc =
                    stageColors[
                      stage
                    ] ||
                    stageColors.stage4;

                  return (
                    <span
                      style={{
                        display:
                          "inline-block",
                        padding:
                          "5px 12px",
                        borderRadius:
                          20,
                        fontSize: 12,
                        fontWeight: 700,
                        background:
                          sc.bg,
                        color:
                          sc.color,
                      }}
                    >
                      {t[stage] ||
                        stage}
                    </span>
                  );

                })()}

              </div>


              {/* AGE */}

              <div>

                <label style={labelStyle}>
                  {t.ageLabel}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.age ||
                    "—"}
                </div>

              </div>


              {/* GENDER */}

              <div>

                <label style={labelStyle}>
                  {t.genderLabel}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.gender ||
                    "—"}
                </div>

              </div>


              {/* LANGUAGE */}

              <div>

                <label style={labelStyle}>
                  {t.langLabel}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.language ||
                    "—"}
                </div>

              </div>


              {/* DATE */}

              <div>

                <label style={labelStyle}>
                  {t.dateLabel}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {formatDate(
                    selectedStudent.date
                  )}
                </div>

              </div>


              {/* PROVINCE */}

              <div>

                <label style={labelStyle}>
                  {t.province}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.province ||
                    "—"}
                </div>

              </div>


              {/* EXAMINER */}

              <div>

                <label style={labelStyle}>
                  {t.examiner}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.examiner ||
                    "—"}
                </div>

              </div>


              {/* STATUS */}

              <div>

                <label style={labelStyle}>
                  {t.status}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.status ||
                    "—"}
                </div>

              </div>


              {/* SCORE */}

              <div>

                <label style={labelStyle}>
                  {t.screeningScore}
                </label>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {selectedStudent.total ??
                    "—"}
                </div>

              </div>

            </div>


            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 10,
              }}
            >

              <button
                className="btn btn-sm"
                style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none" }}
                onClick={() =>
                  setConfirmDeleteStudent(selectedStudent)
                }
              >
                🗑 {t.deleteChild || "Delete Child Record"}
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() =>
                    openEditStudent(selectedStudent)
                  }
                >
                  ✏ {t.editChild || "Edit Child"}
                </button>

                <button
                  className="btn btn-ghost"
                  onClick={() =>
                    setSelectedStudent(
                      null
                    )
                  }
                >
                  {t.close}
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

      {confirmDeleteStudent && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteStudent(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Delete {confirmDeleteStudent.name}?</div>
              <button className="modal-close" onClick={() => setConfirmDeleteStudent(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-mid)", lineHeight: 1.6, marginBottom: 20 }}>
              This permanently removes this child's record, including any screening history attached to it. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDeleteStudent(null)}>{t.cancel}</button>
              <button className="btn btn-sm" style={{ background: "var(--pink)", color: "#fff", border: "none", padding: "10px 18px" }} onClick={handleDeleteStudent}>
                {t.deleteChild || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}