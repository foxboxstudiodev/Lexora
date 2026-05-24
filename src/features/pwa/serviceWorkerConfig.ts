import { ServiceWorkerConfig } from './serviceWorkerAudit';

export const serviceWorkerConfig: ServiceWorkerConfig = {
  cacheName: 'lexora-cache-v4',
  appScope: '/',
  appShell: ['/', '/manifest.webmanifest', '/icon.svg'],
  offlineFallback: '/',
  handlesOnlyGetRequests: true,
  restrictsToSameOrigin: true,
  cleansOldCaches: true,
};