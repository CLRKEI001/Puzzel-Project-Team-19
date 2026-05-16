
// It is the entire Children page 
// handles viewing a child's details in a modal and then adding the new children to Firebase/database,
// It talks directly to Firebase Firestore for all its data operations.

import React, { useState, useEffect } from "react";
import { db } from "../firebase";  // db is our Firestore database connection from firebase.js

import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

// TFirestore functions that component needs:
// collection   — points to a collection/a table in the database
// addDoc       — adds a new document/ row to a collection
// serverTimestamp — inserts the current server time automatically
// getDocs      — fetches all documents from a query once
// query        — builds a database query with filters
// where        — adds a filter condition to a query
// updateDoc    — updates specific fields in an existing document without replacing the whole thing
// deleteDoc    — permanently deletes a document from the database
// doc          — points to a specific single document by its ID
// onSnapshot   — sets up a real-time listener that fires every time data changes in Firebase,
//                so your UI updates live without needing to refresh the page



// T is an object containing all the text strings used in this component
// The component receives a lang prop ("en", "af", or "xh") and uses
// const t = T[lang] to get the right language object.
//  writes t.search
// which automatically returns the right translation for the active language.

const T = {
  en: {
    search: "Search by name or school...", filterStatus: "All Stages",
    showing: "Showing", of: "of", children: "children",
    childName: "Child Name", screeningStage: "Stage", actions: "Actions", view: "View",
    addSession: "Add New Child", childDetail: "Child Detail",
    school: "School", province: "Province", age: "Age", gender: "Gender",
    language: "Language", date: "Date of Assessment", examiner: "Examiner",
    noResults: "No children found", noResultsSub: "Try adjusting your search or filters",
    stage1: "Not Started", stage2: "Registered", stage3: "Processing", stage4: "Completed",
    consentForm: "Consent Form", downloadConsent: "Download Consent Form",
    consentSigned: "Consent Signed", consentNote: "Parental consent form on file.",
    uploadConsent: "Upload Consent Form (PDF or Image)",
    save: "Save", cancel: "Cancel",
    childNameLabel: "Child ID", schoolLabel: "School", ageLabel: "Age",
    genderLabel: "Gender", langLabel: "Language", dateLabel: "Date",
    examinerLabel: "Examiner", stageLabel: "Stage", provinceLabel: "Province",
    deleteChild: "Delete Child Record",
    deleteConfirm: "Are you sure you want to delete this child record? This cannot be undone.",
    deleteFollowUp: "Remove Follow-up",
    duplicateWarning: "A child with this name already exists",
    duplicateDetail: "already exists in the database. Please check before adding.",
    scheduleFollowUp: "Schedule Follow-up Appointment",
    followUpDate: "Follow-up Date", followUpPsych: "Assigned Psychologist",
    followUpReason: "Reason for Follow-up", followUpType: "Follow-up Status",
    saveAppointment: "Save Appointment",
    followUpSaved: "Follow-up appointment saved successfully",
    followUpDeleted: "Follow-up removed successfully",
    noFollowUp: "No follow-up scheduled",
    existingFollowUp: "Existing Follow-up",
    fu1: "Not Required", fu2: "Awaiting First Follow-up",
    fu3: "Follow-up In Progress", fu4: "Follow-up Completed",
    fu5: "Referred to Specialist", fu6: "Pending Parent Response",
  },
  af: {
    search: "Soek op naam of skool...", filterStatus: "Alle Stadiums",
    showing: "Wys", of: "van", children: "kinders",
    childName: "Kind Naam", screeningStage: "Stadium", actions: "Aksies", view: "Sien",
    addSession: "Voeg Kind By", childDetail: "Kind Detail",
    school: "Skool", province: "Provinsie", age: "Ouderdom", gender: "Geslag",
    language: "Taal", date: "Datum", examiner: "Ondersoeker",
    noResults: "Geen kinders", noResultsSub: "Probeer aanpas",
    stage1: "Nie Begin", stage2: "Geregistreer", stage3: "Verwerking", stage4: "Voltooi",
    consentForm: "Toestemmingsvorm", downloadConsent: "Laai Af",
    consentSigned: "Geteken", consentNote: "Toestemmingsvorm op lêer.",
    uploadConsent: "Laai Toestemmingsvorm Op",
    save: "Stoor", cancel: "Kanselleer",
    childNameLabel: "Kind ID", schoolLabel: "Skool", ageLabel: "Ouderdom",
    genderLabel: "Geslag", langLabel: "Taal", dateLabel: "Datum",
    examinerLabel: "Ondersoeker", stageLabel: "Stadium", provinceLabel: "Provinsie",
    deleteChild: "Verwyder Kind Rekord",
    deleteConfirm: "Is jy seker? Dit kan nie ontdoen word nie.",
    deleteFollowUp: "Verwyder Opvolg",
    duplicateWarning: "Hierdie kind bestaan reeds",
    duplicateDetail: "bestaan reeds in die databasis.",
    scheduleFollowUp: "Skeduleer Opvolg",
    followUpDate: "Opvolgdatum", followUpPsych: "Toegewysde Sielkundige",
    followUpReason: "Rede vir Opvolg", followUpType: "Opvolg Status",
    saveAppointment: "Stoor Afspraak",
    followUpSaved: "Opvolg suksesvol gestoor",
    followUpDeleted: "Opvolg verwyder",
    noFollowUp: "Geen opvolg geskeduleer",
    existingFollowUp: "Bestaande Opvolg",
    fu1: "Nie Nodig", fu2: "Wag op Eerste Opvolg",
    fu3: "Opvolg aan die Gang", fu4: "Opvolg Voltooi",
    fu5: "Verwys na Spesialis", fu6: "Wag op Ouer Reaksie",
  },
  xh: {
    search: "Khangela ngegama...", filterStatus: "Zonke iziGaba",
    showing: "Ibonisa", of: "kwi", children: "abantwana",
    childName: "Igama loMntwana", screeningStage: "Isigaba", actions: "Izenzo", view: "Jonga",
    addSession: "Yongeza Umntwana", childDetail: "Iinkcukacha",
    school: "Isikolo", province: "Isifundazwe", age: "Iminyaka", gender: "Isini",
    language: "Ulwimi", date: "Umhla", examiner: "Umhloli",
    noResults: "Akufumaneki", noResultsSub: "Zama ukuguqula",
    stage1: "Akuqalanga", stage2: "Ibhaliswe", stage3: "Iyacutshungulwa", stage4: "Iphelile",
    consentForm: "Ifomu Lomvume", downloadConsent: "Khuphela",
    consentSigned: "Usayinwe", consentNote: "Ifomu lomvume likho.",
    uploadConsent: "Layisha Ifomu Lomvume",
    save: "Gcina", cancel: "Rhoxisa",
    childNameLabel: "ID yoMntwana", schoolLabel: "Isikolo", ageLabel: "Iminyaka",
    genderLabel: "Isini", langLabel: "Ulwimi", dateLabel: "Umhla",
    examinerLabel: "Umhloli", stageLabel: "Isigaba", provinceLabel: "Isifundazwe",
    deleteChild: "Cima Irekhodi loMntwana",
    deleteConfirm: "Uqinisekile? Oku akunakubuyelwa.",
    deleteFollowUp: "Susa Ukulandelwa",
    duplicateWarning: "Lo mntwana usele ukho",
    duplicateDetail: "usele ukho kwidatabase.",
    scheduleFollowUp: "Misela Ukulandelwa",
    followUpDate: "Umhla Wokulandelwa", followUpPsych: "Isazi Sengqondo",
    followUpReason: "Isizathu", followUpType: "Imeko Yokulandelwa",
    saveAppointment: "Gcina Isigqibo",
    followUpSaved: "Ukulandelwa kugcinwe",
    followUpDeleted: "Ukulandelwa kususiwe",
    noFollowUp: "Akukho kulandelwa okumiselweyo",
    existingFollowUp: "Ukulandelwa okukhona",
    fu1: "Akufunekanga", fu2: "IlindeleOkulandelwa Kokuqala",
    fu3: "Ukulandelwa Kuyaqhuba", fu4: "Ukulandelwa Kuphelile",
    fu5: "Kuthunyelwe kochwephesha", fu6: "Ilindele Impendulo Yomzali",
  }
};
 
