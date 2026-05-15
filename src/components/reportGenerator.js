import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const BRAND = {
  teal: [0, 155, 141],
  pink: [232, 23, 93],
  purple: [107, 47, 138],
  orange: [242, 101, 34],
  dark: [26, 26, 46],
  gray: [120, 120, 120],
  lightGray: [245, 245, 245],
  white: [255, 255, 255],
};

const DOMAIN_KEYS = ["cognitive", "motor", "language_score", "social", "emotion", "moral"];
const DOMAIN_BENCHMARK = 70;

function domainAvgForGroup(group, key) {
  if (!group.length) return 0;
  return Math.round(group.reduce((a, c) => a + (c[key] || 0), 0) / group.length);
}

function getGroups(children, compareMode) {
  if (compareMode === "school") return [...new Set(children.map(c => c.school).filter(Boolean))].map(s => s.split(" ")[0]);
  if (compareMode === "age") return [5, 6];
  if (compareMode === "gender") return ["Female", "Male"];
  if (compareMode === "language") return [...new Set(children.map(c => c.language).filter(Boolean))];
  return [];
}

function getGroupFilter(children, compareMode, g) {
  if (compareMode === "school") return children.filter(c => c.school && c.school.startsWith(g));
  if (compareMode === "age") return children.filter(c => c.age === g);
  if (compareMode === "gender") return children.filter(c => c.gender === g);
  if (compareMode === "language") return children.filter(c => c.language === g);
  return children;
}

