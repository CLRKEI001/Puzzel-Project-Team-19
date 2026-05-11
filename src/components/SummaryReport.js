import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
 
const T = {
  en: {
    title: "Summary Report", subtitle: "PuzzleBox Screener System · Eastern Cape Pilot 2026",
    exportPDF: "Export PDF", exportExcel: "Export Excel", generating: "Generating...",
    projectOverview: "Project Overview", screeningResults: "Screening Results Summary",
    domainAnalysis: "Domain Performance Analysis", flaggedChildren: "Flagged Children",
    totalScreened: "Total Children Screened", onTrack: "On Track", progressing: "Progressing",
    devConcerns: "Developmental Concerns", flagged: "Flagged for Follow-up",
    avgScore: "Average Total Score", schools: "Schools Covered", languages: "Languages Used",
    cognitive: "Cognitive", motor: "Fine Motor", language: "Language",
    social: "Social Cognition", emotion: "Emotion", moral: "Moral",
    childID: "Child ID", school: "School", score: "Score", status: "Status", date: "Date",
    reportGenerated: "Report generated on", by: "by", system: "PuzzleBox Screener System",
    disclaimer: "DISCLAIMER: This report contains simplified percentile summaries only. Results must not be interpreted as clinical diagnoses. Detailed domain scores are available to registered psychologists only.",
    fundingNote: "This data was collected as part of the PuzzleBox Screener standardisation phase and is intended to support evidence-based funding applications and programme evaluation."
  },
  af: {
    title: "Opsommingsverslag", subtitle: "PuzzleBox Sifterstelsel · Oos-Kaap Loodsprojek 2026",
    exportPDF: "Voer PDF Uit", exportExcel: "Voer Excel Uit", generating: "Genereer...",
    projectOverview: "Projekoorsig", screeningResults: "Siftingsresultate Opsomming",
    domainAnalysis: "Domeinprestasie Analise", flaggedChildren: "Gevlae Kinders",
    totalScreened: "Totale Kinders Gesif", onTrack: "Op Koers", progressing: "Vordering",
    devConcerns: "Ontwikkelingsbekommernisse", flagged: "Gevlag vir Opvolg",
    avgScore: "Gemiddelde Totale Punt", schools: "Skole Gedek", languages: "Tale Gebruik",
    cognitive: "Kognitief", motor: "Fyn Motories", language: "Taal",
    social: "Sosiale Kognisie", emotion: "Emosie", moral: "Moreel",
    childID: "Kind ID", school: "Skool", score: "Punt", status: "Status", date: "Datum",
    reportGenerated: "Verslag gegenereer op", by: "deur", system: "PuzzleBox Sifterstelsel",
    disclaimer: "VRYWARING: Hierdie verslag bevat slegs vereenvoudigde persentiel-opsommings. Resultate moet nie as kliniese diagnoses geïnterpreteer word nie.",
    fundingNote: "Hierdie data is ingesamel as deel van die PuzzleBox Sifter-standaardiseringsfase."
  },
  xh: {
    title: "Ingxelo Efuphi", subtitle: "Inkqubo ye-PuzzleBox · Umzekelo weMpuma Koloni 2026",
    exportPDF: "Thumela kwi-PDF", exportExcel: "Thumela kwi-Excel", generating: "Ikhiqiza...",
    projectOverview: "Inkcazelo yeProjekthi", screeningResults: "Isishwankathelo Seziphumo",
    domainAnalysis: "Uhlalutyo lweMihlaba", flaggedChildren: "Abantwana Abakhombiweyo",
    totalScreened: "Isibalaniso Sabantwana", onTrack: "Esendleleni", progressing: "Inkqubela",
    devConcerns: "Iingxaki Zentlalo", flagged: "Ikhombiwe Ukulandelwa",
    avgScore: "Amanqaku Apha Phakathi", schools: "Izikolo Ezikhethiweyo", languages: "Iilwimi Ezisetyenzisiweyo",
    cognitive: "Ukucinga", motor: "Amandla", language: "Ulwimi",
    social: "Uluntu", emotion: "Imvakalelo", moral: "Isimo",
    childID: "ID yoMntwana", school: "Isikolo", score: "Amanqaku", status: "Imeko", date: "Umhla",
    reportGenerated: "Ingxelo ikhiqizwe ngo", by: "ngu", system: "Inkqubo ye-PuzzleBox",
    disclaimer: "ISAZISO: Le ngxelo iqulathe izishwankathelo zamanqaku asilwe kuphela.",
    fundingNote: "Le ngxelo yaqokelelwa njengeyeyinxalenye yefeyizi yokumiselwa kwe-PuzzleBox Screener."
  }
};
 
