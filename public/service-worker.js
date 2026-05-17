const CACHE_NAME = 'lexora-cache-v4';
const APP_SCOPE = '/';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg'
];
const OFFLINE_FALLBACK = '/';

function shouldHandleRequest(request) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return url.pathname.startsWith(APP_SCOPE);
}

function shouldCacheResponse(response) {
  return response && response.ok && response.type === 'basic';
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

async function cacheResponse(request, response) {
  if (!shouldCacheResponse(response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await cacheResponse(request, response);
    return response;
  } catch {
    return (await caches.match(request)) || (await caches.match(OFFLINE_FALLBACK));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  await cacheResponse(request, response);
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!shouldHandleRequest(event.request)) return;

  event.respondWith(isNavigationRequest(event.request) ? networkFirst(event.request) : cacheFirst(event.request));
});
