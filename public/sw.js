// Minimal service worker: just enough to satisfy installability and
// give the app shell a fast/offline boot. Drive API calls and photo
// fetches are never cached — those always need a live network.

const SHELL_CACHE = 'shell-v2';
const SHELL_ASSETS = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Best-effort: a 404 on one shell asset shouldn't kill install.
      Promise.all(SHELL_ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never touch cross-origin requests (Drive, Google Auth, fonts CDN).
  // Let the network handle them so OAuth and image fetches Just Work.
  if (url.origin !== self.location.origin) return;

  // runtime-config.js holds API keys injected at container start; the
  // nginx layer already marks it no-store. Skip the SW entirely.
  if (url.pathname.endsWith('/runtime-config.js')) return;

  // Navigation requests: serve cached index.html on failure so the app
  // shell still opens when the network is gone.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || Response.error()))
    );
    return;
  }

  // Hashed build assets and shell entries: cache-first, then network.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Only cache successful, basic responses from same origin.
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