// ── PDF REPORT ───────────────────────────────────────────────────────────────
export function downloadPDF({ children, compareMode, insights, lang }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 0;

  // ── HEADER BAND ────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND.teal);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(...BRAND.white);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("The Puzzle Project", margin, 11);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Puzzle Box Screener — Overview Report", margin, 18);

  const today = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(8);
  doc.text(`Generated: ${today}`, pageW - margin, 18, { align: "right" });

  y = 34;

  // ── REPORT CONTEXT ─────────────────────────────────────────────────────────
  doc.setTextColor(...BRAND.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Eastern Cape Pilot · All Screened Children", margin, y);

  const compareModeLabel = compareMode === "overall" ? "Overall view"
    : compareMode === "school" ? "Compared by school"
    : compareMode === "age" ? "Compared by age"
    : compareMode === "gender" ? "Compared by gender"
    : "Compared by language";

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.gray);
  doc.text(`View: ${compareModeLabel}`, margin, y + 5);

  y += 14;

  // ── KPI SUMMARY ────────────────────────────────────────────────────────────
  const total = children.length;
  const flagged = children.filter(c => c.flagged).length;
  const onTrack = children.filter(c => c.status === "On Track").length;
  const avgScore = total > 0 ? Math.round(children.reduce((a, c) => a + (c.total || 0), 0) / total) : 0;
  const concerns = children.filter(c => c.status === "Developmental Concerns").length;
  const progressing = children.filter(c => c.status === "Progressing").length;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.dark);
  doc.text("Summary", margin, y);
  y += 4;

  const kpiBoxW = (pageW - margin * 2 - 9) / 4;
  const kpiH = 18;
  const kpis = [
    { label: "Total Screened", value: String(total), color: BRAND.teal },
    { label: "Flagged", value: String(flagged), color: BRAND.pink },
    { label: "On Track", value: String(onTrack), color: BRAND.teal },
    { label: "Avg Score", value: `${avgScore}%`, color: BRAND.orange },
  ];

  kpis.forEach((k, i) => {
    const x = margin + i * (kpiBoxW + 3);
    doc.setFillColor(...BRAND.lightGray);
    doc.roundedRect(x, y, kpiBoxW, kpiH, 2, 2, "F");
    doc.setFillColor(...k.color);
    doc.rect(x, y, 2.5, kpiH, "F");
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...k.color);
    doc.text(k.value, x + kpiBoxW / 2, y + 10, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.gray);
    doc.text(k.label, x + kpiBoxW / 2, y + 15, { align: "center" });
  });

  y += kpiH + 8;

  // ── STATUS BREAKDOWN ───────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BRAND.gray);
  const onTrackPct = total > 0 ? Math.round((onTrack / total) * 100) : 0;
  const progressingPct = total > 0 ? Math.round((progressing / total) * 100) : 0;
  const concernsPct = total > 0 ? Math.round((concerns / total) * 100) : 0;
  doc.text(
    `On Track: ${onTrack} (${onTrackPct}%)    Progressing: ${progressing} (${progressingPct}%)    Developmental Concerns: ${concerns} (${concernsPct}%)`,
    margin, y
  );
  y += 8;

  // ── KEY INSIGHTS ───────────────────────────────────────────────────────────
  if (insights && insights.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.dark);
    doc.text("Key Insights", margin, y);
    y += 4;

    insights.forEach((ins, i) => {
      doc.setFillColor(...BRAND.lightGray);
      doc.roundedRect(margin, y, pageW - margin * 2, 8, 1, 1, "F");
      doc.setFillColor(...ins.color);
      doc.rect(margin, y, 2.5, 8, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND.dark);
      doc.text(ins.text, margin + 5, y + 5);
      y += 10;
    });
    y += 2;
  }

  // ── DOMAIN PERFORMANCE ─────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.dark);
  doc.text("Domain Performance", margin, y);
  y += 2;

  const domainNames = ["Cognitive", "Fine Motor", "Language", "Social", "Emotion", "Moral"];

  if (compareMode === "overall") {
    // Single column — overall averages
    const rows = DOMAIN_KEYS.map((key, i) => {
      const val = domainAvgForGroup(children, key);
      const status = val >= DOMAIN_BENCHMARK ? "Above benchmark" : `${DOMAIN_BENCHMARK - val}% below benchmark`;
      return [domainNames[i], `${val}%`, `${DOMAIN_BENCHMARK}%`, status];
    });

    autoTable(doc, {
      startY: y,
      head: [["Domain", "Score", "Benchmark", "Status"]],
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: BRAND.teal, textColor: BRAND.white, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: BRAND.dark },
      alternateRowStyles: { fillColor: BRAND.lightGray },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === "body") {
          const val = parseFloat(data.row.cells[1].raw);
          data.cell.styles.textColor = val >= DOMAIN_BENCHMARK ? BRAND.teal : BRAND.pink;
        }
      },
      theme: "plain",
    });
  } else {
    // Comparison mode — one column per group
    const groups = getGroups(children, compareMode);
    const head = [["Domain", ...groups.map(g => String(g))]];
    const rows = DOMAIN_KEYS.map((key, i) => {
      const groupVals = groups.map(g => `${domainAvgForGroup(getGroupFilter(children, compareMode, g), key)}%`);
      return [domainNames[i], ...groupVals];
    });

    autoTable(doc, {
      startY: y,
      head,
      body: rows,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: BRAND.teal, textColor: BRAND.white, fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: BRAND.dark },
      alternateRowStyles: { fillColor: BRAND.lightGray },
      theme: "plain",
    });
  }

  y = doc.lastAutoTable.finalY + 8;

  // ── SCHOOL BREAKDOWN ───────────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }

  const schoolCounts = {};
  children.forEach(c => { schoolCounts[c.school] = (schoolCounts[c.school] || 0) + 1; });
  const schoolRows = Object.entries(schoolCounts).map(([name, count]) => {
    const group = children.filter(c => c.school === name);
    const concernRate = group.length > 0 ? Math.round((group.filter(c => c.status === "Developmental Concerns").length / group.length) * 100) : 0;
    return [name, String(count), `${concernRate}%`];
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.dark);
  doc.text("Schools & Regions", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["School", "Children Screened", "Concern Rate"]],
    body: schoolRows,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: BRAND.purple, textColor: BRAND.white, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: BRAND.dark },
    alternateRowStyles: { fillColor: BRAND.lightGray },
    theme: "plain",
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── LANGUAGE BREAKDOWN ─────────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }

  const langCounts = {};
  children.forEach(c => { langCounts[c.language] = (langCounts[c.language] || 0) + 1; });
  const langRows = Object.entries(langCounts).map(([name, count]) => [
    name, String(count), `${total > 0 ? Math.round((count / total) * 100) : 0}%`
  ]);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.dark);
  doc.text("Language of Assessment", margin, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Language", "Children", "Percentage"]],
    body: langRows,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: BRAND.orange, textColor: BRAND.white, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: BRAND.dark },
    alternateRowStyles: { fillColor: BRAND.lightGray },
    theme: "plain",
  });

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...BRAND.lightGray);
    doc.rect(0, 287, pageW, 10, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.gray);
    doc.text("The Puzzle Project · Confidential · Not for distribution", margin, 293);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, 293, { align: "right" });
  }

  doc.save(`PuzzleProject_Report_${today.replace(/ /g, "_")}.pdf`);
}

