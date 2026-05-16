import React, { useState, useMemo, useEffect } from "react";

const ALL_CHILDREN = [
  { id:"PB-001", name:"Child PB-001", school:"Adelaide Primary",    district:"Komani District",        age:6, gender:"F", language:"isiXhosa",  cognitive:72, motor:68, language_score:65, social:70, emotion:74, moral:69, total:70, status:"On Track",               flagged:false, date:"2026-02-05", examiner:"Dr. Moyo" },
  { id:"PB-002", name:"Child PB-002", school:"Adelaide Primary",    district:"Komani District",        age:5, gender:"M", language:"isiXhosa",  cognitive:38, motor:44, language_score:40, social:45, emotion:42, moral:43, total:42, status:"Developmental Concerns",  flagged:true,  date:"2026-02-10", examiner:"Dr. Moyo" },
  { id:"PB-003", name:"Child PB-003", school:"Komani ECD",          district:"Komani District",        age:6, gender:"F", language:"Afrikaans", cognitive:80, motor:75, language_score:78, social:82, emotion:79, moral:77, total:79, status:"On Track",               flagged:false, date:"2026-02-12", examiner:"Ms. Pietersen" },
  { id:"PB-004", name:"Child PB-004", school:"Komani ECD",          district:"Komani District",        age:5, gender:"M", language:"Afrikaans", cognitive:30, motor:35, language_score:33, social:36, emotion:34, moral:38, total:34, status:"Developmental Concerns",  flagged:true,  date:"2026-02-14", examiner:"Ms. Pietersen" },
  { id:"PB-005", name:"Child PB-005", school:"edcsc",               district:"Stutterheim District",   age:6, gender:"F", language:"English",   cognitive:58, motor:62, language_score:55, social:60, emotion:57, moral:54, total:58, status:"Progressing",            flagged:false, date:"2026-02-17", examiner:"Mr. Dlamini" },
  { id:"PB-006", name:"Child PB-006", school:"edcsc",               district:"Stutterheim District",   age:6, gender:"M", language:"English",   cognitive:65, motor:70, language_score:68, social:63, emotion:66, moral:64, total:66, status:"Progressing",            flagged:false, date:"2026-02-18", examiner:"Mr. Dlamini" },
  { id:"PB-007", name:"Child PB-007", school:"Stutterheim Primary", district:"Stutterheim District",   age:5, gender:"F", language:"isiXhosa",  cognitive:76, motor:72, language_score:74, social:78, emotion:75, moral:73, total:75, status:"On Track",               flagged:false, date:"2026-02-19", examiner:"Dr. Moyo" },
  { id:"PB-008", name:"Child PB-008", school:"Stutterheim Primary", district:"Stutterheim District",   age:6, gender:"M", language:"isiXhosa",  cognitive:36, motor:40, language_score:38, social:41, emotion:39, moral:42, total:39, status:"Developmental Concerns",  flagged:true,  date:"2026-02-21", examiner:"Dr. Moyo" },
  { id:"PB-009", name:"Child PB-009", school:"Fort Beaufort ECD",   district:"Fort Beaufort District", age:5, gender:"F", language:"Afrikaans", cognitive:62, motor:58, language_score:60, social:55, emotion:63, moral:59, total:60, status:"Progressing",            flagged:false, date:"2026-02-25", examiner:"Ms. Pietersen" },
  { id:"PB-010", name:"Child PB-010", school:"Fort Beaufort ECD",   district:"Fort Beaufort District", age:6, gender:"M", language:"English",   cognitive:78, motor:82, language_score:79, social:80, emotion:77, moral:76, total:79, status:"On Track",               flagged:false, date:"2026-02-27", examiner:"Mr. Dlamini" },
  { id:"PB-011", name:"Child PB-011", school:"Fort Beaufort ECD",   district:"Fort Beaufort District", age:5, gender:"F", language:"isiXhosa",  cognitive:28, motor:32, language_score:30, social:29, emotion:33, moral:31, total:30, status:"Developmental Concerns",  flagged:true,  date:"2026-03-03", examiner:"Dr. Moyo" },
  { id:"PB-012", name:"Child PB-012", school:"Adelaide Primary",    district:"Komani District",        age:6, gender:"M", language:"Afrikaans", cognitive:55, motor:60, language_score:57, social:52, emotion:58, moral:54, total:56, status:"Progressing",            flagged:false, date:"2026-03-05", examiner:"Ms. Pietersen" },
  { id:"PB-013", name:"Child PB-013", school:"Komani ECD",          district:"Komani District",        age:6, gender:"F", language:"English",   cognitive:83, motor:79, language_score:81, social:85, emotion:82, moral:80, total:82, status:"On Track",               flagged:false, date:"2026-03-07", examiner:"Mr. Dlamini" },
  { id:"PB-014", name:"Child PB-014", school:"edcsc",               district:"Stutterheim District",   age:5, gender:"M", language:"isiXhosa",  cognitive:67, motor:71, language_score:69, social:65, emotion:68, moral:66, total:68, status:"Progressing",            flagged:false, date:"2026-03-10", examiner:"Dr. Moyo" },
  { id:"PB-015", name:"Child PB-015", school:"Stutterheim Primary", district:"Stutterheim District",   age:6, gender:"F", language:"Afrikaans", cognitive:74, motor:70, language_score:72, social:76, emotion:73, moral:71, total:73, status:"On Track",               flagged:false, date:"2026-03-12", examiner:"Ms. Pietersen" },
  { id:"PB-016", name:"Child PB-016", school:"Fort Beaufort ECD",   district:"Fort Beaufort District", age:5, gender:"M", language:"English",   cognitive:59, motor:63, language_score:61, social:57, emotion:60, moral:58, total:60, status:"Progressing",            flagged:false, date:"2026-03-15", examiner:"Mr. Dlamini" },
];

