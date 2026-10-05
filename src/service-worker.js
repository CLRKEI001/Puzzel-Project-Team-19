/* eslint-disable no-restricted-globals */
// CRA finds this file at build time and fills in self.__WB_MANIFEST
// with a list of every file in the build (JS, CSS, HTML, images).

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

// 1. Save every file from the build so the app opens with no signal
precacheAndRoute(self.__WB_MANIFEST);

// 2. Any page navigation (typing the URL, refreshing) gets index.html.
//    React then decides what to show. Skip anything that looks like a file.
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/_")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// 3. Images from the public folder (logo, puzzle images).
//    Show the saved copy straight away, quietly fetch a fresh one in the background.
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin && request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 60 })],
  })
);

// Supabase requests are deliberately NOT cached here.
// Screener questions and results are handled by offlineVault.js, encrypted.
// Caching API responses here would store them in plain text.

// 4. Lets the app tell a waiting service worker to take over (used by the update prompt)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});