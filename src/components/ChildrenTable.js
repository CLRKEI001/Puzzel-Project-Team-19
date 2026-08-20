// ChildrenTable.jsx
// Handles viewing, editing, adding and deleting children,
// consent forms and follow-up appointments.
//
// Uses Supabase/Postgres for all database operations.

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { mapFollowUpRow } from "../lib/mappers";


// ============================================================
// TRANSLATIONS
// ============================================================

const T = {
  en: {
    search: "Search by name or school...",
    filterStatus: "All Stages",
    showing: "Showing",
    of: "of",
    children: "children",

    childName: "Child Name",
    screeningStage: "Stage",
    actions: "Actions",
    view: "View",

    addSession: "Add New Child",
    childDetail: "Child Detail",

    school: "School",
    province: "Province",
    age: "Age",
    gender: "Gender",
    language: "Language",
    date: "Date of Assessment",
    examiner: "Examiner",

    noResults: "No children found",
    noResultsSub: "Try adjusting your search or filters",

    stage1: "Not Started",
    stage2: "Registered",
    stage3: "Processing",
    stage4: "Completed",

    consentForm: "Consent Form",
    downloadConsent: "Download Consent Form",
    consentSigned: "Consent Signed",
    consentNote: "Parental consent form on file.",
    uploadConsent: "Upload Consent Form (PDF or Image)",

    save: "Save",
    cancel: "Cancel",

    childNameLabel: "Child ID",
    schoolLabel: "School",
    ageLabel: "Age",
    genderLabel: "Gender",
    langLabel: "Language",
    dateLabel: "Date",
    examinerLabel: "Examiner",
    stageLabel: "Stage",
    provinceLabel: "Province",

    editChild: "Edit Child",
    saveChanges: "Save Changes",
    changesSaved: "Child record updated successfully",
    editCancelled: "Changes cancelled",

    deleteChild: "Delete Child Record",
    deleteConfirm:
      "Are you sure you want to delete this child record? This cannot be undone.",

    deleteFollowUp: "Remove Follow-up",

    duplicateWarning: "A child with this name already exists",
    duplicateDetail:
      "already exists in the database. Please check before adding.",

    duplicateEditWarning: "Another child with this name already exists.",
    duplicateEditDetail:
      "Please choose a different Child ID.",

    scheduleFollowUp: "Schedule Follow-up Appointment",
    followUpDate: "Follow-up Date",
    followUpPsych: "Assigned Psychologist",
    followUpReason: "Reason for Follow-up",
    followUpType: "Follow-up Status",
    saveAppointment: "Save Appointment",

    followUpSaved: "Follow-up appointment saved successfully",
    followUpDeleted: "Follow-up removed successfully",

    noFollowUp: "No follow-up scheduled",
    existingFollowUp: "Existing Follow-up",

    fu1: "Not Required",
    fu2: "Awaiting First Follow-up",
    fu3: "Follow-up In Progress",
    fu4: "Follow-up Completed",
    fu5: "Referred to Specialist",
    fu6: "Pending Parent Response",
  },

  af: {
    search: "Soek op naam of skool...",
    filterStatus: "Alle Stadiums",
    showing: "Wys",
    of: "van",
    children: "kinders",

    childName: "Kind Naam",
    screeningStage: "Stadium",
    actions: "Aksies",
    view: "Sien",

    addSession: "Voeg Kind By",
    childDetail: "Kind Detail",

    school: "Skool",
    province: "Provinsie",
    age: "Ouderdom",
    gender: "Geslag",
    language: "Taal",
    date: "Datum",
    examiner: "Ondersoeker",

    noResults: "Geen kinders",
    noResultsSub: "Probeer aanpas",

    stage1: "Nie Begin",
    stage2: "Geregistreer",
    stage3: "Verwerking",
    stage4: "Voltooi",

    consentForm: "Toestemmingsvorm",
    downloadConsent: "Laai Af",
    consentSigned: "Geteken",
    consentNote: "Toestemmingsvorm op lêer.",
    uploadConsent: "Laai Toestemmingsvorm Op",

    save: "Stoor",
    cancel: "Kanselleer",

    childNameLabel: "Kind ID",
    schoolLabel: "Skool",
    ageLabel: "Ouderdom",
    genderLabel: "Geslag",
    langLabel: "Taal",
    dateLabel: "Datum",
    examinerLabel: "Ondersoeker",
    stageLabel: "Stadium",
    provinceLabel: "Provinsie",

    editChild: "Wysig Kind",
    saveChanges: "Stoor Veranderinge",
    changesSaved: "Kind se rekord suksesvol opgedateer",
    editCancelled: "Veranderinge gekanselleer",

    deleteChild: "Verwyder Kind Rekord",
    deleteConfirm:
      "Is jy seker? Dit kan nie ontdoen word nie.",

    deleteFollowUp: "Verwyder Opvolg",

    duplicateWarning: "Hierdie kind bestaan reeds",
    duplicateDetail:
      "bestaan reeds in die databasis.",

    duplicateEditWarning: "Nog 'n kind met hierdie naam bestaan reeds.",
    duplicateEditDetail:
      "Kies asseblief 'n ander Kind ID.",

    scheduleFollowUp: "Skeduleer Opvolg",
    followUpDate: "Opvolgdatum",
    followUpPsych: "Toegewysde Sielkundige",
    followUpReason: "Rede vir Opvolg",
    followUpType: "Opvolg Status",
    saveAppointment: "Stoor Afspraak",

    followUpSaved: "Opvolg suksesvol gestoor",
    followUpDeleted: "Opvolg verwyder",

    noFollowUp: "Geen opvolg geskeduleer",
    existingFollowUp: "Bestaande Opvolg",

    fu1: "Nie Nodig",
    fu2: "Wag op Eerste Opvolg",
    fu3: "Opvolg aan die Gang",
    fu4: "Opvolg Voltooi",
    fu5: "Verwys na Spesialis",
    fu6: "Wag op Ouer Reaksie",
  },

  xh: {
    search: "Khangela ngegama...",
    filterStatus: "Zonke iziGaba",
    showing: "Ibonisa",
    of: "kwi",
    children: "abantwana",

    childName: "Igama loMntwana",
    screeningStage: "Isigaba",
    actions: "Izenzo",
    view: "Jonga",

    addSession: "Yongeza Umntwana",
    childDetail: "Iinkcukacha",

    school: "Isikolo",
    province: "Isifundazwe",
    age: "Iminyaka",
    gender: "Isini",
    language: "Ulwimi",
    date: "Umhla",
    examiner: "Umhloli",

    noResults: "Akufumaneki",
    noResultsSub: "Zama ukuguqula",

    stage1: "Akuqalanga",
    stage2: "Ibhaliswe",
    stage3: "Iyacutshungulwa",
    stage4: "Iphelile",

    consentForm: "Ifomu Lomvume",
    downloadConsent: "Khuphela",
    consentSigned: "Usayinwe",
    consentNote: "Ifomu lomvume likho.",
    uploadConsent: "Layisha Ifomu Lomvume",

    save: "Gcina",
    cancel: "Rhoxisa",

    childNameLabel: "ID yoMntwana",
    schoolLabel: "Isikolo",
    ageLabel: "Iminyaka",
    genderLabel: "Isini",
    langLabel: "Ulwimi",
    dateLabel: "Umhla",
    examinerLabel: "Umhloli",
    stageLabel: "Isigaba",
    provinceLabel: "Isifundazwe",

    editChild: "Hlela Umntwana",
    saveChanges: "Gcina Utshintsho",
    changesSaved: "Irekhodi lomntwana lihlaziyiwe",
    editCancelled: "Utshintsho lurhoxisiwe",

    deleteChild: "Cima Irekhodi loMntwana",
    deleteConfirm:
      "Uqinisekile? Oku akunakubuyelwa.",

    deleteFollowUp: "Susa Ukulandelwa",

    duplicateWarning: "Lo mntwana usele ukho",
    duplicateDetail:
      "usele ukho kwidatabase.",

    duplicateEditWarning:
      "Omnye umntwana onale ID sele ekhona.",
    duplicateEditDetail:
      "Nceda ukhethe enye i-ID yoMntwana.",

    scheduleFollowUp: "Misela Ukulandelwa",
    followUpDate: "Umhla Wokulandelwa",
    followUpPsych: "Isazi Sengqondo",
    followUpReason: "Isizathu",
    followUpType: "Imeko Yokulandelwa",
    saveAppointment: "Gcina Isigqibo",

    followUpSaved: "Ukulandelwa kugciniwe",
    followUpDeleted: "Ukulandelwa kususiwe",

    noFollowUp: "Akukho kulandelwa okumiselweyo",
    existingFollowUp: "Ukulandelwa okukhona",

    fu1: "Akufunekanga",
    fu2: "Ilindele Ukulandelwa Kokuqala",
    fu3: "Ukulandelwa Kuyaqhuba",
    fu4: "Ukulandelwa Kuphelile",
    fu5: "Kuthunyelwe kochwephesha",
    fu6: "Ilindele Impendulo Yomzali",
  },
};


