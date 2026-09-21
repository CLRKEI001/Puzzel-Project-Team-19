// service-worker.js — PuzzleBox Screener
//
// Only job: receive a Web Push message (sent by the
// supabase/functions/send-push Edge Function) and show it as a real
// OS-level notification, even if the app tab is closed. Registered manually
// from src/lib/push.js — this project doesn't use CRA's built-in
// service-worker pipeline, so nothing here is auto-generated.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "PuzzleBox Screener", body: "You have a new notification." };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Payload wasn't JSON — fall back to the default text above.
  }

  const options = {
    body: data.body,
    icon: "/logo192.png",
    badge: "/logo192.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Clicking the notification focuses an already-open tab if there is one,
// otherwise opens a new one at the URL the push payload specified.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});