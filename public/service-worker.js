const CACHE_PREFIX = 'lexora-cache';

async function clearLexoraCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key)));
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(clearLexoraCaches());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clearLexoraCaches()
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => Promise.all(clients.map((client) => client.navigate(client.url))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', () => {
  // Do not intercept requests. Always let the browser load the latest Vercel build.
});
