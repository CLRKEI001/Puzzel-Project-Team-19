// AnalyticsPanels.js — the "Full Analytics Dashboard" content (Overview,
// Student Records, Screener Results, Flags & Alerts, Summary Report) as a
// self-contained block that can sit INSIDE a role's home page, rather than
// being its own page with its own sidebar. Used by PsychologistHome so the
// psychologist's dashboard and the analytics live together on one page with
// one theme. Dashboard.js (the standalone shell) still exists for any role
// that doesn't have its own home screen.
//
// Loads real children from Supabase and stays live via Realtime, same as
// Dashboard.js did.

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { mapChildRow } from "../lib/mappers";
import Overview from "./Overview";
import ChildrenTable from "./ChildrenTable";
import ScreenerResults from "./ScreenerResults";
import FlagsAlerts from "./FlagsAlerts";
import SummaryReport from "./SummaryReport";

const TABS = {
  en: { overview: "Overview", children: "Student Records", results: "Screener Results", flags: "Flags & Alerts", report: "Summary Report" },
  af: { overview: "Oorsig", children: "Leerlingsrekords", results: "Sifterresultate", flags: "Vlae & Waarskuwings", report: "Opsommingsverslag" },
  xh: { overview: "Inkcazelo", children: "Iirekhodi zabaFundi", results: "Iziphumo", flags: "Izikhombisi", report: "Ingxelo Efuphi" },
};

export const ANALYTICS_LABELS = TABS;
export const ANALYTICS_SUBS = {
  en: { overview: "Eastern Cape pilot · All screened children", children: "All screened participants", results: "Latest screening sessions", flags: "Children requiring follow-up", report: "Exportable summary for funders" },
  af: { overview: "Oos-Kaap loodsprojek · Alle gesifde kinders", children: "Alle deelnemers", results: "Laaste sifsessies", flags: "Kinders wat opvolg benodig", report: "Uitvoerbare opsomming vir befondsers" },
  xh: { overview: "Umzekelo weMpuma Koloni · Bonke abantwana", children: "Bonke abathathi-nxaxheba", results: "Iiseshoni zokugqibela", flags: "Abantwana abafuna ukulandelwa", report: "Ingxelo yabaxhasi" },
};

// Renders ONE analytics page (page = overview | children | results | flags |
// report). The role home's sidebar owns the navigation between them, so each
// is its own page — this component just loads the data and shows the panel.
export default function AnalyticsPanels({ lang = "en", page = "overview" }) {
  const tab = page;
  const [children, setChildren] = useState([]);

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

    const channel = supabase
      .channel("analytics-panels-children")
      .on("postgres_changes", { event: "*", schema: "public", table: "children" }, () => {
        loadChildren();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="rh-analytics" id="rh-analytics">
      <div className="rh-analytics-body">
        {tab === "overview" && <Overview children={children} lang={lang} />}
        {tab === "children" && <ChildrenTable children={children} lang={lang} />}
        {tab === "results" && <ScreenerResults lang={lang} />}
        {tab === "flags" && <FlagsAlerts children={children} lang={lang} />}
        {tab === "report" && <SummaryReport children={children} lang={lang} />}
      </div>
    </section>
  );
}