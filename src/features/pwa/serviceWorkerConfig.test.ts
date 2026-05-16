import { describe, expect, it } from 'vitest';
import { auditServiceWorkerConfig, isServiceWorkerReady } from './serviceWorkerAudit';
import { serviceWorkerConfig } from './serviceWorkerConfig';

describe('shared service worker config', () => {
  it('passes the service worker readiness audit', () => {
    const report = auditServiceWorkerConfig(serviceWorkerConfig);

    expect(report.errorCount).toBe(0);
    expect(isServiceWorkerReady(report)).toBe(true);
  });

  it('matches the Lexora deployment scope', () => {
    expect(serviceWorkerConfig.appScope).toBe('/Lexora/');
    expect(serviceWorkerConfig.offlineFallback).toBe('/Lexora/');
    expect(serviceWorkerConfig.appShell).toContain('/Lexora/manifest.webmanifest');
  });
});
