import { serviceWorkerConfig } from './serviceWorkerConfig';

export function getServiceWorkerUrl(): string {
  return `${serviceWorkerConfig.appScope}service-worker.js`;
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(getServiceWorkerUrl()).catch((error) => {
      console.warn('Lexora service worker registration failed:', error);
    });
  });
}
