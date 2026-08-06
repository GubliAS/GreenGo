/* GreenGo service worker (DEV-014 — PWA support, added outside the handoff's
 * own scope). Hand-written rather than a plugin like next-pwa: this app's
 * caching needs are simple enough not to need Workbox, and a plugin adds a
 * build-step dependency whose Turbopack compatibility isn't guaranteed.
 *
 * The one rule that matters most: /api/* is NEVER cached or intercepted.
 * Telemetry, pump commands, and auth all need the real device/session state
 * on every request — serving a cached response for any of these would be
 * actively wrong, not just stale. Everything else (static assets, page
 * navigations) gets a normal cache-as-you-go strategy so the app shell loads
 * on a flaky 3G connection or briefly offline.
 */

const CACHE_NAME = "greengo-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept device/user API calls, or any cross-origin request.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(
          () => caches.match(request).then((cached) => cached ?? caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  if (request.method !== "GET") return;

  // Static assets (hashed Next.js chunks, fonts, generated icons): cache-first,
  // then fill the cache from the network for next time.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        }),
    ),
  );
});