// The six possible follow-up status keys. They are used to loop through and build the dropdown options
const FOLLOW_UP_OPTIONS = ["fu1", "fu2", "fu3", "fu4", "fu5", "fu6"];
 
// Each follow-up status key maps to a background colour and text colour.
//  colour the follow-up status pill in the UI.
// Instead of writing if/else for every status, you just do followUpColors[status]

const followUpColors = {
  fu1: { bg: "#F7F6FF", color: "#8888a8" },  // Grey — not required
  fu2: { bg: "#FEF0E7", color: "#F26522" },  // Orange — awaiting
  fu3: { bg: "#FCE6EE", color: "#E8175D" },   // Pink — in progress
  fu4: { bg: "#E0F5F3", color: "#009B8D" },   // Teal — completed
  fu5: { bg: "#F0E8F7", color: "#6B2F8A" },   // Purple — referred
  fu6: { bg: "#FEF0E7", color: "#F26522" },    // Orange — pending parent
};

// four screening stage keys — used to colour the stage pills in the table
//session stage 
const stageColors = {
  stage1: { bg: "#F0EDF8", color: "#6B2F8A" },  // Purple — not started
  stage2: { bg: "#FEF0E7", color: "#F26522" },  // Orange — registered 
  stage3: { bg: "#FCE6EE", color: "#E8175D" },  // Pink — processing
  stage4: { bg: "#E0F5F3", color: "#009B8D" },   // Teal — completed
};

