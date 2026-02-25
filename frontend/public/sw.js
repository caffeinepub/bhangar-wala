const CACHE_NAME = 'bhangar-wala-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/logo.dim_256x256.png',
  '/assets/generated/bhangar-wala-icon-192.dim_192x192.png',
  '/assets/generated/bhangar-wala-icon-512.dim_512x512.png',
  '/assets/generated/pwa-icon-192.dim_192x192.png',
  '/assets/generated/pwa-icon-512.dim_512x512.png',
  '/assets/generated/upi-qr-placeholder.dim_256x256.png',
  '/assets/generated/home-hero.dim_780x320.png',
  '/assets/generated/splash-bg.dim_390x844.png',
  '/assets/generated/scrap-categories.dim_512x128.png',
  '/assets/generated/empty-bookings.dim_320x240.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for API calls
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // ── CRITICAL: Always bypass Internet Identity authentication domains ──
  // These must never be intercepted or cached by the service worker.
  // Blocking them causes "unable to connect" on mobile browsers.
  if (
    url.hostname === 'identity.ic0.app' ||
    url.hostname === 'identity.internetcomputer.org' ||
    url.hostname.endsWith('.identity.ic0.app') ||
    url.hostname.endsWith('.identity.internetcomputer.org')
  ) {
    return; // Let the browser handle it natively
  }

  // ── CRITICAL: Always bypass ICP canister API calls (/api/v2/) ──
  // These are state-changing or query calls to the IC network.
  // Caching them causes stale responses and connection failures on mobile.
  if (url.pathname.includes('/api/v2/')) {
    return; // Let the browser handle it natively
  }

  // Skip cross-origin requests that aren't assets
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/assets')) return;

  // Network-first for API/canister calls (other IC-related hostnames)
  if (
    url.pathname.includes('/api/') ||
    url.hostname.includes('icp') ||
    url.hostname.includes('dfinity') ||
    url.hostname.includes('ic0.app') ||
    url.hostname.includes('icp0.io') ||
    url.hostname.includes('raw.ic0.app')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets (images, fonts, etc.)
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML/JS/CSS (app shell)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Fallback to index.html for SPA navigation
          return caches.match('/index.html');
        });
      })
  );
});
