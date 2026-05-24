export function getServiceWorkerUrl(): string {
  return '/service-worker.js';
}

async function clearLexoraCaches(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('caches' in window)) return;

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith('lexora-cache-'))
      .map((cacheName) => caches.delete(cacheName)),
  );
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then(() => clearLexoraCaches())
      .catch((error) => {
        console.warn('Lexora service worker cleanup failed:', error);
      });
  });
}