// Reusable inline style objects for form inputs and labels.
// Defining them here once and reusing them throughout the JSX below avoids  repeating the same style block on every single input field in the forms.
const inputStyle = { width: "100%", padding: "9px 12px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" };
const labelStyle = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--ink-mid)", display: "block", marginBottom: 5 };
 

// This component receives two props from Dashboard.js:
// children — the array of child objects fetched from Firebase, passed down from the parent
// lang — the currently active language string ("en", "af", or "xh"), also from the parent
// Props are how parent components pass data down to child components in React.

export default function ChildrenTable({ children, lang }) {
  // t is set once at the top — from this point on, t.search, t.save etc
  // automatically return the right text for whatever language is active

  // STATE VARIABLES
  // Every piece of data that can change and needs to trigger a screen redraw
  // is stored in useState. The pattern is always:
  // const [value, setValue] = useState(initialValue)
  // always call setValue(newValue)
  // and React automatically redraws the parts of the screen that use it.
  const t = T[lang];
  const [search, setSearch] = useState("");  // Current text in the search input
  const [stageFilter, setStageFilter] = useState("");  // Currently selected stage filter dropdown value
  const [selected, setSelected] = useState(null);     // The child object currently open in the view modal, or null if no modal is open
  const [consentView, setConsentView] = useState(false);   // Whether the modal is showing the Details tab (false) or Consent Form tab (true)
  const [showAdd, setShowAdd] = useState(false);      // Whether the Add New Child modal is open
  const [uploadedFile, setUploadedFile] = useState(null);       // The raw File object from the file input
  const [uploadedFileURL, setUploadedFileURL] = useState(null); // A temporary browser URL created from the uploaded file for preview
  const [uploadedFileType, setUploadedFileType] = useState(null); // The MIME type of the uploaded file 
  const [consentFiles, setConsentFiles] = useState({}); // An object mapping child IDs to their uploaded consent file data, stored in memory only
  const [showFollowUp, setShowFollowUp] = useState(false);   // Whether the follow-up scheduling form is expanded inside the modal
  const [followUpDate, setFollowUpDate] = useState("");       // Date value typed into the follow-up date field
  const [followUpPsych, setFollowUpPsych] = useState("");     // Psychologist name typed into the follow-up form
  const [followUpReason, setFollowUpReason] = useState("");   // Reason text typed into the follow-up form
  const [followUpType, setFollowUpType] = useState("fu2");    // Currently selected follow-up status from the dropdown
  const [followUpSaved, setFollowUpSaved] = useState(false);  // Whether to show the green success message after saving a follow-up
  const [existingFollowUp, setExistingFollowUp] = useState(null); // The follow-up document from Firebase for the currently selected child, or null
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Whether the delete confirmation panel is showing
  const [duplicateWarning, setDuplicateWarning] = useState(false);   // Whether to show the duplicate name warning in the add form
  const [followUps, setFollowUps] = useState({});  // A live map of all follow-ups from Firebase — keyed by child name for fast lookup

  // The form data object for the Add New Child form.
  // All fields live together in one state object rather than separate useState calls.
  // When any field changes, the spread operator  copies all existing
  // fields and then the new value overwrites just the one that changed.
  
  const [newChild, setNewChild] = useState({
    name: "", school: "", province: "Eastern Cape", age: "", gender: "Female",
    language: "English", date: "", examiner: "", stage: "stage1", flagged: false,
    total: 0, status: "Progressing"
  });
 
  // REAL-TIME FIREBASE LISTENER FOR FOLLOW-UPS
  // onSnapshot subscribes to the entire followUps collection in Firestore.
  // Every time any follow-up document is created, updated, or deleted in Firebase
  // this callback fires automatically with the new data 
  // snap.docs is the array of all documents returned.
  // We use childName so that later we can instantly check
  // if a child has a follow-up by doing followUps[child.name] in O(1) time.
  
  // The empty [] dependency array means this runs once when the component first loads.

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "followUps"), (snap) => {
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        map[data.childName] = { ...data, docId: d.id };  // Key the follow-up by childName so we can look it up instantly
      });
      setFollowUps(map);
    });
    return () => unsub();
  }, []);
 
  // When a child is selected, load their follow-up
  useEffect(() => {
    if (selected) {
      setExistingFollowUp(followUps[selected.name] || null);
    }
  }, [selected, followUps]);
 
  const filtered = children.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.school?.toLowerCase().includes(search.toLowerCase());
    const matchStage = !stageFilter || (c.stage || "stage4") === stageFilter;
    return matchSearch && matchStage;
  });
 
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedFileURL(URL.createObjectURL(file));
    setUploadedFileType(file.type);
  };
 
  const handleSaveConsent = () => {
    if (selected && uploadedFileURL) {
      setConsentFiles(prev => ({
        ...prev,
        [selected.id || selected.name]: { url: uploadedFileURL, type: uploadedFileType, name: uploadedFile.name }
      }));
    }
  };
 
  const handleAddChild = async () => {
    if (!newChild.name || !newChild.school) return;
    // Check for duplicate
    const q = query(collection(db, "children"), where("name", "==", newChild.name));
    const snap = await getDocs(q);
    if (!snap.empty) {
      setDuplicateWarning(true);
      return;
    }
    await addDoc(collection(db, "children"), {
      ...newChild,
      age: parseInt(newChild.age) || 5,
      createdAt: serverTimestamp()
    });
    setShowAdd(false);
    setDuplicateWarning(false);
    setNewChild({ name: "", school: "", province: "Eastern Cape", age: "", gender: "Female", language: "English", date: "", examiner: "", stage: "stage1", flagged: false, total: 0, status: "Progressing" });
  };
 
  const handleDeleteChild = async () => {
    if (!selected?.id) return;
    await deleteDoc(doc(db, "children", selected.id));
    // Also delete their follow-up if exists
    if (existingFollowUp?.docId) {
      await deleteDoc(doc(db, "followUps", existingFollowUp.docId));
    }
    setSelected(null);
    setShowDeleteConfirm(false);
  };
 
  const handleSaveFollowUp = async () => {
    if (!followUpDate || !followUpPsych) return;
 
    const followUpData = {
      childName: selected.name,
      childId: selected.id,
      school: selected.school,
      followUpDate,
      followUpPsych,
      followUpReason,
      followUpType,
      updatedAt: serverTimestamp()
    };
 
    // If existing follow-up, update it. Otherwise create new.
    if (existingFollowUp?.docId) {
      await updateDoc(doc(db, "followUps", existingFollowUp.docId), followUpData);
    } else {
      await addDoc(collection(db, "followUps"), { ...followUpData, createdAt: serverTimestamp() });
    }
 
    // Update screeningSessions to reflect follow-up status
    const q = query(collection(db, "screeningSessions"), where("childName", "==", selected.name));
    const snap = await getDocs(q);
    snap.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { followUpStage: followUpType });
    });
 
    setFollowUpSaved(true);
    setTimeout(() => {
      setShowFollowUp(false);
      setFollowUpSaved(false);
      setFollowUpDate("");
      setFollowUpPsych("");
      setFollowUpReason("");
      setFollowUpType("fu2");
    }, 1500);
  };
 
  const handleDeleteFollowUp = async () => {
    if (!existingFollowUp?.docId) return;
    await deleteDoc(doc(db, "followUps", existingFollowUp.docId));
 
    // Reset follow-up in screeningSessions
    const q = query(collection(db, "screeningSessions"), where("childName", "==", selected.name));
    const snap = await getDocs(q);
    snap.forEach(async (docSnap) => {
      await updateDoc(docSnap.ref, { followUpStage: "fu1" });
    });
    setExistingFollowUp(null);
  };
 
  const consentFile = selected ? consentFiles[selected.id || selected.name] : null;
 
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
        <button className="btn btn-primary btn-sm" onClick={() => { setShowAdd(true); setDuplicateWarning(false); }}>
          + {t.addSession}
        </button>
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
                  <th>{t.childName}</th>
                  <th>{t.screeningStage}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((child, i) => {
                  const sc = stageColors[child.stage || "stage4"];
                  const hasFollowUp = !!followUps[child.name];
                  return (
                    <tr key={child.id || i}>
                      <td>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{child.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{child.school}</div>
                        {hasFollowUp && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "var(--teal-lt)", color: "var(--teal)", fontWeight: 700 }}>
                               Follow-up Set
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {t[child.stage || "stage4"]}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-teal btn-sm" onClick={() => {
                          setSelected(child);
                          setConsentView(false);
                          setShowFollowUp(false);
                          setShowDeleteConfirm(false);
                          setUploadedFile(null);
                          setUploadedFileURL(null);
                        }}>
                          {t.view}
                        </button>
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
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.name}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
 
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button className={`btn btn-sm ${!consentView ? "btn-teal" : "btn-ghost"}`} onClick={() => setConsentView(false)}>
                📋 {t.childDetail}
              </button>
              <button className={`btn btn-sm ${consentView ? "btn-teal" : "btn-ghost"}`} onClick={() => setConsentView(true)}>
                📄 {t.consentForm}
              </button>
            </div>
 
            {!consentView ? (
              <>
                <div className="report-section">
                  <div className="report-section-title">{t.childDetail}</div>
                  <div className="report-row"><span className="report-row-label">{t.school}</span><span className="report-row-value">{selected.school}</span></div>
                  <div className="report-row"><span className="report-row-label">{t.province}</span><span className="report-row-value">{selected.province}</span></div>
                  <div className="report-row"><span className="report-row-label">{t.age}</span><span className="report-row-value">{selected.age} years</span></div>
                  <div className="report-row"><span className="report-row-label">{t.gender}</span><span className="report-row-value">{selected.gender}</span></div>
                  <div className="report-row"><span className="report-row-label">{t.language}</span><span className="report-row-value">{selected.language}</span></div>
                  <div className="report-row"><span className="report-row-label">{t.examiner}</span><span className="report-row-value">{selected.examiner}</span></div>
                  <div className="report-row"><span className="report-row-label">{t.date}</span><span className="report-row-value">{selected.date}</span></div>
                  <div className="report-row">
                    <span className="report-row-label">Stage</span>
                    <span style={{ fontWeight: 700, color: stageColors[selected.stage || "stage4"]?.color }}>
                      {t[selected.stage || "stage4"]}
                    </span>
                  </div>
                </div>
 
                {/* EXISTING FOLLOW-UP */}
                {existingFollowUp && !showFollowUp && (
                  <div style={{ padding: 14, background: "var(--teal-lt)", borderRadius: 12, marginBottom: 12, border: "1px solid rgba(0,155,141,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "var(--teal)" }}> {t.existingFollowUp}</div>
                      <button
                        className="btn btn-sm"
                        style={{ background: "var(--pink-lt)", color: "var(--pink)", border: "none", fontSize: 11 }}
                        onClick={handleDeleteFollowUp}
                      >
                        🗑 {t.deleteFollowUp}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.8 }}>
                      <div><strong>Date:</strong> {existingFollowUp.followUpDate}</div>
                      <div><strong>Psychologist:</strong> {existingFollowUp.followUpPsych}</div>
                      <div><strong>Status:</strong> {t[existingFollowUp.followUpType]}</div>
                      {existingFollowUp.followUpReason && <div><strong>Reason:</strong> {existingFollowUp.followUpReason}</div>}
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: "100%" }} onClick={() => {
                      setFollowUpDate(existingFollowUp.followUpDate || "");
                      setFollowUpPsych(existingFollowUp.followUpPsych || "");
                      setFollowUpReason(existingFollowUp.followUpReason || "");
                      setFollowUpType(existingFollowUp.followUpType || "fu2");
                      setShowFollowUp(true);
                    }}>
                      ✏ Edit Follow-up
                    </button>
                  </div>
                )}
 
                {/* SCHEDULE FOLLOW-UP */}
                {!showFollowUp && !existingFollowUp && (
                  <button className="btn btn-primary" style={{ width: "100%", marginBottom: 12 }} onClick={() => setShowFollowUp(true)}>
                     {t.scheduleFollowUp}
                  </button>
                )}
 
                {showFollowUp && (
                  <div style={{ padding: 16, background: "var(--surface)", borderRadius: 12, border: "1.5px solid var(--border)", marginBottom: 12 }}>
                    <div style={{ fontFamily: "Nunito", fontSize: 14, fontWeight: 800, marginBottom: 14 }}>
                       {t.scheduleFollowUp}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>{t.followUpDate}</label>
                        <input style={inputStyle} type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t.followUpPsych}</label>
                        <input style={inputStyle} placeholder="Dr. Mokoena" value={followUpPsych} onChange={e => setFollowUpPsych(e.target.value)} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelStyle}>{t.followUpReason}</label>
                        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} placeholder="e.g. Low scores in cognitive and social domains" value={followUpReason} onChange={e => setFollowUpReason(e.target.value)} />
                      </div>
                      <div style={{ gridColumn: "span 2" }}>
                        <label style={labelStyle}>{t.followUpType}</label>
                        <select style={inputStyle} value={followUpType} onChange={e => setFollowUpType(e.target.value)}>
                          {FOLLOW_UP_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{t[opt]}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {followUpSaved && (
                      <div style={{ padding: "10px 14px", background: "var(--teal-lt)", color: "var(--teal)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                        ✓ {t.followUpSaved}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowFollowUp(false)} style={{ flex: 1 }}>{t.cancel}</button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} disabled={!followUpDate || !followUpPsych} onClick={handleSaveFollowUp}>
                        {t.saveAppointment}
                      </button>
                    </div>
                  </div>
                )}
 
                {/* DELETE CHILD */}
                {!showDeleteConfirm ? (
                  <button
                    className="btn btn-sm"
                    style={{ width: "100%", background: "var(--pink-lt)", color: "var(--pink)", border: "1px solid rgba(232,23,93,0.2)", marginTop: 4 }}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    🗑 {t.deleteChild}
                  </button>
                ) : (
                  <div style={{ padding: 14, background: "var(--pink-lt)", borderRadius: 12, border: "1px solid rgba(232,23,93,0.2)", marginTop: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pink)", marginBottom: 10 }}>{t.deleteConfirm}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>{t.cancel}</button>
                      <button className="btn btn-sm" style={{ flex: 1, background: "var(--pink)", color: "#fff", border: "none" }} onClick={handleDeleteChild}>
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ padding: "14px 16px", background: consentFile ? "var(--teal-lt)" : "var(--orange-lt)", borderRadius: 12, marginBottom: 20, border: `1px solid ${consentFile ? "rgba(0,155,141,0.2)" : "rgba(242,101,34,0.2)"}` }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: consentFile ? "var(--teal)" : "var(--orange)", marginBottom: 4 }}>
                    {consentFile ? `✓ ${t.consentSigned}` : "⚠ No Consent Form Yet"}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-mid)" }}>
                    {consentFile ? t.consentNote : "Upload the signed consent form below"}
                  </div>
                </div>
 
                {consentFile && (
                  <div style={{ border: "1.5px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ background: "var(--dark)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{consentFile.type.includes("pdf") ? "📄" : "🖼"}</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{consentFile.name}</span>
                    </div>
                    {consentFile.type.includes("image") ? (
                      <img src={consentFile.url} alt="Consent" style={{ width: "100%", maxHeight: 300, objectFit: "contain", background: "#fff" }} />
                    ) : (
                      <iframe src={consentFile.url} title="Consent PDF" style={{ width: "100%", height: 300, border: "none", background: "#fff" }} />
                    )}
                    <div style={{ padding: "10px 16px" }}>
                      <a href={consentFile.url} download={consentFile.name} className="btn btn-teal btn-sm" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                        ⬇ {t.downloadConsent}
                      </a>
                    </div>
                  </div>
                )}
 
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.uploadConsent}</label>
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUpload}
                    style={{ display: "block", width: "100%", padding: "10px", border: "1.5px dashed var(--border)", borderRadius: 10, fontSize: 13, cursor: "pointer", background: "#FAFAFF" }} />
                </div>
 
                {uploadedFileURL && (
                  <div style={{ border: "1.5px solid var(--teal)", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ background: "var(--teal-lt)", padding: "8px 16px", fontSize: 12, fontWeight: 700, color: "var(--teal)" }}>
                      Preview: {uploadedFile.name}
                    </div>
                    {uploadedFileType?.includes("image") ? (
                      <img src={uploadedFileURL} alt="Preview" style={{ width: "100%", maxHeight: 250, objectFit: "contain", background: "#fff" }} />
                    ) : (
                      <iframe src={uploadedFileURL} title="PDF Preview" style={{ width: "100%", height: 250, border: "none", background: "#fff" }} />
                    )}
                    <div style={{ padding: "10px 16px" }}>
                      <button className="btn btn-teal" style={{ width: "100%" }} onClick={handleSaveConsent}>✓ Save Consent Form</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
 
      {/* ADD NEW CHILD MODAL */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{t.addSession}</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
 
            {duplicateWarning && (
              <div style={{ padding: "10px 14px", background: "var(--pink-lt)", color: "var(--pink)", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                ⚠ {t.duplicateWarning} — "{newChild.name}" {t.duplicateDetail}
              </div>
            )}
 
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>{t.childNameLabel}</label>
                <input style={inputStyle} placeholder="Child PB-016" value={newChild.name} onChange={e => { setNewChild({ ...newChild, name: e.target.value }); setDuplicateWarning(false); }} />
              </div>
              <div>
                <label style={labelStyle}>{t.schoolLabel}</label>
                <input style={inputStyle} placeholder="School name" value={newChild.school} onChange={e => setNewChild({ ...newChild, school: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>{t.provinceLabel}</label>
                <input style={inputStyle} placeholder="Eastern Cape" value={newChild.province} onChange={e => setNewChild({ ...newChild, province: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>{t.ageLabel}</label>
                <input style={inputStyle} type="number" placeholder="5" value={newChild.age} onChange={e => setNewChild({ ...newChild, age: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>{t.genderLabel}</label>
                <select style={inputStyle} value={newChild.gender} onChange={e => setNewChild({ ...newChild, gender: e.target.value })}>
                  <option>Female</option><option>Male</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t.langLabel}</label>
                <select style={inputStyle} value={newChild.language} onChange={e => setNewChild({ ...newChild, language: e.target.value })}>
                  <option>English</option><option>Afrikaans</option><option>isiXhosa</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t.examinerLabel}</label>
                <input style={inputStyle} placeholder="Dr. Mokoena" value={newChild.examiner} onChange={e => setNewChild({ ...newChild, examiner: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>{t.dateLabel}</label>
                <input style={inputStyle} type="date" value={newChild.date} onChange={e => setNewChild({ ...newChild, date: e.target.value })} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>{t.stageLabel}</label>
                <select style={inputStyle} value={newChild.stage} onChange={e => setNewChild({ ...newChild, stage: e.target.value })}>
                  <option value="stage1">{t.stage1}</option>
                  <option value="stage2">{t.stage2}</option>
                  <option value="stage3">{t.stage3}</option>
                  <option value="stage4">{t.stage4}</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleAddChild} disabled={!newChild.name || !newChild.school}>{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 