const DOMAINS = [
  { key:"cognitive",      label:"Cognitive" },
  { key:"motor",          label:"Fine Motor" },
  { key:"language_score", label:"Language" },
  { key:"social",         label:"Social Cognition" },
  { key:"emotion",        label:"Emotion" },
  { key:"moral",          label:"Moral" },
];

const STATUS_META = {
  "On Track":               { color:"#0E7A6E", bg:"#E6F4F2", dot:"#0E7A6E" },
  "Progressing":            { color:"#A84F00", bg:"#FEF0E4", dot:"#F26522" },
  "Developmental Concerns": { color:"#991040", bg:"#FDEDF3", dot:"#E8175D" },
};

const domainAvg = (arr, key) =>
  arr.length ? Math.round(arr.reduce((s, c) => s + (c[key] || 0), 0) / arr.length) : 0;
const pct = (n, t) => (t ? Math.round((n / t) * 100) : 0);
const unique = (arr, key) => [...new Set(arr.map(c => c[key]))].filter(Boolean).sort();

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META["Progressing"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700,
      background:m.bg, color:m.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot, flexShrink:0 }} />
      {status}
    </span>
  );
}

function ScoreBar({ value }) {
  const color = value >= 75 ? "#0E7A6E" : value >= 50 ? "#F26522" : "#E8175D";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"#EBEBEB", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:99 }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color, width:32, textAlign:"right" }}>{value}%</span>
    </div>
  );
}

function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{ padding:"20px 22px", borderTop:`3px solid ${accent}`,
      background:"#fff", borderRadius:10, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.08em",
        textTransform:"uppercase", color:"#AAA", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:900, color:"#111", lineHeight:1,
        letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#AAA", marginTop:5 }}>{sub}</div>}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:10, fontWeight:800, letterSpacing:"0.08em",
        textTransform:"uppercase", color:"#888" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding:"8px 32px 8px 12px", borderRadius:8, border:"1.5px solid #E0E0E0",
        fontSize:13, color:"#111", background:"#fff", cursor:"pointer",
        fontFamily:"inherit", appearance:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center",
        minWidth:170, outline:"none",
      }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── PRINT FUNCTION ───────────────────────────────────────────────────────────
