// src/offline/offlineVault.js
// Stores the offline screener encrypted in IndexedDB and syncs offline sessions.
// Login is Firebase, data is Supabase.

import { supabase } from "../supabaseClient";
import { auth } from "../firebase";

// Change this to the table your screening results are saved in
const SESSIONS_TABLE = "screening_sessions";

const DB_NAME = "puzzlebox-offline";
const STORE = "vault";

// ── Firebase token for the edge function ─────────────────────────────────────
async function firebaseHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to use the offline screener.");
  return { "x-firebase-token": await user.getIdToken() };
}

// ── IndexedDB helpers ────────────────────────────────────────────────────────
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  });
}

const get = (k) => run("readonly", (s) => s.get(k));
const put = (k, v) => run("readwrite", (s) => s.put(v, k));
const wipeAll = () => run("readwrite", (s) => s.clear());

// ── Encoding helpers ─────────────────────────────────────────────────────────
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const toB64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

async function encrypt(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { payload: toB64(cipher), iv: toB64(iv) };
}

async function decrypt(key, { payload, iv }) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(iv) }, key, fromB64(payload));
  return JSON.parse(new TextDecoder().decode(plain));
}

// ── Device ID ────────────────────────────────────────────────────────────────
export async function getDeviceId() {
  let id = await get("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    await put("deviceId", id);
  }
  return id;
}

// ── Download (must be online) ────────────────────────────────────────────────
export async function downloadOfflineScreener() {
  const deviceId = await getDeviceId();
  const { data, error } = await supabase.functions.invoke("issue-offline-package", {
    body: { deviceId },
    headers: await firebaseHeaders(),
  });

  if (error) {
    const body = await error.context?.json?.().catch(() => null);
    throw new Error(body?.error || "Download failed. Check your connection and try again.");
  }

  // extractable: false means the browser can use this key but nobody can export it
  const key = await crypto.subtle.importKey("raw", fromB64(data.key), "AES-GCM", false, ["encrypt", "decrypt"]);

  await put("key", key);
  await put("package", { payload: data.payload, iv: data.iv });
  await put("licence", data.licence);
  await put("lastSeen", Date.now());
  await put("queue", []);

  return data.licence;
}

// ── Open the screener (works offline) ────────────────────────────────────────
// Returns { status: "none" | "expired" | "locked" | "ready", licence?, screener? }
export async function loadOfflineScreener() {
  const licence = await get("licence");
  if (!licence) return { status: "none" };

  const now = Date.now();
  const lastSeen = (await get("lastSeen")) || 0;

  // Clock moved backwards by more than 5 minutes: someone may be dodging expiry
  if (now < lastSeen - 5 * 60_000) return { status: "locked", licence };

  if (now > new Date(licence.expiresAt).getTime()) {
    await run("readwrite", (s) => s.delete("package"));
    return { status: "expired", licence };
  }

  await put("lastSeen", now);

  const key = await get("key");
  const pkg = await get("package");
  const screener = await decrypt(key, pkg);

  // Decrypted questions only ever live in memory
  return { status: "ready", licence, screener };
}

// ── Save a completed session offline ─────────────────────────────────────────
export async function saveOfflineSession(session) {
  const key = await get("key");
  const licence = await get("licence");
  if (!key || !licence) throw new Error("No offline screener on this device.");

  const record = {
    ...session,
    is_offline: true,
    licence_id: licence.id,
    captured_at: new Date().toISOString(),
  };

  const queue = (await get("queue")) || [];
  queue.push(await encrypt(key, record));
  await put("queue", queue);
}

export async function pendingCount() {
  return ((await get("queue")) || []).length;
}

// ── Sync when back online ────────────────────────────────────────────────────
export async function syncOfflineSessions() {
  if (!navigator.onLine || !auth.currentUser) return { synced: 0 };

  const licence = await get("licence");
  const key = await get("key");
  if (!licence || !key) return { synced: 0 };

  try {
    const queue = (await get("queue")) || [];
    const remaining = [];
    let synced = 0;

    for (const item of queue) {
      try {
        const record = await decrypt(key, item);
        const { error } = await supabase.from(SESSIONS_TABLE).insert(record);
        if (error) remaining.push(item);
        else synced++;
      } catch {
        remaining.push(item);
      }
    }

    await put("queue", remaining);

    // Ask the server if this licence was cancelled, and record the sync time
    const { data: status } = await supabase.functions.invoke("issue-offline-package", {
      body: { action: "status", licenceId: licence.id, markSynced: synced > 0 },
      headers: await firebaseHeaders(),
    });

    // Cancelled licence (lost device, staff left): wipe once everything has uploaded
    if (status?.revoked && remaining.length === 0) await wipeAll();

    return { synced, remaining: remaining.length };
  } catch {
    return { synced: 0 };
  }
}

// Call once in App.js so sessions sync as soon as connection returns
export function startAutoSync() {
  window.addEventListener("online", () => syncOfflineSessions());
  syncOfflineSessions();
}