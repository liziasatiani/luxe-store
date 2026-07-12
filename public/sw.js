const CACHE = "everything-street-v1";
const STATIC = ["/", "/beauty", "/tech", "/brands"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(STATIC.map((url) => c.add(url)))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API routes: network-only (never cache dynamic data)
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: network-first, fall back to cached "/"
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  // Static assets: cache-first
  e.respondWith(
    caches.match(request).then(
      (cached) => cached || fetch(request).then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
    )
  );
});