// Opens a new window with just the report content and prints it
function printReport(htmlContent) {
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>PuzzleBox Screener Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Nunito', sans-serif; color: #111; background: #fff; padding: 40px; }
          @page { size: A4; margin: 14mm; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

export default function SummaryReport({ children: propChildren, lang: initialLang = "en" }) {
  const [filterScope, setFilterScope] = useState("all");
  const [filterValue, setFilterValue] = useState("");
  const [lang, setLang] = useState(initialLang);
  const reportRef = React.useRef(null);

  const source = propChildren || ALL_CHILDREN;
  const schools   = unique(source, "school");
  const districts = unique(source, "district");
  const childIds  = source.map(c => c.id).sort();

  const scopeOptions = [
    { value:"all",      label:"All Children" },
    { value:"child",    label:"Child" },
    { value:"school",   label:"School" },
    { value:"district", label:"District" },
  ];

  const data = useMemo(() => {
    if (!filterValue || filterScope === "all") return source;
    if (filterScope === "child")    return source.filter(c => c.id === filterValue);
    if (filterScope === "school")   return source.filter(c => c.school === filterValue);
    if (filterScope === "district") return source.filter(c => c.district === filterValue);
    return source;
  }, [filterScope, filterValue, source]);

  const total       = data.length;
  const onTrack     = data.filter(c => c.status === "On Track").length;
  const progressing = data.filter(c => c.status === "Progressing").length;
  const concerns    = data.filter(c => c.status === "Developmental Concerns").length;
  const flaggedList = data.filter(c => c.flagged);
  const avgTotal    = domainAvg(data, "total");
  const schoolSet   = unique(data, "school");
  const langSet     = unique(data, "language");

  const isSingleChild = filterScope === "child" && filterValue && data.length === 1;
  const child = isSingleChild ? data[0] : null;

  const scopeLabel = !filterValue || filterScope === "all"
    ? "All Children · Eastern Cape Pilot 2026"
    : filterScope === "child"    ? `Individual Report · ${filterValue}`
    : filterScope === "school"   ? `School Report · ${filterValue}`
    : `District Report · ${filterValue}`;

  const today = new Date().toLocaleDateString("en-ZA", { day:"numeric", month:"long", year:"numeric" });

  const handlePrint = () => {
    if (reportRef.current) {
      printReport(reportRef.current.innerHTML);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #F2F1EE; font-family: 'Nunito', sans-serif; color: #111; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#F2F1EE" }}>

        {/* CONTROL BAR */}
        <div style={{ background:"#fff", borderBottom:"1px solid #E5E5E5", padding:"0 40px" }}>
          <div style={{ maxWidth:1060, margin:"0 auto", padding:"16px 0",
            display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>

            <div style={{ fontWeight:900, fontSize:16, color:"#111", marginRight:12, flexShrink:0 }}>
              The Puzzle Project
            </div>

            <div style={{ width:1, height:28, background:"#E5E5E5", flexShrink:0 }} />

            <FilterSelect
              label="Filter By"
              value={filterScope}
              onChange={v => { setFilterScope(v); setFilterValue(""); }}
              options={scopeOptions}
              placeholder="All children"
            />

            {filterScope === "child" && (
              <FilterSelect label="Child ID" value={filterValue} onChange={setFilterValue}
                options={childIds.map(id => ({ value: id, label: id }))} placeholder="Select child…" />
            )}
            {filterScope === "school" && (
              <FilterSelect label="School" value={filterValue} onChange={setFilterValue}
                options={schools.map(s => ({ value: s, label: s }))} placeholder="Select school…" />
            )}
            {filterScope === "district" && (
              <FilterSelect label="District" value={filterValue} onChange={setFilterValue}
                options={districts.map(d => ({ value: d, label: d }))} placeholder="Select district…" />
            )}

            <div style={{ flex:1 }} />

            <div style={{ display:"flex", gap:4 }}>
              {["en","af","xh"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding:"5px 11px", borderRadius:6,
                  border:`1.5px solid ${lang===l?"#111":"#DDD"}`,
                  background: lang===l?"#111":"transparent",
                  color: lang===l?"#fff":"#888",
                  fontSize:10, fontWeight:800, cursor:"pointer",
                  textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"inherit",
                }}>{l}</button>
              ))}
            </div>

            <div style={{ width:1, height:28, background:"#E5E5E5", flexShrink:0 }} />

            {/* PRINT BUTTON — uses new window approach */}
            <button onClick={handlePrint} style={{
              display:"flex", alignItems:"center", gap:7,
              padding:"8px 18px", borderRadius:8,
              background:"#111", color:"#fff", border:"none",
              fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9V2h12v7"/><rect x="6" y="14" width="12" height="8"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              </svg>
              Print / PDF
            </button>
          </div>
        </div>

        {/* REPORT DOCUMENT */}
        <div style={{ maxWidth:1060, margin:"0 auto", padding:"36px 40px" }}>
          <div ref={reportRef} style={{
            background:"#fff", borderRadius:16,
            boxShadow:"0 2px 32px rgba(0,0,0,0.08)", overflow:"hidden",
          }}>

            {/* HEADER */}
            <div style={{ padding:"44px 52px 36px", borderBottom:"1px solid #EBEBEB" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:24 }}>
                <div>
                  <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:800,
                    letterSpacing:"0.12em", textTransform:"uppercase", color:"#AAA" }}>
                    PuzzleBox Screener System
                  </p>
                  <h1 style={{ margin:"0 0 8px", fontSize:34, fontWeight:900, lineHeight:1.05,
                    letterSpacing:"-0.02em", color:"#111" }}>
                    {isSingleChild ? child.name : "Summary Report"}
                  </h1>
                  <p style={{ margin:0, fontSize:13, color:"#888", fontWeight:400 }}>{scopeLabel}</p>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700,
                    letterSpacing:"0.08em", textTransform:"uppercase", color:"#AAA" }}>Generated</p>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#555" }}>{today}</p>
                  {isSingleChild && (
                    <p style={{ margin:"10px 0 0", fontSize:11, color:"#AAA" }}>
                      Examiner: <strong style={{ color:"#555" }}>{child.examiner}</strong>
                    </p>
                  )}
                </div>
              </div>
              <div style={{ marginTop:28, height:2, width:80, borderRadius:99,
                background:"linear-gradient(90deg,#0E7A6E,#F26522,#E8175D)" }} />
            </div>

            <div style={{ padding:"44px 52px" }}>

              {isSingleChild ? (
                <>
                  <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:36 }}>
                    {[
                      ["School",   child.school],
                      ["District", child.district],
                      ["Age",      `${child.age} years`],
                      ["Language", child.language],
                      ["Date",     child.date],
                    ].map(([l,v]) => (
                      <div key={l} style={{ padding:"10px 16px", background:"#F7F7F5",
                        borderRadius:8, border:"1px solid #E8E8E8" }}>
                        <div style={{ fontSize:9, fontWeight:800, letterSpacing:"0.09em",
                          textTransform:"uppercase", color:"#AAA", marginBottom:4 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#111" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"180px 1fr",
                    gap:32, marginBottom:40, alignItems:"start" }}>
                    <div style={{ textAlign:"center", padding:"28px 20px",
                      background:"#F7F7F5", borderRadius:12, border:"1px solid #E8E8E8" }}>
                      <p style={{ margin:"0 0 10px", fontSize:9, fontWeight:800,
                        letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA" }}>Total Score</p>
                      <div style={{ fontSize:64, fontWeight:900, lineHeight:1,
                        color: child.total>=75?"#0E7A6E":child.total>=50?"#F26522":"#E8175D",
                      }}>{child.total}%</div>
                      <div style={{ marginTop:14 }}><StatusPill status={child.status} /></div>
                      {child.flagged && (
                        <p style={{ margin:"10px 0 0", fontSize:11, color:"#991040", fontWeight:700 }}>
                          Flagged for follow-up
                        </p>
                      )}
                    </div>
                    <div>
                      <p style={{ margin:"0 0 18px", fontSize:10, fontWeight:800,
                        letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA" }}>
                        Domain Breakdown
                      </p>
                      {DOMAINS.map(d => (
                        <div key={d.key} style={{ marginBottom:14 }}>
                          <p style={{ margin:"0 0 5px", fontSize:12, fontWeight:600, color:"#333" }}>{d.label}</p>
                          <ScoreBar value={child[d.key] || 0} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin:"0 0 14px", fontSize:10, fontWeight:800,
                    letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA" }}>
                    Project Overview
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:40 }}>
                    <StatBox label="Screened"    value={total}          sub={`${schoolSet.length} school${schoolSet.length!==1?"s":""}`} accent="#555" />
                    <StatBox label="On Track"    value={onTrack}        sub={`${pct(onTrack,total)}% of cohort`}     accent="#0E7A6E" />
                    <StatBox label="Progressing" value={progressing}    sub={`${pct(progressing,total)}% of cohort`} accent="#F26522" />
                    <StatBox label="Concerns"    value={concerns}       sub={`${pct(concerns,total)}% of cohort`}    accent="#E8175D" />
                    <StatBox label="Avg Score"   value={`${avgTotal}%`} sub="cohort average"                         accent="#888" />
                  </div>

                  <p style={{ margin:"0 0 18px", fontSize:10, fontWeight:800,
                    letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA" }}>
                    Domain Performance
                  </p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", columnGap:52, marginBottom:44 }}>
                    {DOMAINS.map(d => (
                      <div key={d.key} style={{ marginBottom:16 }}>
                        <p style={{ margin:"0 0 6px", fontSize:12, fontWeight:600, color:"#333" }}>{d.label}</p>
                        <ScoreBar value={domainAvg(data, d.key)} />
                      </div>
                    ))}
                  </div>

                  <div style={{ height:1, background:"#EBEBEB", marginBottom:36 }} />

                  <p style={{ margin:"0 0 16px", fontSize:10, fontWeight:800,
                    letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA" }}>
                    All Screened Children ({total})
                  </p>
                  <div style={{ overflowX:"auto", marginBottom:44 }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                      <thead>
                        <tr style={{ borderBottom:"2px solid #111" }}>
                          {["Child ID","School","Age","Language","Score","Status","Date"].map(h => (
                            <th key={h} style={{ padding:"8px 12px", textAlign:"left",
                              fontSize:10, fontWeight:800, letterSpacing:"0.07em",
                              textTransform:"uppercase", color:"#666", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((c, i) => (
                          <tr key={c.id} style={{ borderBottom:"1px solid #F0F0F0",
                            background: i%2===0?"#fff":"#FAFAFA" }}>
                            <td style={{ padding:"10px 12px", fontWeight:700, color:"#111" }}>{c.id}</td>
                            <td style={{ padding:"10px 12px", color:"#555" }}>{c.school}</td>
                            <td style={{ padding:"10px 12px", color:"#555" }}>{c.age} yrs</td>
                            <td style={{ padding:"10px 12px", color:"#555" }}>{c.language}</td>
                            <td style={{ padding:"10px 12px" }}>
                              <span style={{ fontWeight:800,
                                color:c.total>=75?"#0E7A6E":c.total>=50?"#F26522":"#E8175D" }}>
                                {c.total}%
                              </span>
                            </td>
                            <td style={{ padding:"10px 12px" }}><StatusPill status={c.status} /></td>
                            <td style={{ padding:"10px 12px", color:"#AAA", fontStyle:"italic", fontSize:11 }}>{c.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {flaggedList.length > 0 && (
                    <>
                      <div style={{ height:1, background:"#EBEBEB", marginBottom:36 }} />
                      <p style={{ margin:"0 0 16px", fontSize:10, fontWeight:800,
                        letterSpacing:"0.1em", textTransform:"uppercase", color:"#991040" }}>
                        Flagged for Follow-up ({flaggedList.length})
                      </p>
                      <div style={{ display:"grid",
                        gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:12, marginBottom:44 }}>
                        {flaggedList.map(c => (
                          <div key={c.id} style={{ padding:"16px 18px", borderRadius:10,
                            border:"1px solid #F0C0D0", background:"#FEF5F8" }}>
                            <p style={{ margin:"0 0 2px", fontWeight:800, fontSize:13, color:"#111" }}>{c.id}</p>
                            <p style={{ margin:"0 0 10px", fontSize:11, color:"#888" }}>{c.school}</p>
                            <div style={{ fontSize:28, fontWeight:900, color:"#E8175D", lineHeight:1 }}>{c.total}%</div>
                            <div style={{ marginTop:8 }}><StatusPill status={c.status} /></div>
                            <p style={{ margin:"8px 0 0", fontSize:10, color:"#AAA", fontStyle:"italic" }}>{c.date}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div style={{ height:1, background:"#EBEBEB", marginBottom:32 }} />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:8 }}>
                    {[["Schools Covered", schoolSet], ["Languages Used", langSet]].map(([lbl, set]) => (
                      <div key={lbl}>
                        <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:800,
                          letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA" }}>{lbl}</p>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {set.map(s => (
                            <span key={s} style={{ fontSize:11, fontWeight:600, color:"#444",
                              background:"#F0F0EE", padding:"4px 10px", borderRadius:6,
                              border:"1px solid #E5E5E5" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ height:1, background:"#EBEBEB", margin:"40px 0 28px" }} />
              <div style={{ display:"flex", gap:14, padding:"16px 20px",
                background:"#FEF5F8", borderRadius:10, border:"1px solid #F0C0D0", marginBottom:16 }}>
                <span style={{ fontSize:16, flexShrink:0, lineHeight:1.4 }}>⚠</span>
                <p style={{ margin:0, fontSize:11, color:"#880030", lineHeight:1.8 }}>
                  <strong>Disclaimer:</strong> This report contains simplified percentile summaries only.
                  Results must not be interpreted as clinical diagnoses. Detailed domain scores are
                  available to registered psychologists only.
                </p>
              </div>
              <p style={{ margin:0, fontSize:11, color:"#AAA", lineHeight:1.9 }}>
                Data collected as part of the PuzzleBox Screener standardisation phase and is intended
                to support evidence-based funding applications and programme evaluation.
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}