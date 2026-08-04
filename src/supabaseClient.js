// supabaseClient.js is the Supabase equivalent of firebase.js — it establishes
// the connection to your Supabase project once, and every other file imports
// `supabase` from here to read/write the database.

import { createClient } from "@supabase/supabase-js";

// These come from Supabase Dashboard → Project Settings → API.
// supabaseUrl is your project's unique REST endpoint.
// supabaseAnonKey is the public "anon" key — safe to expose in the browser
// bundle (same idea as Firebase's apiKey), because it only grants whatever
// access your Row Level Security policies allow. NEVER put the
// "service_role" key in frontend code — that one bypasses RLS entirely.

// Create React App only exposes env vars prefixed with REACT_APP_ to the
// browser bundle, so both variables below must use that prefix, and must be
// set in a .env file at the project root (see .env.example).

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly at startup instead of silently breaking every DB call —
  // this almost always means .env is missing or the dev server wasn't
  // restarted after adding it (CRA only reads .env at startup).
  console.error(
    "Missing Supabase environment variables. Check that .env contains " +
    "REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY, then restart `npm start`."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
