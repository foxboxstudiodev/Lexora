import { ServiceWorkerConfig } from './serviceWorkerAudit';

export const serviceWorkerConfig: ServiceWorkerConfig = {
  cacheName: 'lexora-cache-v2',
  appScope: '/Lexora/',
  appShell: ['/Lexora/', '/Lexora/manifest.webmanifest', '/Lexora/icon.svg'],
  offlineFallback: '/Lexora/',
  handlesOnlyGetRequests: true,
  restrictsToSameOrigin: true,
  cleansOldCaches: true,
};
