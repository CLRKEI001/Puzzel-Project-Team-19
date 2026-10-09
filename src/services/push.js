// push.js — thin wrapper around the browser Push API.
//
// Requires a VAPID key pair (generate once with `npx web-push
// generate-vapid-keys`). The public key goes in .env as
// REACT_APP_VAPID_PUBLIC_KEY; the private key + subject are Edge Function
// secrets for supabase/functions/send-push (never shipped to the browser).
//
// Call `enablePushNotifications(userId)` from a real user gesture (a button
// click) — browsers require that for the permission prompt, and it's better
// UX than prompting automatically anyway.

import { supabase } from "./supabaseClient";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function enablePushNotifications(userId) {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };

  const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
  if (!vapidKey) return { ok: false, reason: "not-configured" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  // Register the service worker: a background script the browser keeps running
// even when the app is closed. It is what receives push notifications and
// lets the app work with no signal.
  const registration = await navigator.serviceWorker.register("/service-worker.js");
  await navigator.serviceWorker.ready;    // Wait until the service worker is fully active before using it.

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    // Subscribe this device to push notifications through the browser's push service.
    subscription = await registration.pushManager.subscribe({  // Required by browsers: every push must show a visible notification to the user.

      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
      // Our public VAPID key. It proves to the push service that notifications
  // come from our server, so nobody else can send to this device.
  // The key is converted to the binary format the browser expects.
    });
  }  // The subscription (this device's unique address) is then saved in the
// push_subscriptions table, so the send-push function can notify this device.

  const json = subscription.toJSON();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { ok: false, reason: "save-failed", error };

  return { ok: true };
}