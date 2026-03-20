const CACHE_NAME = "gnits-campus-cache-v1";
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add important assets like your CSS, JS, icons
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version or fetch new one
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  const whitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (!whitelist.includes(name)) return caches.delete(name);
        })
      );
    })
  );
});
