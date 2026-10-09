import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { mapChildRow } from "../../utils/mappers";
import Sidebar from "../shared/Sidebar";
import Overview from "../analytics/Overview";
import ChildrenTable from "../analytics/ChildrenTable";
import ScreenerResults from "../screener/ScreenerResults";
import FlagsAlerts from "../analytics/FlagsAlerts";
import SummaryReport from "../analytics/SummaryReport";

// NOTE: this used to auto-insert 15 fake "Child PB-001"..."Child PB-015"
// rows into the real `children` table the first time anyone opened this
// page with an empty table — leftover demo/seed behaviour from before
// real teachers were using the app. That's genuinely destructive (it
// silently wrote fake records into a live database) and it's exactly
// where the "Child PB-00x" rows cluttering the PuzzleBox Screener's child
// picker and Screening History came from. Removed — this page now only
// ever reads real data. If the table happens to be empty, it just shows
// an empty dashboard, same as every other page in the app already does.

export default function Dashboard({ user }) {
  const [activePage, setActivePage] = useState("overview");
  const [lang, setLang] = useState("en");
  const [children, setChildren] = useState([]);

  // Load from Supabase, and stay live via Realtime.
  useEffect(() => {
    let isMounted = true;

    const loadChildren = async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading children:", error);
        return;
      }

      if (isMounted) setChildren((data || []).map(mapChildRow));
    };

    loadChildren();

    // Realtime: any insert/update/delete on "children" triggers a refetch.
    // NOTE: Realtime must be enabled for this table — Supabase Dashboard →
    // Database → Replication → toggle "children" on. See MIGRATION_GUIDE.md.
    const channel = supabase
      .channel("children-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "children" }, () => {
        loadChildren();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

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