const statusColors = { "On Track": [0, 155, 141], "Progressing": [242, 101, 34], "Developmental Concerns": [232, 23, 93] };
 
export default function SummaryReport({ children, lang }) {
  const t = T[lang];
  const [exporting, setExporting] = useState(false);
 
  const total = children.length;
  const onTrack = children.filter(c => c.status === "On Track").length;
  const progressing = children.filter(c => c.status === "Progressing").length;
  const concerns = children.filter(c => c.status === "Developmental Concerns").length;
  const flagged = children.filter(c => c.flagged).length;
  const avgScore = total > 0 ? Math.round(children.reduce((a, c) => a + (c.total || 0), 0) / total) : 0;
  const schools = [...new Set(children.map(c => c.school))];
  const langs = [...new Set(children.map(c => c.language))];
 
  const domainAvg = (key) => total > 0 ? Math.round(children.reduce((a, c) => a + (c[key] || 0), 0) / total) : 0;
  const domains = [
    { label: t.cognitive, key: "cognitive" },
    { label: t.motor, key: "motor" },
    { label: t.language, key: "language_score" },
    { label: t.social, key: "social" },
    { label: t.emotion, key: "emotion" },
    { label: t.moral, key: "moral" },
  ];
 
  // PDF EXPORT
  const exportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      const doc = new jsPDF();
      const now = new Date().toLocaleDateString();
 
      // Header
      doc.setFillColor(26, 26, 46);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("The Puzzle Project", 14, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(t.subtitle, 14, 27);
      doc.setFontSize(9);
      doc.text(`${t.reportGenerated} ${now}`, 14, 35);
 
      let y = 50;
 
      // Overview stats
      doc.setTextColor(26, 26, 46);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(t.projectOverview, 14, y);
      y += 8;
 
      const stats = [
        [t.totalScreened, total],
        [t.onTrack, `${onTrack} (${total > 0 ? Math.round((onTrack / total) * 100) : 0}%)`],
        [t.progressing, `${progressing} (${total > 0 ? Math.round((progressing / total) * 100) : 0}%)`],
        [t.devConcerns, `${concerns} (${total > 0 ? Math.round((concerns / total) * 100) : 0}%)`],
        [t.flagged, flagged],
        [t.avgScore, `${avgScore}%`],
        [t.schools, schools.join(", ")],
        [t.languages, langs.join(", ")],
      ];
 
      autoTable(doc, {
        startY: y,
        head: [],
        body: stats,
        theme: "striped",
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
      });
 
      y = doc.lastAutoTable.finalY + 12;
 
      // Domain analysis
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(t.domainAnalysis, 14, y);
      y += 6;
 
      autoTable(doc, {
        startY: y,
        head: [["Domain", "Average Score", "Status"]],
        body: domains.map(d => {
          const avg = domainAvg(d.key);
          const status = avg >= 75 ? t.onTrack : avg >= 50 ? t.progressing : t.devConcerns;
          return [d.label, `${avg}%`, status];
        }),
        theme: "grid",
        headStyles: { fillColor: [26, 26, 46], textColor: 255, fontSize: 10 },
        styles: { fontSize: 10 },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.section === "body") {
            const val = data.cell.raw;
            if (val === t.onTrack) data.cell.styles.textColor = statusColors["On Track"];
            else if (val === t.progressing) data.cell.styles.textColor = statusColors["Progressing"];
            else data.cell.styles.textColor = statusColors["Developmental Concerns"];
          }
        }
      });
 
      y = doc.lastAutoTable.finalY + 12;
 
      // Children table
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(t.screeningResults, 14, y);
      y += 6;
 
      autoTable(doc, {
        startY: y,
        head: [[t.childID, t.school, "Age", t.language, t.score, t.status, t.date]],
        body: children.map(c => [c.name, c.school, `${c.age} yrs`, c.language, `${c.total}%`, c.status, c.date]),
        theme: "striped",
        headStyles: { fillColor: [0, 155, 141], textColor: 255, fontSize: 9 },
        styles: { fontSize: 9 },
      });
 
      y = doc.lastAutoTable.finalY + 12;
 
      // Disclaimer
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFillColor(252, 230, 238);
      doc.rect(14, y, 182, 20, "F");
      doc.setTextColor(232, 23, 93);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("DISCLAIMER:", 17, y + 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      const disclaimerLines = doc.splitTextToSize(t.disclaimer.replace("DISCLAIMER: ", ""), 170);
      doc.text(disclaimerLines, 40, y + 7);
 
      y += 26;
      doc.setTextColor(100, 100, 120);
      doc.setFontSize(8);
      const fundingLines = doc.splitTextToSize(t.fundingNote, 182);
      doc.text(fundingLines, 14, y);
 
      doc.save(`PuzzleProject_SummaryReport_${now.replace(/\//g, "-")}.pdf`);
      setExporting(false);
    }, 100);
  };
 
  // EXCEL EXPORT
  const exportExcel = () => {
    setExporting(true);
    setTimeout(() => {
      const wb = XLSX.utils.book_new();
 
      // Summary sheet
      const summaryData = [
        ["The Puzzle Project — Screener System Report"],
        [t.subtitle],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [],
        [t.projectOverview],
        [t.totalScreened, total],
        [t.onTrack, onTrack],
        [t.progressing, progressing],
        [t.devConcerns, concerns],
        [t.flagged, flagged],
        [t.avgScore, `${avgScore}%`],
        [t.schools, schools.join(", ")],
        [],
        [t.domainAnalysis],
        ["Domain", "Average Score"],
        ...domains.map(d => [d.label, `${domainAvg(d.key)}%`]),
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
 
      // Children sheet
      const childrenData = [
        [t.childID, t.school, "Province", "Age", "Gender", t.language, t.cognitive, t.motor, t.language, t.social, t.emotion, t.moral, "Total Score", "Status", "Flagged", t.date, "Examiner"],
        ...children.map(c => [c.name, c.school, c.province, c.age, c.gender, c.language, c.cognitive, c.motor, c.language_score, c.social, c.emotion, c.moral, `${c.total}%`, c.status, c.flagged ? "Yes" : "No", c.date, c.examiner])
      ];
      const wsChildren = XLSX.utils.aoa_to_sheet(childrenData);
      XLSX.utils.book_append_sheet(wb, wsChildren, "Children Data");
 
      // Flagged sheet
      const flaggedChildren = children.filter(c => c.flagged);
      const flaggedData = [
        [t.childID, t.school, "Total Score", "Status", t.date],
        ...flaggedChildren.map(c => [c.name, c.school, `${c.total}%`, c.status, c.date])
      ];
      const wsFlagged = XLSX.utils.aoa_to_sheet(flaggedData);
      XLSX.utils.book_append_sheet(wb, wsFlagged, "Flagged Children");
 
      XLSX.writeFile(wb, `PuzzleProject_Data_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`);
      setExporting(false);
    }, 100);
  };
 
  return (
    <div className="page-fade">
      {/* EXPORT BUTTONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={exportPDF} disabled={exporting}>
          {exporting ? t.generating : `📄 ${t.exportPDF}`}
        </button>
        <button className="btn btn-teal" onClick={exportExcel} disabled={exporting}>
          {exporting ? t.generating : `📊 ${t.exportExcel}`}
        </button>
      </div>
 
      {/* REPORT PREVIEW */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "Nunito", fontSize: 20, fontWeight: 900, color: "var(--ink)" }}>{t.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 4 }}>{t.subtitle}</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{t.reportGenerated} {new Date().toLocaleDateString()}</div>
        </div>
 
        {/* OVERVIEW STATS */}
        <div className="report-section">
          <div className="report-section-title">{t.projectOverview}</div>
          <div className="report-row"><span className="report-row-label">{t.totalScreened}</span><span className="report-row-value">{total}</span></div>
          <div className="report-row">
            <span className="report-row-label">{t.onTrack}</span>
            <span className="report-row-value" style={{ color: "var(--teal)" }}>{onTrack} ({total > 0 ? Math.round((onTrack / total) * 100) : 0}%)</span>
          </div>
          <div className="report-row">
            <span className="report-row-label">{t.progressing}</span>
            <span className="report-row-value" style={{ color: "var(--orange)" }}>{progressing} ({total > 0 ? Math.round((progressing / total) * 100) : 0}%)</span>
          </div>
          <div className="report-row">
            <span className="report-row-label">{t.devConcerns}</span>
            <span className="report-row-value" style={{ color: "var(--pink)" }}>{concerns} ({total > 0 ? Math.round((concerns / total) * 100) : 0}%)</span>
          </div>
          <div className="report-row"><span className="report-row-label">{t.flagged}</span><span className="report-row-value">{flagged}</span></div>
          <div className="report-row"><span className="report-row-label">{t.avgScore}</span><span className="report-row-value">{avgScore}%</span></div>
          <div className="report-row"><span className="report-row-label">{t.schools}</span><span className="report-row-value">{schools.join(", ")}</span></div>
          <div className="report-row"><span className="report-row-label">{t.languages}</span><span className="report-row-value">{langs.join(", ")}</span></div>
        </div>
 
        {/* DOMAIN ANALYSIS */}
        <div className="report-section">
          <div className="report-section-title">{t.domainAnalysis}</div>
          <div className="bar-chart">
            {domains.map(d => {
              const avg = domainAvg(d.key);
              const color = avg >= 75 ? "var(--teal)" : avg >= 50 ? "var(--orange)" : "var(--pink)";
              return (
                <div className="bar-row" key={d.key}>
                  <div className="bar-label">{d.label}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${avg}%`, background: color }}></div>
                  </div>
                  <div className="bar-pct">{avg}%</div>
                </div>
              );
            })}
          </div>
        </div>
 
        {/* FLAGGED CHILDREN */}
        {children.filter(c => c.flagged).length > 0 && (
          <div className="report-section">
            <div className="report-section-title">{t.flaggedChildren}</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.childID}</th>
                  <th>{t.school}</th>
                  <th>{t.score}</th>
                  <th>{t.status}</th>
                  <th>{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {children.filter(c => c.flagged).map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>{c.school}</td>
                    <td><strong>{c.total}%</strong></td>
                    <td><span className="pill pill-pink">{c.status}</span></td>
                    <td style={{ color: "var(--ink-faint)" }}>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
 
        {/* DISCLAIMER */}
        <div style={{ padding: "14px 16px", background: "var(--pink-lt)", borderRadius: 12, fontSize: 12, color: "var(--pink)", fontWeight: 600, marginBottom: 12 }}>
          {t.disclaimer}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.6 }}>
          {t.fundingNote}
        </div>
      </div>
    </div>
  );
}