import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Shared by the public Training page (Trainingpage.js), the logged-in
// Training tab (MemberArea.js), and the admin editor
// (TrainingModulesAdmin.js) — all three read the same table, so a change
// an admin publishes shows up everywhere immediately on refresh.
//
// See supabase/migrations/004_training_modules.sql for the table this
// reads from.

export const COLOR_KEYS = ["teal", "pink", "purple", "orange", "maroon"];

// Used only if the `training_modules` table can't be reached (migration
// 004 not run yet, or offline) or is currently empty. Keeps the training
// pages from breaking — Supabase is the source of truth once it's seeded.
export const FALLBACK_MODULES = [
  { id: "fallback-1", sortOrder: 1, title: "Introduction to The Puzzle Box", description: "", colorKey: "teal", status: "coming_soon", contentUrl: null },
  { id: "fallback-2", sortOrder: 2, title: "Research Background & Psychometric Properties", description: "", colorKey: "pink", status: "coming_soon", contentUrl: null },
  { id: "fallback-3", sortOrder: 3, title: "Test Equipment & Setting Up", description: "", colorKey: "purple", status: "coming_soon", contentUrl: null },
  { id: "fallback-4", sortOrder: 4, title: "Administration", description: "", colorKey: "orange", status: "coming_soon", contentUrl: null },
  { id: "fallback-5", sortOrder: 5, title: "Interpretation", description: "", colorKey: "teal", status: "coming_soon", contentUrl: null },
  { id: "fallback-6", sortOrder: 6, title: "Online Navigation", description: "", colorKey: "pink", status: "coming_soon", contentUrl: null },
  { id: "fallback-7", sortOrder: 7, title: "Report Writing & Referral", description: "", colorKey: "purple", status: "coming_soon", contentUrl: null },
];

function mapRow(row) {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    title: row.title,
    description: row.description || "",
    colorKey: COLOR_KEYS.includes(row.color_key) ? row.color_key : "teal",
    status: row.status === "published" ? "published" : "coming_soon",
    contentUrl: row.content_url || null,
  };
}

export function useTrainingModules() {
  const [modules, setModules] = useState(null); // null = still loading
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("training_modules")
      .select("*")
      .order("sort_order", { ascending: true });

    if (err) {
      console.error("Error loading training modules:", err);
      setError("Could not load training modules — showing the default set.");
      setModules(FALLBACK_MODULES);
      return;
    }

    setError("");
    setModules(data && data.length > 0 ? data.map(mapRow) : FALLBACK_MODULES);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { modules: modules || [], loading: modules === null, error, refresh };
}