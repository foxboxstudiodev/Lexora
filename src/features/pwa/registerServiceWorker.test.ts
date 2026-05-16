import { describe, expect, it } from 'vitest';
import { getServiceWorkerUrl } from './registerServiceWorker';

describe('service worker registration', () => {
  it('builds the service worker URL from shared app scope', () => {
    expect(getServiceWorkerUrl()).toBe('/Lexora/service-worker.js');
  });
});
