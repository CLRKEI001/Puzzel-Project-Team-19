// src/offline/offlineVault.js
// Stores the offline screener encrypted in IndexedDB and syncs offline sessions.
// Login is Firebase, data is Supabase.
//
// Each captured session is stored under its own key ("session:<id>") rather
// than in one shared array, so saving and syncing can never overwrite each
// other, and a session is only deleted after Supabase has accepted it.

import { supabase } from "../supabaseClient";
import { auth } from "../firebase";

// Same table the online screener (PuzzleBoxScreener.js) saves to, so offline
// results go through the normal psychologist review flow.
const SESSIONS_TABLE = "puzzlebox_screenings";
// Postgres "unique violation": this offline result was already uploaded
const ALREADY_SAVED = "23505";

const DB_NAME = "puzzlebox-offline";
const STORE = "vault";
const SESSION_PREFIX = "session:";
const DRAFT_PREFIX = "draft:"; // in-progress screening, one per child

// Fired on window whenever the number of waiting sessions changes,
// so the UI can update its "waiting to sync" count.
export const QUEUE_EVENT = "offline-queue-changed";
const notify = () => window.dispatchEvent(new Event(QUEUE_EVENT));

// ── Firebase token for the edge function ─────────────────────────────────────
async function firebaseHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to use the offline screener.");
  return { "x-firebase-token": await user.getIdToken() };
}

// ── IndexedDB helpers ────────────────────────────────────────────────────────
// One shared connection instead of opening a new one on every call.
let dbPromise = null;
function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => { db.close(); dbPromise = null; };
        resolve(db);
      };
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
  }
  return dbPromise;
}

async function run(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const get = (k) => run("readonly", (s) => s.get(k));
const put = (k, v) => run("readwrite", (s) => s.put(v, k));
const del = (k) => run("readwrite", (s) => s.delete(k));
const wipeAll = () => run("readwrite", (s) => s.clear());

const sessionRange = () => IDBKeyRange.bound(SESSION_PREFIX, SESSION_PREFIX + "￿");
const sessionKeys = () => run("readonly", (s) => s.getAllKeys(sessionRange()));
const draftRange = () => IDBKeyRange.bound(DRAFT_PREFIX, DRAFT_PREFIX + "\uffff");
const draftKeys = () => run("readonly", (s) => s.getAllKeys(draftRange()));

// Older versions kept every session in one "queue" array. Move them to their
// own keys, in a single transaction so it can't half-happen or run twice.
let migrated = null;
function migrateLegacyQueue() {
  if (!migrated) {
    migrated = run("readwrite", (s) => {
      const req = s.get("queue");
      req.onsuccess = () => {
        const legacy = req.result;
        if (!Array.isArray(legacy)) return;
        legacy.forEach((item) => s.put(item, SESSION_PREFIX + crypto.randomUUID()));
        s.delete("queue");
      };
      return req;
    }).catch((e) => { migrated = null; throw e; });
  }
  return migrated;
}

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
  // Waiting sessions are encrypted with the current key. Downloading issues a
  // new key, which would make them unreadable, so upload them first and refuse
  // to continue if any are still left.
  if ((await pendingCount()) > 0) {
    await syncOfflineSessions();
    const left = await pendingCount();
    if (left > 0) {
      throw new Error(
        `${left} ${left === 1 ? "result hasn't" : "results haven't"} uploaded yet. ` +
        "Stay connected and try again, so nothing is lost when the screener is downloaded."
      );
    }
  }

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

  return data.licence;
}

// ── Open the screener (works offline) ────────────────────────────────────────
// Returns { status: "none" | "expired" | "locked" | "damaged" | "other_user" | "ready", licence?, screener? }
export async function loadOfflineScreener() {
  const licence = await get("licence");
  if (!licence) return { status: "none" };

  // The licence belongs to whoever downloaded it. If someone else is signed in
  // on this browser, don't open it for them.
  if (licence.userId && auth.currentUser && auth.currentUser.uid !== licence.userId) {
    return { status: "other_user", licence };
  }

  const now = Date.now();
  const lastSeen = (await get("lastSeen")) || 0;

  // Clock moved backwards by more than 5 minutes: someone may be dodging expiry
  if (now < lastSeen - 5 * 60_000) return { status: "locked", licence };

  if (now > new Date(licence.expiresAt).getTime()) {
    await del("package");
    return { status: "expired", licence };
  }

  const key = await get("key");
  const pkg = await get("package");
  if (!key || !pkg) return { status: "none" };

  let screener;
  try {
    screener = await decrypt(key, pkg);
  } catch {
    // Stored package is corrupt or doesn't match the key
    return { status: "damaged", licence };
  }

  await put("lastSeen", now);

  // Decrypted questions only ever live in memory
  return { status: "ready", licence, screener };
}

