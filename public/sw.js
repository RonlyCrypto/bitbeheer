const CACHE_NAME = 'bitbeheer-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
];

// Installeer: cache statische bestanden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activeer: verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first voor API calls, cache-first voor assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sla Supabase/API calls altijd via netwerk af (nooit cachen)
  if (url.hostname.includes('supabase') || url.hostname.includes('coingecko') || url.hostname.includes('blockstream')) {
    return; // Laat browser normaal afhandelen
  }

  // Navigatie (HTML) → network-first, fallback naar gecachte index.html (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Statische assets → cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
