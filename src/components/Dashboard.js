import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import ChildrenTable from "./ChildrenTable";
import ScreenerResults from "./ScreenerResults";
import FlagsAlerts from "./FlagsAlerts";
import SummaryReport from "./SummaryReport";
 
// Seed data — real screener data based on the PuzzleBox domains
const SEED_CHILDREN = [
  { name: "Child PB-001", school: "Adelaide Primary", province: "Eastern Cape", age: 5, gender: "Female", language: "isiXhosa", cognitive: 72, motor: 85, language_score: 68, social: 60, emotion: 74, moral: 55, total: 69, status: "Progressing", flagged: false, date: "2026-02-10", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-002", school: "Adelaide Primary", province: "Eastern Cape", age: 6, gender: "Male", language: "isiXhosa", cognitive: 45, motor: 52, language_score: 40, social: 38, emotion: 42, moral: 35, total: 42, status: "Developmental Concerns", flagged: true, date: "2026-02-10", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-003", school: "Komani ECD", province: "Eastern Cape", age: 5, gender: "Female", language: "English", cognitive: 88, motor: 92, language_score: 85, social: 90, emotion: 88, moral: 82, total: 88, status: "On Track", flagged: false, date: "2026-02-14", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-004", school: "Komani ECD", province: "Eastern Cape", age: 6, gender: "Male", language: "Afrikaans", cognitive: 35, motor: 40, language_score: 32, social: 28, emotion: 38, moral: 30, total: 34, status: "Developmental Concerns", flagged: true, date: "2026-02-14", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-005", school: "Fort Beaufort", province: "Eastern Cape", age: 5, gender: "Female", language: "isiXhosa", cognitive: 78, motor: 80, language_score: 75, social: 72, emotion: 79, moral: 70, total: 76, status: "On Track", flagged: false, date: "2026-02-18", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-006", school: "Fort Beaufort", province: "Eastern Cape", age: 6, gender: "Male", language: "isiXhosa", cognitive: 55, motor: 60, language_score: 58, social: 52, emotion: 56, moral: 50, total: 55, status: "Progressing", flagged: false, date: "2026-02-18", examiner: "Dr. Mokoena", stage: "stage3" },
  { name: "Child PB-007", school: "Stutterheim Primary", province: "Eastern Cape", age: 5, gender: "Female", language: "Afrikaans", cognitive: 90, motor: 88, language_score: 92, social: 87, emotion: 91, moral: 85, total: 89, status: "On Track", flagged: false, date: "2026-02-21", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-008", school: "Stutterheim Primary", province: "Eastern Cape", age: 6, gender: "Male", language: "English", cognitive: 42, motor: 38, language_score: 45, social: 35, emotion: 40, moral: 32, total: 39, status: "Developmental Concerns", flagged: true, date: "2026-02-21", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-009", school: "Adelaide Primary", province: "Eastern Cape", age: 5, gender: "Male", language: "isiXhosa", cognitive: 65, motor: 70, language_score: 62, social: 68, emotion: 66, moral: 60, total: 65, status: "Progressing", flagged: false, date: "2026-02-25", examiner: "Dr. Mokoena", stage: "stage3" },
  { name: "Child PB-010", school: "Komani ECD", province: "Eastern Cape", age: 6, gender: "Female", language: "isiXhosa", cognitive: 82, motor: 79, language_score: 84, social: 80, emotion: 83, moral: 78, total: 81, status: "On Track", flagged: false, date: "2026-02-25", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-011", school: "Fort Beaufort", province: "Eastern Cape", age: 5, gender: "Male", language: "English", cognitive: 30, motor: 35, language_score: 28, social: 25, emotion: 32, moral: 27, total: 30, status: "Developmental Concerns", flagged: true, date: "2026-03-03", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-012", school: "Adelaide Primary", province: "Eastern Cape", age: 6, gender: "Female", language: "Afrikaans", cognitive: 75, motor: 77, language_score: 73, social: 76, emotion: 74, moral: 72, total: 75, status: "On Track", flagged: false, date: "2026-03-03", examiner: "Dr. Mokoena", stage: "stage4" },
  { name: "Child PB-013", school: "Stutterheim Primary", province: "Eastern Cape", age: 5, gender: "Male", language: "isiXhosa", cognitive: 58, motor: 62, language_score: 55, social: 60, emotion: 57, moral: 52, total: 57, status: "Progressing", flagged: false, date: "2026-03-07", examiner: "Dr. Mokoena", stage: "stage2" },
  { name: "Child PB-014", school: "Komani ECD", province: "Eastern Cape", age: 6, gender: "Female", language: "English", cognitive: 48, motor: 50, language_score: 46, social: 44, emotion: 49, moral: 43, total: 47, status: "Progressing", flagged: false, date: "2026-03-07", examiner: "Dr. Mokoena", stage: "stage2" },
  { name: "Child PB-015", school: "Adelaide Primary", province: "Eastern Cape", age: 5, gender: "Male", language: "isiXhosa", cognitive: 93, motor: 90, language_score: 95, social: 92, emotion: 94, moral: 88, total: 92, status: "On Track", flagged: false, date: "2026-03-10", examiner: "Dr. Mokoena", stage: "stage1" },
];
 
 
export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState("overview");
  const [lang, setLang] = useState("en");
  const [children, setChildren] = useState([]);
  const [seeded, setSeeded] = useState(false);
 
  // Load from Firebase, seed if empty
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "children"), async (snap) => {
      if (snap.empty && !seeded) {
        setSeeded(true);
        for (const child of SEED_CHILDREN) {
          await addDoc(collection(db, "children"), { ...child, createdAt: serverTimestamp() });
        }
      } else {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setChildren(data);
      }
    });
    return () => unsub();
  }, [seeded]);
 
  const langLabels = { en: "EN", af: "AF", xh: "XH" };
 
  const titles = {
    en: { overview: "Overview", children: "Student Records", results: "Screener Results", flags: "Flags & Alerts", report: "Summary Report" },
    af: { overview: "Oorsig", children: "Leerlingsrekords", results: "Sifterresultate", flags: "Vlae & Waarskuwings", report: "Opsommingsverslag" },
    xh: { overview: "Inkcazelo", children: "Iirekhodi zabaFundi", results: "Iziphumo", flags: "Izikhombisi", report: "Ingxelo Efuphi" },
  };
 
  const subs = {
    en: { overview: "Eastern Cape pilot · All screened children", children: "All screened participants", results: "Latest screening sessions", flags: "Children requiring follow-up", report: "Exportable summary for funders" },
    af: { overview: "Oos-Kaap loodsprojek · Alle gesifde kinders", children: "Alle deelnemers", results: "Laaste sifsessies", flags: "Kinders wat opvolg benodig", report: "Uitvoerbare opsomming vir befondsers" },
    xh: { overview: "Umzekelo weMpuma Koloni · Bonke abantwana", children: "Bonke abathathi-nxaxheba", results: "Iiseshoni zokugqibela", flags: "Abantwana abafuna ukulandelwa", report: "Ingxelo yabaxhasi" },
  };
 
  return (
    <div className="dashboard-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} lang={lang} user={user} />
      <div className="main-content page-fade">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">{titles[lang][activePage]}</div>
            <div className="page-sub">{subs[lang][activePage]}</div>
          </div>
          <div className="topbar-right">
            <div className="lang-switcher">
              {Object.entries(langLabels).map(([code, label]) => (
                <button key={code} className={`lang-btn ${lang === code ? "active" : ""}`} onClick={() => setLang(code)}>{label}</button>
              ))}
            </div>
          </div>
        </div>
 
        {activePage === "overview" && <Overview children={children} lang={lang} />}
        {activePage === "children" && <ChildrenTable children={children} lang={lang} />}
        {activePage === "results" && <ScreenerResults lang={lang} />}
        {activePage === "flags" && <FlagsAlerts children={children} lang={lang} />}
        {activePage === "report" && <SummaryReport children={children} lang={lang} />}
      </div>
    </div>
  );
}