// ── Save a completed session offline ─────────────────────────────────────────
export async function saveOfflineSession(session) {
  const key = await get("key");
  const licence = await get("licence");
  if (!key || !licence) throw new Error("No offline screener on this device.");

  // The same ID is used for the local key, the screening's own id and the
  // offline_session_id column (both unique in Supabase), so a retried upload
  // can never create a copy.
  const offlineId = session.id || crypto.randomUUID();
  const record = {
    ...session,
    id: offlineId,
    is_offline: true,
    licence_id: licence.id,
    captured_at: new Date().toISOString(),
    offline_session_id: offlineId,
  };

  await put(SESSION_PREFIX + offlineId, await encrypt(key, record));
  notify();
}

// ── In-progress screenings (drafts) ──────────────────────────────────────────
// Autosaved on the device as the examiner goes, encrypted like everything
// else, so a refresh or flat battery mid-screening loses nothing.
export async function saveDraft(draft) {
  const key = await get("key");
  if (!key) throw new Error("No offline screener on this device.");
  await put(DRAFT_PREFIX + draft.child_id, await encrypt(key, draft));
}

export async function getDraft(childId) {
  const key = await get("key");
  const item = await get(DRAFT_PREFIX + childId);
  if (!key || !item) return null;
  try { return await decrypt(key, item); } catch { return null; }
}

export const deleteDraft = (childId) => del(DRAFT_PREFIX + childId);

export async function pendingCount() {
  await migrateLegacyQueue();
  return (await sessionKeys()).length;
}

// ── Sync when back online ────────────────────────────────────────────────────
// Only one sync runs at a time. A second call while one is running gets the
// same result instead of starting another upload of the same sessions.
let syncing = null;
export function syncOfflineSessions() {
  if (!syncing) syncing = doSync().finally(() => { syncing = null; });
  return syncing;
}

async function doSync() {
  if (!navigator.onLine || !auth.currentUser) return { synced: 0 };

  const licence = await get("licence");
  const key = await get("key");
  if (!licence || !key) return { synced: 0 };

  await migrateLegacyQueue();

  let synced = 0;
  let remaining = 0;

  try {
    for (const k of await sessionKeys()) {
      try {
        const item = await get(k);
        // _notify carries the psychologist message; it isn't a table column
        const { _notify, ...record } = await decrypt(key, item);
        const { error } = await supabase.from(SESSIONS_TABLE).insert(record);
        // An earlier upload got through but the reply was lost: it's already
        // saved, so treat it as done rather than retrying forever.
        if (error && error.code !== ALREADY_SAVED) { remaining++; continue; }

        // Same "ready for review" message the online submit sends. Only on a
        // first successful upload, so a retry doesn't notify twice. If it
        // fails the screening is still saved, as online.
        if (!error && _notify) {
          const { error: notifyErr } = await supabase.from("messages").insert({
            ..._notify,
            screening_id: record.id,
            sent_by: "Teacher",
            recipient_role: "psychologist",
            message_type: "screening_ready_for_review",
          });
          if (notifyErr) console.error("Could not notify the psychologist:", notifyErr.message);
        }
        // Delete this one session only once Supabase has accepted it
        await del(k);
        synced++;
      } catch {
        remaining++;
      }
    }

    if (synced > 0) notify();

    // Ask the server if this licence was cancelled, and record the sync time
    const { data: status } = await supabase.functions.invoke("issue-offline-package", {
      body: { action: "status", licenceId: licence.id, markSynced: synced > 0 },
      headers: await firebaseHeaders(),
    });

    // Cancelled licence (lost device, staff left): wipe once everything has
    // uploaded and no screening is half-done on the device
    if (status?.revoked && remaining === 0 && (await draftKeys()).length === 0) {
      await wipeAll();
      notify();
    }

    return { synced, remaining };
  } catch {
    return { synced, remaining: await pendingCount().catch(() => remaining) };
  }
}

// Call once in App.js so sessions sync as soon as connection returns.
// Returns a cleanup function.
export function startAutoSync() {
  const trySync = () => { syncOfflineSessions().catch(() => {}); };

  window.addEventListener("online", trySync);
  // Firebase restores the login a moment after the page loads, so
  // auth.currentUser is still null at startup. Sync again once it's back.
  const unsubscribe = auth.onAuthStateChanged((user) => { if (user) trySync(); });
  trySync();

  return () => {
    window.removeEventListener("online", trySync);
    unsubscribe();
  };
}