// ── EXCEL EXPORT ─────────────────────────────────────────────────────────────
export function downloadExcel({ children, compareMode }) {
  const wb = XLSX.utils.book_new();
  const domainNames = ["Cognitive", "Fine Motor", "Language", "Social", "Emotion", "Moral"];

  // Sheet 1 — Summary
  const total = children.length;
  const flagged = children.filter(c => c.flagged).length;
  const onTrack = children.filter(c => c.status === "On Track").length;
  const avgScore = total > 0 ? Math.round(children.reduce((a, c) => a + (c.total || 0), 0) / total) : 0;

  const summaryData = [
    ["The Puzzle Project — Overview Report"],
    [`Generated: ${new Date().toLocaleDateString("en-ZA")}`],
    [],
    ["Metric", "Value"],
    ["Total Screened", total],
    ["Flagged", flagged],
    ["On Track", onTrack],
    ["Average Score (%)", avgScore],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // Sheet 2 — Domain Performance
  let domainSheetData;
  if (compareMode === "overall") {
    domainSheetData = [
      ["Domain", "Average Score (%)", "Benchmark (%)", "Status"],
      ...DOMAIN_KEYS.map((key, i) => {
        const val = domainAvgForGroup(children, key);
        return [domainNames[i], val, DOMAIN_BENCHMARK, val >= DOMAIN_BENCHMARK ? "Above" : "Below"];
      })
    ];
  } else {
    const groups = getGroups(children, compareMode);
    domainSheetData = [
      ["Domain", ...groups.map(g => String(g))],
      ...DOMAIN_KEYS.map((key, i) => [
        domainNames[i],
        ...groups.map(g => domainAvgForGroup(getGroupFilter(children, compareMode, g), key))
      ])
    ];
  }
  const wsDomains = XLSX.utils.aoa_to_sheet(domainSheetData);
  XLSX.utils.book_append_sheet(wb, wsDomains, "Domain Performance");

  // Sheet 3 — All children (anonymised)
  const childRows = children.map((c, i) => ({
    "Child ID": c.id || `C${String(i + 1).padStart(3, "0")}`,
    "Age": c.age,
    "Gender": c.gender,
    "School": c.school,
    "Language": c.language,
    "Status": c.status,
    "Total Score": c.total,
    "Flagged": c.flagged ? "Yes" : "No",
    "Cognitive": c.cognitive,
    "Fine Motor": c.motor,
    "Language Score": c.language_score,
    "Social": c.social,
    "Emotion": c.emotion,
    "Moral": c.moral,
    "Date": c.date,
  }));
  const wsChildren = XLSX.utils.json_to_sheet(childRows);
  XLSX.utils.book_append_sheet(wb, wsChildren, "Children Data");

  XLSX.writeFile(wb, `PuzzleProject_Data_${new Date().toLocaleDateString("en-ZA").replace(/\//g, "-")}.xlsx`);
}