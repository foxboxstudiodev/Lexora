import { describe, expect, it } from 'vitest';
import { auditServiceWorkerConfig, isServiceWorkerReady } from './serviceWorkerAudit';
import { serviceWorkerConfig } from './serviceWorkerConfig';

describe('shared service worker config', () => {
  it('passes the service worker readiness audit', () => {
    const report = auditServiceWorkerConfig(serviceWorkerConfig);

    expect(report.errorCount).toBe(0);
    expect(isServiceWorkerReady(report)).toBe(true);
  });

  it('matches the root deployment scope', () => {
    expect(serviceWorkerConfig.appScope).toBe('/');
    expect(serviceWorkerConfig.offlineFallback).toBe('/');
    expect(serviceWorkerConfig.appShell).toContain('/manifest.webmanifest');
    expect(serviceWorkerConfig.appShell).toContain('/icon.svg');
  });
});