// ============================================================
// OPTIONS / COLOURS
// ============================================================

const FOLLOW_UP_OPTIONS = [
  "fu1",
  "fu2",
  "fu3",
  "fu4",
  "fu5",
  "fu6",
];

const followUpColors = {
  fu1: {
    bg: "#F7F6FF",
    color: "#8888a8",
  },
  fu2: {
    bg: "#FEF0E7",
    color: "#F26522",
  },
  fu3: {
    bg: "#FCE6EE",
    color: "#E8175D",
  },
  fu4: {
    bg: "#E0F5F3",
    color: "#009B8D",
  },
  fu5: {
    bg: "#F0E8F7",
    color: "#6B2F8A",
  },
  fu6: {
    bg: "#FEF0E7",
    color: "#F26522",
  },
};

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
  boxSizing: "border-box",
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
// COMPONENT
// ============================================================

export default function ChildrenTable({ children, lang }) {

  const t = T[lang] || T.en;


  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const [selected, setSelected] = useState(null);

  const [consentView, setConsentView] = useState(false);

  const [showAdd, setShowAdd] = useState(false);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null);
  const [uploadedFileType, setUploadedFileType] = useState(null);

  const [consentFiles, setConsentFiles] = useState({});

  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpPsych, setFollowUpPsych] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [followUpType, setFollowUpType] = useState("fu2");

  const [followUpSaved, setFollowUpSaved] = useState(false);
  const [existingFollowUp, setExistingFollowUp] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const [followUps, setFollowUps] = useState({});


  // ==========================================================
  // NEW EDIT STATE
  // ==========================================================

  // Whether the selected child is currently being edited
  const [isEditing, setIsEditing] = useState(false);

  // Holds the editable copy of the selected child's data
  const [editChild, setEditChild] = useState(null);

  // Shows duplicate warning when editing
  const [editDuplicateWarning, setEditDuplicateWarning] =
    useState(false);

  // Shows successful save message
  const [editSaved, setEditSaved] = useState(false);


  // ==========================================================
  // ADD CHILD FORM
  // ==========================================================

  const [newChild, setNewChild] = useState({
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


  // ==========================================================
  // LOAD FOLLOW-UPS
  // ==========================================================

  useEffect(() => {

    let isMounted = true;

    const loadFollowUps = async () => {

      const { data, error } = await supabase
        .from("follow_ups")
        .select("*");

      if (error) {
        console.error(
          "Error loading follow-ups:",
          error
        );
        return;
      }

      const map = {};

      data.forEach(row => {
        map[row.child_name] = mapFollowUpRow(row);
      });

      if (isMounted) {
        setFollowUps(map);
      }
    };

    loadFollowUps();


    const channel = supabase
      .channel("follow-ups-changes-children")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follow_ups",
        },
        () => {
          loadFollowUps();
        }
      )
      .subscribe();


    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };

  }, []);


  // ==========================================================
  // UPDATE EXISTING FOLLOW-UP WHEN SELECTED CHILD CHANGES
  // ==========================================================

  useEffect(() => {

    if (selected) {

      setExistingFollowUp(
        followUps[selected.name] || null
      );

    } else {

      setExistingFollowUp(null);

    }

  }, [selected, followUps]);


  // ==========================================================
  // FILTER CHILDREN
  // ==========================================================

  const filtered = children.filter(child => {

    const matchSearch =
      !search ||
      child.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      child.school
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchStage =
      !stageFilter ||
      (child.stage || "stage4") === stageFilter;

    return matchSearch && matchStage;

  });


  // ==========================================================
  // OPEN CHILD
  // ==========================================================

  const openChild = (child) => {

    setSelected(child);

    setConsentView(false);

    setShowFollowUp(false);

    setShowDeleteConfirm(false);

    setUploadedFile(null);
    setUploadedFileURL(null);
    setUploadedFileType(null);

    // Reset editing state
    setIsEditing(false);
    setEditChild(null);
    setEditDuplicateWarning(false);
    setEditSaved(false);

  };


  // ==========================================================
  // START EDITING CHILD
  // ==========================================================

  const startEditing = () => {

    if (!selected) return;

    // Make a copy so the original selected object
    // is not changed until Save Changes is clicked.
    setEditChild({
      ...selected,
    });

    setEditDuplicateWarning(false);
    setEditSaved(false);

    setIsEditing(true);

  };


  // ==========================================================
  // CANCEL EDITING
  // ==========================================================

  const cancelEditing = () => {

    setIsEditing(false);

    setEditChild(null);

    setEditDuplicateWarning(false);

    setEditSaved(false);

  };


  // ==========================================================
  // UPDATE EDIT FIELD
  // ==========================================================

  const updateEditField = (field, value) => {

    setEditChild(prev => ({
      ...prev,
      [field]: value,
    }));

    // If the user changes the name,
    // remove the duplicate warning.
    if (field === "name") {
      setEditDuplicateWarning(false);
    }

  };


  // ==========================================================
  // SAVE EDITED CHILD
  // ==========================================================

  const handleSaveEdit = async () => {

    if (!selected || !editChild) return;

    if (!editChild.name || !editChild.school) {
      return;
    }


    // --------------------------------------------------------
    // Check for another child with the same name
    // --------------------------------------------------------

    const { data: existing, error: checkError } =
      await supabase
        .from("children")
        .select("id")
        .eq("name", editChild.name)
        .neq("id", selected.id);


    if (checkError) {

      console.error(
        "Error checking duplicate child:",
        checkError
      );

      return;
    }


    if (existing && existing.length > 0) {

      setEditDuplicateWarning(true);

      return;

    }


    // --------------------------------------------------------
    // Prepare database update
    // --------------------------------------------------------

    const updateData = {
      name: editChild.name,
      school: editChild.school,
      province: editChild.province,
      age: parseInt(editChild.age) || 5,
      gender: editChild.gender,
      language: editChild.language,
      date: editChild.date,
      examiner: editChild.examiner,
      stage: editChild.stage,
      flagged: editChild.flagged ?? false,
      total: editChild.total ?? 0,
      status: editChild.status || "Progressing",
    };


    // --------------------------------------------------------
    // Update Supabase
    // --------------------------------------------------------

    const { data, error } = await supabase
      .from("children")
      .update(updateData)
      .eq("id", selected.id)
      .select()
      .single();


    if (error) {

      console.error(
        "Error updating child:",
        error
      );

      return;
    }


    // --------------------------------------------------------
    // Update local selected child
    // --------------------------------------------------------

    const updatedChild = data || {
      ...selected,
      ...updateData,
    };

    setSelected(updatedChild);

    setEditChild(updatedChild);

    setEditDuplicateWarning(false);

    setEditSaved(true);


    // Leave edit mode shortly after success
    setTimeout(() => {

      setIsEditing(false);

      setEditSaved(false);

    }, 1500);

  };


  // ==========================================================
  // FILE UPLOAD
  // ==========================================================

  const handleFileUpload = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setUploadedFile(file);

    setUploadedFileURL(
      URL.createObjectURL(file)
    );

    setUploadedFileType(file.type);

  };


  // ==========================================================
  // SAVE CONSENT
  // ==========================================================

  const handleSaveConsent = () => {

    if (selected && uploadedFileURL) {

      setConsentFiles(prev => ({
        ...prev,

        [selected.id || selected.name]: {
          url: uploadedFileURL,
          type: uploadedFileType,
          name: uploadedFile.name,
        },

      }));

    }

  };


  // ==========================================================
  // ADD CHILD
  // ==========================================================

  const handleAddChild = async () => {

    if (!newChild.name || !newChild.school) {
      return;
    }


    const { data: existing, error: checkError } =
      await supabase
        .from("children")
        .select("id")
        .eq("name", newChild.name);


    if (checkError) {

      console.error(
        "Error checking for duplicate child:",
        checkError
      );

      return;
    }


    if (existing.length > 0) {

      setDuplicateWarning(true);

      return;

    }


    const { error: insertError } =
      await supabase
        .from("children")
        .insert({
          ...newChild,
          age: parseInt(newChild.age) || 5,
        });


    if (insertError) {

      console.error(
        "Error adding child:",
        insertError
      );

      return;

    }


    setShowAdd(false);

    setDuplicateWarning(false);

    setNewChild({
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


  // ==========================================================
  // DELETE CHILD
  // ==========================================================

  const handleDeleteChild = async () => {

    if (!selected?.id) return;


    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", selected.id);


    if (error) {

      console.error(
        "Error deleting child:",
        error
      );

      return;

    }


    // Delete associated follow-up
    if (existingFollowUp?.docId) {

      const { error: fuError } =
        await supabase
          .from("follow_ups")
          .delete()
          .eq("id", existingFollowUp.docId);


      if (fuError) {

        console.error(
          "Error deleting follow-up:",
          fuError
        );

      }

    }


    setSelected(null);

    setShowDeleteConfirm(false);

  };


  // ==========================================================
  // SAVE FOLLOW-UP
  // ==========================================================

  const handleSaveFollowUp = async () => {

    if (!followUpDate || !followUpPsych) {
      return;
    }


    const followUpData = {

      child_name: selected.name,

      child_id: selected.id,

      school: selected.school,

      follow_up_date: followUpDate,

      follow_up_psych: followUpPsych,

      follow_up_reason: followUpReason,

      follow_up_type: followUpType,

      updated_at: new Date().toISOString(),

    };


    if (existingFollowUp?.docId) {

      const { error } =
        await supabase
          .from("follow_ups")
          .update(followUpData)
          .eq("id", existingFollowUp.docId);


      if (error) {

        console.error(
          "Error updating follow-up:",
          error
        );

        return;

      }

    } else {

      const { error } =
        await supabase
          .from("follow_ups")
          .insert(followUpData);


      if (error) {

        console.error(
          "Error creating follow-up:",
          error
        );

        return;

      }

    }


    // Update screening sessions
    const { error: sessionError } =
      await supabase
        .from("screening_sessions")
        .update({
          follow_up_stage: followUpType,
        })
        .eq("child_name", selected.name);


    if (sessionError) {

      console.error(
        "Error updating session follow-up stage:",
        sessionError
      );

    }


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


  // ==========================================================
  // DELETE FOLLOW-UP
  // ==========================================================

  const handleDeleteFollowUp = async () => {

    if (!existingFollowUp?.docId) {
      return;
    }


    const { error } =
      await supabase
        .from("follow_ups")
        .delete()
        .eq("id", existingFollowUp.docId);


    if (error) {

      console.error(
        "Error deleting follow-up:",
        error
      );

      return;

    }


    const { error: sessionError } =
      await supabase
        .from("screening_sessions")
        .update({
          follow_up_stage: "fu1",
        })
        .eq("child_name", selected.name);


    if (sessionError) {

      console.error(
        "Error resetting session follow-up stage:",
        sessionError
      );

    }


    setExistingFollowUp(null);

  };


  // ==========================================================
  // CONSENT FILE
  // ==========================================================

  const consentFile = selected
    ? consentFiles[selected.id || selected.name]
    : null;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="page-fade">


      {/* ======================================================
          SEARCH BAR
      ====================================================== */}

      <div className="search-bar">

        <input
          className="search-input"
          placeholder={t.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={stageFilter}
          onChange={e =>
            setStageFilter(e.target.value)
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
          onClick={() => {
            setShowAdd(true);
            setDuplicateWarning(false);
          }}
        >
          + {t.addSession}
        </button>


        <span
          style={{
            fontSize: 12,
            color: "var(--ink-faint)",
            fontWeight: 600,
            marginLeft: "auto",
          }}
        >
          {t.showing} {filtered.length} {t.of}{" "}
          {children.length} {t.children}
        </span>

      </div>


      {/* ======================================================
          CHILDREN TABLE
      ====================================================== */}

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
              🔍
            </div>

            <div className="empty-state-title">
              {t.noResults}
            </div>

            <div className="empty-state-sub">
              {t.noResultsSub}
            </div>

          </div>

        ) : (

          <div style={{ overflowX: "auto" }}>

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    {t.childName}
                  </th>

                  <th>
                    {t.screeningStage}
                  </th>

                  <th>
                    {t.actions}
                  </th>

                </tr>

              </thead>


              <tbody>

                {filtered.map((child, i) => {

                  const sc =
                    stageColors[
                      child.stage || "stage4"
                    ];

                  const hasFollowUp =
                    !!followUps[child.name];


                  return (

                    <tr
                      key={child.id || i}
                    >

                      <td>

                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {child.name}
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color:
                              "var(--ink-faint)",
                            marginTop: 2,
                          }}
                        >
                          {child.school}
                        </div>


                        {hasFollowUp && (

                          <div
                            style={{
                              marginTop: 4,
                            }}
                          >

                            <span
                              style={{
                                fontSize: 10,
                                padding:
                                  "2px 8px",
                                borderRadius: 20,
                                background:
                                  "var(--teal-lt)",
                                color:
                                  "var(--teal)",
                                fontWeight: 700,
                              }}
                            >
                              Follow-up Set
                            </span>

                          </div>

                        )}

                      </td>


                      <td>

                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 700,
                            background:
                              sc.bg,
                            color:
                              sc.color,
                          }}
                        >
                          {t[
                            child.stage ||
                              "stage4"
                          ]}
                        </span>

                      </td>


                      <td>

                        <button
                          className="btn btn-teal btn-sm"
                          onClick={() =>
                            openChild(child)
                          }
                        >
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


      {/* ======================================================
          VIEW / EDIT CHILD MODAL
      ====================================================== */}

      {selected && (

        <div
          className="modal-overlay"
          onClick={() =>
            !isEditing &&
            setSelected(null)
          }
        >

          <div
            className="modal"
            style={{
              maxWidth: 580,
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >


            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              className="modal-header"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >

              <div className="modal-title">
                {selected.name}
              </div>


              {/* TOP RIGHT ACTIONS */}

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >

                {!isEditing && (

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={startEditing}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    ✏ {t.editChild}
                  </button>

                )}


                <button
                  className="modal-close"
                  onClick={() => {

                    if (isEditing) {
                      cancelEditing();
                    } else {
                      setSelected(null);
                    }

                  }}
                >
                  ✕
                </button>

              </div>

            </div>


            {/* =================================================
                EDIT MODE
            ================================================= */}

            {isEditing ? (

              <>

                {/* EDIT HEADER */}

                <div
                  style={{
                    padding:
                      "12px 14px",
                    background:
                      "var(--teal-lt)",
                    borderRadius: 12,
                    marginBottom: 18,
                    border:
                      "1px solid rgba(0,155,141,0.2)",
                  }}
                >

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color:
                        "var(--teal)",
                    }}
                  >
                    ✏ {t.editChild}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color:
                        "var(--ink-mid)",
                      marginTop: 3,
                    }}
                  >
                    Update the child's
                    information below.
                  </div>

                </div>


                {/* DUPLICATE WARNING */}

                {editDuplicateWarning && (

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
                    {t.duplicateEditWarning}
                    <div
                      style={{
                        fontSize: 11,
                        marginTop: 3,
                        fontWeight: 600,
                      }}
                    >
                      {t.duplicateEditDetail}
                    </div>
                  </div>

                )}


                {/* EDIT FORM */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >

                  {/* CHILD ID */}

                  <div>

                    <label
                      style={labelStyle}
                    >
                      {t.childNameLabel}
                    </label>

                    <input
                      style={inputStyle}
                      value={
                        editChild?.name || ""
                      }
                      onChange={e =>
                        updateEditField(
                          "name",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* SCHOOL */}

                  <div>

                    <label
                      style={labelStyle}
                    >
                      {t.schoolLabel}
                    </label>

                    <input
                      style={inputStyle}
                      value={
                        editChild?.school ||
                        ""
                      }
                      onChange={e =>
                        updateEditField(
                          "school",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* PROVINCE */}

                  <div>

                    <label
                      style={labelStyle}
                    >
                      {t.provinceLabel}
                    </label>

                    <input
                      style={inputStyle}
                      value={
                        editChild?.province ||
                        ""
                      }
                      onChange={e =>
                        updateEditField(
                          "province",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* AGE */}

                  <div>

                    <label
                      style={labelStyle}
                    >
                      {t.ageLabel}
                    </label>

                    <input
                      style={inputStyle}
                      type="number"
                      value={
                        editChild?.age ?? ""
                      }
                      onChange={e =>
                        updateEditField(
                          "age",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* GENDER */}

                  <div>

                    <label
                      style={labelStyle}
                    >
                      {t.genderLabel}
                    </label>

                    <select
                      style={inputStyle}
                      value={
                        editChild?.gender ||
                        "Female"
                      }
                      onChange={e =>
                        updateEditField(
                          "gender",
                          e.target.value
                        )
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

                    <label
                      style={labelStyle}
                    >
                      {t.langLabel}
                    </label>

                    <select
                      style={inputStyle}
                      value={
                        editChild?.language ||
                        "English"
                      }
                      onChange={e =>
                        updateEditField(
                          "language",
                          e.target.value
                        )
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

                    <label
                      style={labelStyle}
                    >
                      {t.examinerLabel}
                    </label>

                    <input
                      style={inputStyle}
                      value={
                        editChild?.examiner ||
                        ""
                      }
                      onChange={e =>
                        updateEditField(
                          "examiner",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* DATE */}

                  <div>

                    <label
                      style={labelStyle}
                    >
                      {t.dateLabel}
                    </label>

                    <input
                      style={inputStyle}
                      type="date"
                      value={
                        editChild?.date ||
                        ""
                      }
                      onChange={e =>
                        updateEditField(
                          "date",
                          e.target.value
                        )
                      }
                    />

                  </div>


                  {/* STAGE */}

                  <div
                    style={{
                      gridColumn:
                        "span 2",
                    }}
                  >

                    <label
                      style={labelStyle}
                    >
                      {t.stageLabel}
                    </label>

                    <select
                      style={inputStyle}
                      value={
                        editChild?.stage ||
                        "stage1"
                      }
                      onChange={e =>
                        updateEditField(
                          "stage",
                          e.target.value
                        )
                      }
                    >

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

                  </div>

                </div>


                {/* SAVE SUCCESS */}

                {editSaved && (

                  <div
                    style={{
                      padding:
                        "10px 14px",
                      background:
                        "var(--teal-lt)",
                      color:
                        "var(--teal)",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 12,
                    }}
                  >
                    ✓ {t.changesSaved}
                  </div>

                )}


                {/* EDIT ACTIONS */}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >

                  <button
                    className="btn btn-ghost"
                    onClick={
                      cancelEditing
                    }
                    style={{
                      flex: 1,
                    }}
                  >
                    {t.cancel}
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={
                      handleSaveEdit
                    }
                    disabled={
                      !editChild?.name ||
                      !editChild?.school
                    }
                    style={{
                      flex: 1,
                    }}
                  >
                    ✓ {t.saveChanges}
                  </button>

                </div>

              </>

            ) : (

              /* =================================================
                 NORMAL VIEW MODE
              ================================================= */

              <>

                {/* TABS */}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 24,
                  }}
                >

                  <button
                    className={`btn btn-sm ${
                      !consentView
                        ? "btn-teal"
                        : "btn-ghost"
                    }`}
                    onClick={() =>
                      setConsentView(false)
                    }
                  >
                    📋 {t.childDetail}
                  </button>


                  <button
                    className={`btn btn-sm ${
                      consentView
                        ? "btn-teal"
                        : "btn-ghost"
                    }`}
                    onClick={() =>
                      setConsentView(true)
                    }
                  >
                    📄 {t.consentForm}
                  </button>

                </div>


                {!consentView ? (

                  <>

                    {/* CHILD DETAILS */}

                    <div className="report-section">

                      <div className="report-section-title">
                        {t.childDetail}
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.school}
                        </span>

                        <span className="report-row-value">
                          {selected.school}
                        </span>
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.province}
                        </span>

                        <span className="report-row-value">
                          {selected.province}
                        </span>
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.age}
                        </span>

                        <span className="report-row-value">
                          {selected.age} years
                        </span>
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.gender}
                        </span>

                        <span className="report-row-value">
                          {selected.gender}
                        </span>
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.language}
                        </span>

                        <span className="report-row-value">
                          {selected.language}
                        </span>
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.examiner}
                        </span>

                        <span className="report-row-value">
                          {selected.examiner}
                        </span>
                      </div>


                      <div className="report-row">
                        <span className="report-row-label">
                          {t.date}
                        </span>

                        <span className="report-row-value">
                          {selected.date}
                        </span>
                      </div>


                      <div className="report-row">

                        <span className="report-row-label">
                          {t.screeningStage}
                        </span>

                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              stageColors[
                                selected.stage ||
                                  "stage4"
                              ]?.color,
                          }}
                        >
                          {t[
                            selected.stage ||
                              "stage4"
                          ]}
                        </span>

                      </div>

                    </div>


                    {/* EXISTING FOLLOW-UP */}

                    {existingFollowUp &&
                      !showFollowUp && (

                        <div
                          style={{
                            padding: 14,
                            background:
                              "var(--teal-lt)",
                            borderRadius: 12,
                            marginBottom: 12,
                            border:
                              "1px solid rgba(0,155,141,0.2)",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              marginBottom: 8,
                            }}
                          >

                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color:
                                  "var(--teal)",
                              }}
                            >
                              {t.existingFollowUp}
                            </div>


                            <button
                              className="btn btn-sm"
                              style={{
                                background:
                                  "var(--pink-lt)",
                                color:
                                  "var(--pink)",
                                border: "none",
                                fontSize: 11,
                              }}
                              onClick={
                                handleDeleteFollowUp
                              }
                            >
                              🗑{" "}
                              {t.deleteFollowUp}
                            </button>

                          </div>


                          <div
                            style={{
                              fontSize: 12,
                              color:
                                "var(--ink-mid)",
                              lineHeight: 1.8,
                            }}
                          >

                            <div>
                              <strong>
                                Date:
                              </strong>{" "}
                              {
                                existingFollowUp.followUpDate
                              }
                            </div>

                            <div>
                              <strong>
                                Psychologist:
                              </strong>{" "}
                              {
                                existingFollowUp.followUpPsych
                              }
                            </div>

                            <div>
                              <strong>
                                Status:
                              </strong>{" "}
                              {
                                t[
                                  existingFollowUp.followUpType
                                ]
                              }
                            </div>

                            {existingFollowUp.followUpReason && (

                              <div>
                                <strong>
                                  Reason:
                                </strong>{" "}
                                {
                                  existingFollowUp.followUpReason
                                }
                              </div>

                            )}

                          </div>


                          <button
                            className="btn btn-ghost btn-sm"
                            style={{
                              marginTop: 10,
                              width: "100%",
                            }}
                            onClick={() => {

                              setFollowUpDate(
                                existingFollowUp.followUpDate ||
                                  ""
                              );

                              setFollowUpPsych(
                                existingFollowUp.followUpPsych ||
                                  ""
                              );

                              setFollowUpReason(
                                existingFollowUp.followUpReason ||
                                  ""
                              );

                              setFollowUpType(
                                existingFollowUp.followUpType ||
                                  "fu2"
                              );

                              setShowFollowUp(
                                true
                              );

                            }}
                          >
                            ✏ Edit Follow-up
                          </button>

                        </div>

                      )}


                    {/* SCHEDULE FOLLOW-UP */}

                    {!showFollowUp &&
                      !existingFollowUp && (

                        <button
                          className="btn btn-primary"
                          style={{
                            width: "100%",
                            marginBottom: 12,
                          }}
                          onClick={() =>
                            setShowFollowUp(
                              true
                            )
                          }
                        >
                          {t.scheduleFollowUp}
                        </button>

                      )}


                    {/* FOLLOW-UP FORM */}

                    {showFollowUp && (

                      <div
                        style={{
                          padding: 16,
                          background:
                            "var(--surface)",
                          borderRadius: 12,
                          border:
                            "1.5px solid var(--border)",
                          marginBottom: 12,
                        }}
                      >

                        <div
                          style={{
                            fontFamily:
                              "Nunito",
                            fontSize: 14,
                            fontWeight: 800,
                            marginBottom: 14,
                          }}
                        >
                          {t.scheduleFollowUp}
                        </div>


                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "1fr 1fr",
                            gap: 10,
                            marginBottom: 12,
                          }}
                        >

                          <div>

                            <label
                              style={
                                labelStyle
                              }
                            >
                              {t.followUpDate}
                            </label>

                            <input
                              style={
                                inputStyle
                              }
                              type="date"
                              value={
                                followUpDate
                              }
                              onChange={e =>
                                setFollowUpDate(
                                  e.target.value
                                )
                              }
                            />

                          </div>


                          <div>

                            <label
                              style={
                                labelStyle
                              }
                            >
                              {t.followUpPsych}
                            </label>

                            <input
                              style={
                                inputStyle
                              }
                              placeholder="Dr. Mokoena"
                              value={
                                followUpPsych
                              }
                              onChange={e =>
                                setFollowUpPsych(
                                  e.target.value
                                )
                              }
                            />

                          </div>


                          <div
                            style={{
                              gridColumn:
                                "span 2",
                            }}
                          >

                            <label
                              style={
                                labelStyle
                              }
                            >
                              {t.followUpReason}
                            </label>

                            <textarea
                              style={{
                                ...inputStyle,
                                minHeight: 70,
                                resize:
                                  "vertical",
                              }}
                              placeholder="e.g. Low scores in cognitive and social domains"
                              value={
                                followUpReason
                              }
                              onChange={e =>
                                setFollowUpReason(
                                  e.target.value
                                )
                              }
                            />

                          </div>


                          <div
                            style={{
                              gridColumn:
                                "span 2",
                            }}
                          >

                            <label
                              style={
                                labelStyle
                              }
                            >
                              {t.followUpType}
                            </label>

                            <select
                              style={
                                inputStyle
                              }
                              value={
                                followUpType
                              }
                              onChange={e =>
                                setFollowUpType(
                                  e.target.value
                                )
                              }
                            >

                              {FOLLOW_UP_OPTIONS.map(
                                opt => (

                                  <option
                                    key={opt}
                                    value={opt}
                                  >
                                    {t[opt]}
                                  </option>

                                )
                              )}

                            </select>

                          </div>

                        </div>


                        {followUpSaved && (

                          <div
                            style={{
                              padding:
                                "10px 14px",
                              background:
                                "var(--teal-lt)",
                              color:
                                "var(--teal)",
                              borderRadius: 10,
                              fontSize: 13,
                              fontWeight: 700,
                              marginBottom: 10,
                            }}
                          >
                            ✓{" "}
                            {t.followUpSaved}
                          </div>

                        )}


                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                          }}
                        >

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              setShowFollowUp(
                                false
                              )
                            }
                            style={{
                              flex: 1,
                            }}
                          >
                            {t.cancel}
                          </button>


                          <button
                            className="btn btn-primary btn-sm"
                            style={{
                              flex: 1,
                            }}
                            disabled={
                              !followUpDate ||
                              !followUpPsych
                            }
                            onClick={
                              handleSaveFollowUp
                            }
                          >
                            {t.saveAppointment}
                          </button>

                        </div>

                      </div>

                    )}


                    {/* DELETE CHILD */}

                    {!showDeleteConfirm ? (

                      <button
                        className="btn btn-sm"
                        style={{
                          width: "100%",
                          background:
                            "var(--pink-lt)",
                          color:
                            "var(--pink)",
                          border:
                            "1px solid rgba(232,23,93,0.2)",
                          marginTop: 4,
                        }}
                        onClick={() =>
                          setShowDeleteConfirm(
                            true
                          )
                        }
                      >
                        🗑{" "}
                        {t.deleteChild}
                      </button>

                    ) : (

                      <div
                        style={{
                          padding: 14,
                          background:
                            "var(--pink-lt)",
                          borderRadius: 12,
                          border:
                            "1px solid rgba(232,23,93,0.2)",
                          marginTop: 4,
                        }}
                      >

                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color:
                              "var(--pink)",
                            marginBottom: 10,
                          }}
                        >
                          {t.deleteConfirm}
                        </div>


                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                          }}
                        >

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() =>
                              setShowDeleteConfirm(
                                false
                              )
                            }
                            style={{
                              flex: 1,
                            }}
                          >
                            {t.cancel}
                          </button>


                          <button
                            className="btn btn-sm"
                            style={{
                              flex: 1,
                              background:
                                "var(--pink)",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={
                              handleDeleteChild
                            }
                          >
                            Confirm Delete
                          </button>

                        </div>

                      </div>

                    )}

                  </>

                ) : (

                  /* =================================================
                     CONSENT FORM TAB
                  ================================================= */

                  <>

                    <div
                      style={{
                        padding:
                          "14px 16px",
                        background:
                          consentFile
                            ? "var(--teal-lt)"
                            : "var(--orange-lt)",
                        borderRadius: 12,
                        marginBottom: 20,
                        border: `1px solid ${
                          consentFile
                            ? "rgba(0,155,141,0.2)"
                            : "rgba(242,101,34,0.2)"
                        }`,
                      }}
                    >

                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color:
                            consentFile
                              ? "var(--teal)"
                              : "var(--orange)",
                          marginBottom: 4,
                        }}
                      >
                        {consentFile
                          ? `✓ ${t.consentSigned}`
                          : "⚠ No Consent Form Yet"}
                      </div>


                      <div
                        style={{
                          fontSize: 13,
                          color:
                            "var(--ink-mid)",
                        }}
                      >
                        {consentFile
                          ? t.consentNote
                          : "Upload the signed consent form below"}
                      </div>

                    </div>


                    {/* EXISTING CONSENT */}

                    {consentFile && (

                      <div
                        style={{
                          border:
                            "1.5px solid var(--border)",
                          borderRadius: 12,
                          overflow: "hidden",
                          marginBottom: 16,
                        }}
                      >

                        <div
                          style={{
                            background:
                              "var(--dark)",
                            padding:
                              "10px 16px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 8,
                          }}
                        >

                          <span>
                            {consentFile.type.includes(
                              "pdf"
                            )
                              ? "📄"
                              : "🖼"}
                          </span>

                          <span
                            style={{
                              fontSize: 12,
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          >
                            {consentFile.name}
                          </span>

                        </div>


                        {consentFile.type.includes(
                          "image"
                        ) ? (

                          <img
                            src={
                              consentFile.url
                            }
                            alt="Consent"
                            style={{
                              width: "100%",
                              maxHeight: 300,
                              objectFit:
                                "contain",
                              background:
                                "#fff",
                            }}
                          />

                        ) : (

                          <iframe
                            src={
                              consentFile.url
                            }
                            title="Consent PDF"
                            style={{
                              width: "100%",
                              height: 300,
                              border: "none",
                              background:
                                "#fff",
                            }}
                          />

                        )}


                        <div
                          style={{
                            padding:
                              "10px 16px",
                          }}
                        >

                          <a
                            href={
                              consentFile.url
                            }
                            download={
                              consentFile.name
                            }
                            className="btn btn-teal btn-sm"
                            style={{
                              textDecoration:
                                "none",
                              display:
                                "block",
                              textAlign:
                                "center",
                            }}
                          >
                            ⬇{" "}
                            {t.downloadConsent}
                          </a>

                        </div>

                      </div>

                    )}


                    {/* UPLOAD */}

                    <div
                      style={{
                        marginBottom: 16,
                      }}
                    >

                      <label
                        style={labelStyle}
                      >
                        {t.uploadConsent}
                      </label>

                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={
                          handleFileUpload
                        }
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "10px",
                          border:
                            "1.5px dashed var(--border)",
                          borderRadius: 10,
                          fontSize: 13,
                          cursor: "pointer",
                          background:
                            "#FAFAFF",
                        }}
                      />

                    </div>


                    {/* NEW FILE PREVIEW */}

                    {uploadedFileURL && (

                      <div
                        style={{
                          border:
                            "1.5px solid var(--teal)",
                          borderRadius: 12,
                          overflow: "hidden",
                          marginBottom: 12,
                        }}
                      >

                        <div
                          style={{
                            background:
                              "var(--teal-lt)",
                            padding:
                              "8px 16px",
                            fontSize: 12,
                            fontWeight: 700,
                            color:
                              "var(--teal)",
                          }}
                        >
                          Preview:{" "}
                          {uploadedFile.name}
                        </div>


                        {uploadedFileType?.includes(
                          "image"
                        ) ? (

                          <img
                            src={
                              uploadedFileURL
                            }
                            alt="Preview"
                            style={{
                              width: "100%",
                              maxHeight: 250,
                              objectFit:
                                "contain",
                              background:
                                "#fff",
                            }}
                          />

                        ) : (

                          <iframe
                            src={
                              uploadedFileURL
                            }
                            title="PDF Preview"
                            style={{
                              width: "100%",
                              height: 250,
                              border: "none",
                              background:
                                "#fff",
                            }}
                          />

                        )}


                        <div
                          style={{
                            padding:
                              "10px 16px",
                          }}
                        >

                          <button
                            className="btn btn-teal"
                            style={{
                              width: "100%",
                            }}
                            onClick={
                              handleSaveConsent
                            }
                          >
                            ✓ Save Consent Form
                          </button>

                        </div>

                      </div>

                    )}

                  </>

                )}

              </>

            )}

          </div>

        </div>

      )}


      {/* ======================================================
          ADD NEW CHILD MODAL
      ====================================================== */}

      {showAdd && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowAdd(false)
          }
        >

          <div
            className="modal"
            style={{
              maxWidth: 560,
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div className="modal-title">
                {t.addSession}
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowAdd(false)
                }
              >
                ✕
              </button>

            </div>


            {/* DUPLICATE WARNING */}

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
                {t.duplicateWarning} — "
                {newChild.name}"{" "}
                {t.duplicateDetail}
              </div>

            )}


            {/* ADD FORM */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >

              <div>

                <label
                  style={labelStyle}
                >
                  {t.childNameLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder="Child PB-016"
                  value={newChild.name}
                  onChange={e => {

                    setNewChild({
                      ...newChild,
                      name: e.target.value,
                    });

                    setDuplicateWarning(
                      false
                    );

                  }}
                />

              </div>


              <div>

                <label
                  style={labelStyle}
                >
                  {t.schoolLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder="School name"
                  value={newChild.school}
                  onChange={e =>
                    setNewChild({
                      ...newChild,
                      school:
                        e.target.value,
                    })
                  }
                />

              </div>


              <div>

                <label
                  style={labelStyle}
                >
                  {t.provinceLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder="Eastern Cape"
                  value={newChild.province}
                  onChange={e =>
                    setNewChild({
                      ...newChild,
                      province:
                        e.target.value,
                    })
                  }
                />

              </div>


              <div>

                <label
                  style={labelStyle}
                >
                  {t.ageLabel}
                </label>

                <input
                  style={inputStyle}
                  type="number"
                  placeholder="5"
                  value={newChild.age}
                  onChange={e =>
                    setNewChild({
                      ...newChild,
                      age: e.target.value,
                    })
                  }
                />

              </div>


              <div>

                <label
                  style={labelStyle}
                >
                  {t.genderLabel}
                </label>

                <select
                  style={inputStyle}
                  value={newChild.gender}
                  onChange={e =>
                    setNewChild({
                      ...newChild,
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


              <div>

                <label
                  style={labelStyle}
                >
                  {t.langLabel}
                </label>

                <select
                  style={inputStyle}
                  value={
                    newChild.language
                  }
                  onChange={e =>
                    setNewChild({
                      ...newChild,
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


              <div>

                <label
                  style={labelStyle}
                >
                  {t.examinerLabel}
                </label>

                <input
                  style={inputStyle}
                  placeholder="Dr. Mokoena"
                  value={
                    newChild.examiner
                  }
                  onChange={e =>
                    setNewChild({
                      ...newChild,
                      examiner:
                        e.target.value,
                    })
                  }
                />

              </div>


              <div>

                <label
                  style={labelStyle}
                >
                  {t.dateLabel}
                </label>

                <input
                  style={inputStyle}
                  type="date"
                  value={newChild.date}
                  onChange={e =>
                    setNewChild({
                      ...newChild,
                      date:
                        e.target.value,
                    })
                  }
                />

              </div>


              <div
                style={{
                  gridColumn:
                    "span 2",
                }}
              >

                <label
                  style={labelStyle}
                >
                  {t.stageLabel}
                </label>

                <select
                  style={inputStyle}
                  value={newChild.stage}
                  onChange={e =>
                    setNewChild({
                      ...newChild,
                      stage:
                        e.target.value,
                    })
                  }
                >

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

              </div>

            </div>


            {/* ADD ACTIONS */}

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
                onClick={() =>
                  setShowAdd(false)
                }
              >
                {t.cancel}
              </button>


              <button
                className="btn btn-primary"
                onClick={
                  handleAddChild
                }
                disabled={
                  !newChild.name ||
                  !newChild.school
                }
              >
                {t.save}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}