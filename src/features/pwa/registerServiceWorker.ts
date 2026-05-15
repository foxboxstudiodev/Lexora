export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Lexora/service-worker.js').catch((error) => {
      console.warn('Lexora service worker registration failed:', error);
    });
  });
}
