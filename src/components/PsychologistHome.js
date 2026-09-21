// PsychologistHome.js — the home screen a Psychologist lands on after a
// verified login. Personalized greeting, EN/AF/XH switcher, a quick read
// on flagged children and scheduled follow-ups (from the existing
// "children" and "followUps" collections ChildrenTable.js already
// manages), and a menu item into the full analytics Dashboard so
// everything stays linked together rather than living on separate
// disconnected screens.
 
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { mapChildRow, mapFollowUpRow, mapMessageRow, mapPuzzleboxScreeningRow } from "../lib/mappers";
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
    navNotifications: "Notifications",
    section1: "Overview", section2: "Caseload", section3: "Account",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening",
    homeSub: "Here's what needs your attention today.",
    followUpsSub: "All follow-up appointments scheduled across the pilot.",
    profileSub: "Your account details and verification status.",
    notifSub: "Screenings teachers have finished, waiting on your review.",
    statFlagged: "Flagged Children", statFollowUps: "Follow-ups Scheduled", statMessages: "Messages Sent",
    total: "total", pending: "pending", allTime: "all time",
    upcomingFollowUps: "Upcoming Follow-ups", viewAll: "View all", noFollowUps: "No follow-ups scheduled",
    noFollowUpsSub: "Appointments you schedule from Student Records will appear here.",
    recentlyFlagged: "Recently Flagged Children", noFlagged: "No flagged children",
    noFlaggedSub: "Children flagged for developmental concerns will appear here.",
    needsReview: "Needs Review", noNotifications: "No screenings waiting on review",
    noNotificationsSub: "When a teacher finishes a PuzzleBox screening, it'll show up here.",
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
    reviewTitle: "Review Screening", submittedBy: "Submitted by", rawScoreLabel: "Raw score",
    resultBand: "Result", observationsLabel: "Teacher's observations", noObservations: "None noted.",
    verdictQuestion: "How does this screening look?", verdictFine: "Everything is fine",
    verdictConcerns: "There are concerns", notesLabel: "Notes (optional)",
    notesPlaceholder: "Anything you want on record with this decision...",
    shareWith: "Share the outcome with", shareParent: "Parent / Guardian", shareHeadmistress: "Headmistress / Principal",
    recipientName: "Name", recipientEmail: "Email address",
    saveReview: "Save Review", saving: "Saving…", shareAndSave: "Save & Share",
    reviewSaved: "Review saved", reviewSharedWith: "Shared with",
    reviewSavedSub: "The outcome has been recorded.",
    done: "Done", markedReviewed: "Reviewed", awaitingReview: "Awaiting review",
    loadingScreening: "Loading screening…",
  },
  af: {
    roleLabel: "Sielkundige",
    navHome: "My Tuisblad", navFollowUps: "Opvolge", navDashboard: "Volledige Paneelbord", navProfile: "My Profiel",
    navNotifications: "Kennisgewings",
    section1: "Oorsig", section2: "Gevallelading", section3: "Rekening",
    goodMorning: "Goeie môre", goodAfternoon: "Goeie middag", goodEvening: "Goeie naand",
    homeSub: "Hier is wat vandag jou aandag nodig het.",
    followUpsSub: "Alle opvolgafsprake geskeduleer regoor die loodsprojek.",
    profileSub: "Jou rekeningbesonderhede en verifikasiestatus.",
    notifSub: "Sifting deur onderwysers voltooi, wag op jou hersiening.",
    statFlagged: "Gevlagde Kinders", statFollowUps: "Opvolge Geskeduleer", statMessages: "Boodskappe Gestuur",
    total: "totaal", pending: "hangend", allTime: "nog altyd",
    upcomingFollowUps: "Komende Opvolge", viewAll: "Sien almal", noFollowUps: "Geen opvolge geskeduleer",
    noFollowUpsSub: "Afsprake wat jy skeduleer sal hier verskyn.",
    recentlyFlagged: "Onlangs Gevlagde Kinders", noFlagged: "Geen gevlagde kinders",
    noFlaggedSub: "Kinders wat gevlag word sal hier verskyn.",
    needsReview: "Benodig Hersiening", noNotifications: "Geen sifting wag op hersiening nie",
    noNotificationsSub: "Wanneer 'n onderwyser 'n sifting voltooi, verskyn dit hier.",
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
    reviewTitle: "Hersien Sifting", submittedBy: "Ingedien deur", rawScoreLabel: "Rou telling",
    resultBand: "Resultaat", observationsLabel: "Onderwyser se waarnemings", noObservations: "Geen aangeteken nie.",
    verdictQuestion: "Hoe lyk hierdie sifting?", verdictFine: "Alles is reg",
    verdictConcerns: "Daar is kommer", notesLabel: "Notas (opsioneel)",
    notesPlaceholder: "Enigiets wat jy op rekord wil hê...",
    shareWith: "Deel die uitkoms met", shareParent: "Ouer / Voog", shareHeadmistress: "Hoofonderwyseres / Skoolhoof",
    recipientName: "Naam", recipientEmail: "E-posadres",
    saveReview: "Stoor Hersiening", saving: "Stoor…", shareAndSave: "Stoor & Deel",
    reviewSaved: "Hersiening gestoor", reviewSharedWith: "Gedeel met",
    reviewSavedSub: "Die uitkoms is aangeteken.",
    done: "Klaar", markedReviewed: "Hersien", awaitingReview: "Wag op hersiening",
    loadingScreening: "Laai sifting…",
  },
  xh: {
    roleLabel: "Isazi Sengqondo",
    navHome: "Ikhaya Lam", navFollowUps: "Ukulandelwa", navDashboard: "Ideshibhodi Epheleleyo", navProfile: "Iprofayile Yam",
    navNotifications: "Izaziso",
    section1: "Uhlolo", section2: "Umthwalo Wamatyala", section3: "Iakhawunti",
    goodMorning: "Molo", goodAfternoon: "Molo Emini", goodEvening: "Molo Ngokuhlwa",
    homeSub: "Nazi izinto ezidinga ingqalelo yakho namhlanje.",
    followUpsSub: "Zonke iindibano zokulandelwa ezicwangciselweyo.",
    profileSub: "Iinkcukacha zeakhawunti yakho nemeko yokuqinisekiswa.",
    notifSub: "Uhlolo olugqityiweyo ngootitshala, lulinde uphononongo lwakho.",
    statFlagged: "Abantwana Abakhonjiweyo", statFollowUps: "Ukulandelwa Okucwangcisiweyo", statMessages: "Imiyalezo Ethunyelweyo",
    total: "iyonke", pending: "kulindile", allTime: "sonke isihlandlo",
    upcomingFollowUps: "Ukulandelwa Okuzayo", viewAll: "Jonga Yonke", noFollowUps: "Akukho kulandelwa okucwangcisiweyo",
    noFollowUpsSub: "Iindibano ozicwangcisayo ziya kubonakala apha.",
    recentlyFlagged: "Abantwana Abakhonjwe Kutsha Nje", noFlagged: "Akukho bantwana abakhonjiweyo",
    noFlaggedSub: "Abantwana abakhonjiweyo baya kubonakala apha.",
    needsReview: "Kufuneka Uphononongo", noNotifications: "Akukho hlolo lulindele uphononongo",
    noNotificationsSub: "Xa utitshala egqiba uhlolo, luya kubonakala apha.",
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
    reviewTitle: "Phonononga Uhlolo", submittedBy: "Ithunyelwe ngu", rawScoreLabel: "Amanqaku aluhlaza",
    resultBand: "Isiphumo", observationsLabel: "Uphawu lukatitshala", noObservations: "Akukho kubhaliweyo.",
    verdictQuestion: "Lujongeka njani olu hlolo?", verdictFine: "Yonke into ilungile",
    verdictConcerns: "Kukho inkxalabo", notesLabel: "Amanqaku (ukhetho)",
    notesPlaceholder: "Nantoni na ofuna ukuyibhala...",
    shareWith: "Yabelana ngesiphumo no", shareParent: "Umzali / Umgcini", shareHeadmistress: "Inqununu",
    recipientName: "Igama", recipientEmail: "I-imeyile",
    saveReview: "Gcina Uphononongo", saving: "Iyagcina…", shareAndSave: "Gcina & Yabelana",
    reviewSaved: "Uphononongo lugciniwe", reviewSharedWith: "Yabelwane no",
    reviewSavedSub: "Isiphumo sibhaliwe.",
    done: "Kugqityiwe", markedReviewed: "Kuphononongiwe", awaitingReview: "Kulindele uphononongo",
    loadingScreening: "Ilayisha uhlolo…",
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

const bandLabels = {
  on_track: "On Track",
  progressing: "Progressing",
  concerns: "Developmental Concerns",
};
 
const NAV_ICONS = {
  home: <svg viewBox="0 0 16 16" fill="none"><path d="M2 7l6-5 6 5v7a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  followUps: <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2.5" width="12" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M2 6h12M5.5 1v3M10.5 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  dashboard: <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5" /><rect x="9" y="1" width="6" height="6" rx="1.5" /><rect x="1" y="9" width="6" height="6" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1.5" /></svg>,
  profile: <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  notifications: <svg viewBox="0 0 16 16" fill="none"><path d="M4 6a4 4 0 018 0c0 3.5 1.2 4.5 1.2 4.5H2.8S4 9.5 4 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M6.5 13a1.7 1.7 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
};
 

// Sidebar shortcuts to the Puzzle Box Training / Buy pages (see MemberArea.js).
// Labels are English-only for now — the rest of this screen is translated.
const MEMBER_ICONS = {
  training: <svg viewBox="0 0 16 16" fill="none"><path d="M1.5 5.5L8 2.5l6.5 3L8 8.5l-6.5-3zM4 7.2V10c0 1 1.8 2 4 2s4-1 4-2V7.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  buy: <svg viewBox="0 0 16 16" fill="none"><path d="M2 2.5h1.7l1.3 7h7l1.2-4.8H4.4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /><circle cx="6" cy="13" r="1" fill="currentColor" /><circle cx="11" cy="13" r="1" fill="currentColor" /></svg>,
};

function memberNavItems(onOpenMember) {
  if (!onOpenMember) return [];
  return [
    { id: "member-training", label: "Training", section: "The Puzzle Box", icon: MEMBER_ICONS.training, onClick: () => onOpenMember("training") },
    { id: "member-buy", label: "Buy The Puzzle Box Screener", section: "The Puzzle Box", icon: MEMBER_ICONS.buy, onClick: () => onOpenMember("purchase") },
  ];
}

export default function PsychologistHome({ user, profile, onOpenMember }) {
  const [activePage, setActivePage] = useState("home");
  const [lang, setLang] = useState("en");
  const [children, setChildren] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // ── Screening review notifications ──────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [reviewing, setReviewing] = useState(null); // the notification (message row) open in the review modal
  const [reviewScreening, setReviewScreening] = useState(null); // the full puzzlebox_screenings row for it
  const [loadingReview, setLoadingReview] = useState(false);
  const [verdict, setVerdict] = useState(null); // 'fine' | 'concerns'
  const [reviewNotes, setReviewNotes] = useState("");
  const [shareParent, setShareParent] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [shareHead, setShareHead] = useState(false);
  const [headName, setHeadName] = useState("");
  const [headEmail, setHeadEmail] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(null); // { sharedWith: [...] } once saved
 
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
    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("recipient_role", "psychologist")
        .eq("message_type", "screening_ready_for_review")
        .order("sent_at", { ascending: false })
        .limit(50);
      if (error) { console.error("Error loading notifications:", error); return; }
      if (isMounted) setNotifications(data.map(mapMessageRow));
    };

    loadChildren();
    loadFollowUps();
    loadMessageCount();
    loadNotifications();

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
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        loadMessageCount();
        loadNotifications();
      })
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
  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

  // ── Screening review workflow ────────────────────────────────────
  const openReview = async (notification) => {
    setReviewing(notification);
    setReviewScreening(null);
    setLoadingReview(true);
    setVerdict(null);
    setReviewNotes("");
    setShareParent(false); setParentName(""); setParentEmail("");
    setShareHead(false); setHeadName(""); setHeadEmail("");
    setReviewSaved(null);

    if (!notification.readAt) {
      supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", notification.id)
        .then(() => setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))));
    }

    if (notification.screeningId) {
      const { data, error } = await supabase.from("puzzlebox_screenings").select("*").eq("id", notification.screeningId).single();
      if (!error && data) {
        const mapped = mapPuzzleboxScreeningRow(data);
        setReviewScreening(mapped);
        if (mapped.reviewVerdict) setVerdict(mapped.reviewVerdict);
        if (mapped.reviewNotes) setReviewNotes(mapped.reviewNotes);
      }
    }
    setLoadingReview(false);
  };

  const closeReview = () => {
    setReviewing(null);
    setReviewScreening(null);
    setReviewSaved(null);
  };

  const submitReview = async () => {
    if (!verdict || !reviewScreening) return;
    if (shareParent && !parentEmail) return;
    if (shareHead && !headEmail) return;

    setSavingReview(true);
    try {
      const recipients = [];
      if (shareParent) recipients.push({ role: "parent", name: parentName, email: parentEmail, label: t.shareParent });
      if (shareHead) recipients.push({ role: "headmistress", name: headName, email: headEmail, label: t.shareHeadmistress });

      const nowIso = new Date().toISOString();
      const sharedWith = [
        ...(reviewScreening.sharedWith || []),
        ...recipients.map((r) => ({ role: r.role, name: r.name, email: r.email, sharedAt: nowIso })),
      ];

      const { error: updateErr } = await supabase
        .from("puzzlebox_screenings")
        .update({
          review_verdict: verdict,
          review_notes: reviewNotes,
          status: "reviewed",
          reviewed_at: nowIso,
          reviewed_by: user?.email || "",
          shared_with: sharedWith,
        })
        .eq("id", reviewScreening.id);
      if (updateErr) throw updateErr;

      if (recipients.length > 0) {
        const verdictLabel = verdict === "fine" ? t.verdictFine : t.verdictConcerns;
        const body =
          `${reviewScreening.childName}'s PuzzleBox screening has been reviewed. Outcome: ${verdictLabel}.` +
          (reviewNotes ? ` ${reviewNotes}` : "");
        const { error: insertErr } = await supabase.from("messages").insert(
          recipients.map((r) => ({
            screening_id: reviewScreening.id,
            child_id: reviewScreening.childId,
            child_name: reviewScreening.childName,
            school: reviewScreening.school,
            recipient_role: r.role,
            recipient_email: r.email,
            recipient_name: r.name,
            diagnosis: body,
            sent_by: "Psychologist",
            message_type: "review_verdict",
          }))
        );
        if (insertErr) throw insertErr;
      }

      setReviewSaved({ sharedWith: recipients.map((r) => r.label) });
    } catch (err) {
      console.error("Could not save the review:", err.message);
    } finally {
      setSavingReview(false);
    }
  };

  const filteredFollowUps = followUps.filter((f) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return f.childName?.toLowerCase().includes(s) || f.school?.toLowerCase().includes(s);
  });
 
  const navItems = [
    { id: "home", label: t.navHome, section: t.section1, icon: NAV_ICONS.home },
    {
      id: "notifications",
      label: (
        <>
          {t.navNotifications}
          {unreadNotifications > 0 && <span className="nav-badge">{unreadNotifications}</span>}
        </>
      ),
      section: t.section1,
      icon: NAV_ICONS.notifications,
    },
    { id: "followups", label: t.navFollowUps, section: t.section2, icon: NAV_ICONS.followUps },
    { id: "dashboard", label: t.navDashboard, section: t.section2, icon: NAV_ICONS.dashboard },
    { id: "profile", label: t.navProfile, section: t.section3, icon: NAV_ICONS.profile },
    ...memberNavItems(onOpenMember),
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
              {activePage === "notifications" && t.navNotifications}
            </div>
            <div className="page-sub">
              {activePage === "followups" && t.followUpsSub}
              {activePage === "profile" && t.profileSub}
              {activePage === "notifications" && t.notifSub}
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
              <StatRing value={notifications.length} max={10} color="#fff" label={t.needsReview} />
              <StatRing value={followUps.length} max={10} color="#fff" label={t.statFollowUps} />
              <StatRing value={messageCount} max={10} color="#fff" label={t.statMessages} />
            </RoleHero>
 
            <div className="rh-home-grid">
              <div>
                <TodayList
                  title={t.needsReview}
                  actionLabel={t.viewAll}
                  onAction={() => setActivePage("notifications")}
                  emptyIcon="📝"
                  emptyTitle={t.noNotifications}
                  emptySub={t.noNotificationsSub}
                  onItemClick={(n) => openReview(n)}
                  items={loading ? null : notifications.slice(0, 5).map((n) => ({
                    icon: "📝", color: n.readAt ? "#8888a8" : "#009B8D",
                    title: n.childName, meta: `${n.school || ""} · ${n.teacherName || n.teacherEmail || ""}`.replace(/^ · /, ""),
                    badge: n.readAt ? undefined : "New",
                  }))}
                />
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

        {activePage === "notifications" && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-title">{t.noNotifications}</div>
                <div className="empty-state-sub">{t.noNotificationsSub}</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => openReview(n)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                    borderBottom: "1px solid var(--border)", cursor: "pointer",
                    background: n.readAt ? "transparent" : "var(--teal-lt)",
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: n.readAt ? "var(--surface)" : "var(--teal)",
                    color: n.readAt ? "var(--ink-faint)" : "#fff", fontSize: 16,
                  }}>📝</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>{n.childName}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                      {[n.school, n.teacherName || n.teacherEmail].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", flexShrink: 0 }}>
                    {n.sentAt ? new Date(n.sentAt).toLocaleDateString() : ""}
                  </div>
                  {!n.readAt && <span className="pill pill-teal">New</span>}
                </div>
              ))
            )}
          </div>
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
      {/* SCREENING REVIEW MODAL */}
      {reviewing && (
        <div className="modal-overlay" onClick={() => !savingReview && closeReview()}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{t.reviewTitle}</div>
              <button className="modal-close" onClick={closeReview}>✕</button>
            </div>

            {loadingReview || !reviewScreening ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>
                {t.loadingScreening}
              </div>
            ) : reviewSaved ? (
              <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: "Nunito", fontSize: 19, fontWeight: 900, color: "var(--ink)", marginBottom: 6 }}>{t.reviewSaved}</div>
                <div style={{ fontSize: 13, color: "var(--ink-faint)", marginBottom: 20 }}>{t.reviewSavedSub}</div>
                {reviewSaved.sharedWith.length > 0 && (
                  <div style={{ padding: "12px 16px", background: "var(--teal-lt)", borderRadius: 12, fontSize: 12, color: "var(--teal)", fontWeight: 600, marginBottom: 20, textAlign: "left" }}>
                    {reviewSaved.sharedWith.map((label, i) => <div key={i}>📤 {t.reviewSharedWith}: {label}</div>)}
                  </div>
                )}
                <button className="btn btn-teal" style={{ width: "100%" }} onClick={closeReview}>{t.done}</button>
              </div>
            ) : (
              <>
                <div style={{ padding: "12px 16px", background: "var(--surface)", borderRadius: 12, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>{reviewScreening.childName}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-mid)" }}>{reviewScreening.school}</div>
                  </div>
                  <span className="pill pill-teal">{t.awaitingReview}</span>
                </div>

                <div className="report-section" style={{ marginBottom: 18 }}>
                  <div className="report-row">
                    <span className="report-row-label">{t.submittedBy}</span>
                    <span className="report-row-value">{reviewScreening.teacherName || reviewScreening.teacherEmail}</span>
                  </div>
                  <div className="report-row">
                    <span className="report-row-label">{t.rawScoreLabel}</span>
                    <span className="report-row-value">{reviewScreening.rawScore ?? "—"}</span>
                  </div>
                  <div className="report-row">
                    <span className="report-row-label">{t.resultBand}</span>
                    <span className="report-row-value">{bandLabels[reviewScreening.interpretationBand] || reviewScreening.interpretationBand || "—"}</span>
                  </div>
                  <div className="report-row">
                    <span className="report-row-label">{t.observationsLabel}</span>
                    <span className="report-row-value">{reviewScreening.observations || t.noObservations}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 8 }}>
                    {t.verdictQuestion}
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setVerdict("fine")}
                      style={{
                        flex: 1, padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        border: verdict === "fine" ? "2px solid var(--teal)" : "1.5px solid var(--border)",
                        background: verdict === "fine" ? "var(--teal-lt)" : "#fff", fontWeight: 700, fontSize: 13,
                        color: verdict === "fine" ? "var(--teal)" : "var(--ink)",
                      }}
                    >
                      ✓ {t.verdictFine}
                    </button>
                    <button
                      onClick={() => setVerdict("concerns")}
                      style={{
                        flex: 1, padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        border: verdict === "concerns" ? "2px solid var(--pink)" : "1.5px solid var(--border)",
                        background: verdict === "concerns" ? "var(--pink-lt)" : "#fff", fontWeight: 700, fontSize: 13,
                        color: verdict === "concerns" ? "var(--pink)" : "var(--ink)",
                      }}
                    >
                      ⚑ {t.verdictConcerns}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 8 }}>
                    {t.notesLabel}
                  </label>
                  <textarea
                    style={{ width: "100%", padding: 12, border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontFamily: "inherit", minHeight: 80, resize: "vertical", outline: "none", lineHeight: 1.6 }}
                    placeholder={t.notesPlaceholder}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 8 }}>
                    {t.shareWith}
                  </label>

                  <div style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: 12, marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      <input type="checkbox" checked={shareParent} onChange={(e) => setShareParent(e.target.checked)} />
                      {t.shareParent}
                    </label>
                    {shareParent && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                        <input
                          style={{ padding: "9px 10px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none" }}
                          placeholder={t.recipientName} value={parentName} onChange={(e) => setParentName(e.target.value)}
                        />
                        <input
                          style={{ padding: "9px 10px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none" }}
                          placeholder={t.recipientEmail} type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      <input type="checkbox" checked={shareHead} onChange={(e) => setShareHead(e.target.checked)} />
                      {t.shareHeadmistress}
                    </label>
                    {shareHead && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                        <input
                          style={{ padding: "9px 10px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none" }}
                          placeholder={t.recipientName} value={headName} onChange={(e) => setHeadName(e.target.value)}
                        />
                        <input
                          style={{ padding: "9px 10px", border: "1.5px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none" }}
                          placeholder={t.recipientEmail} type="email" value={headEmail} onChange={(e) => setHeadEmail(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={closeReview} disabled={savingReview}>{t.close}</button>
                  <button
                    className="btn btn-primary"
                    onClick={submitReview}
                    disabled={
                      savingReview || !verdict ||
                      (shareParent && !parentEmail) ||
                      (shareHead && !headEmail)
                    }
                  >
                    {savingReview ? t.saving : (shareParent || shareHead) ? t.shareAndSave : t.saveReview}
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