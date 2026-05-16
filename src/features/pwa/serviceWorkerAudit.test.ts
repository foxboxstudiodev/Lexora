import { describe, expect, it } from 'vitest';
import { auditServiceWorkerConfig, isServiceWorkerReady, ServiceWorkerConfig } from './serviceWorkerAudit';

const readyConfig: ServiceWorkerConfig = {
  cacheName: 'lexora-cache-v2',
  appScope: '/Lexora/',
  appShell: ['/Lexora/', '/Lexora/manifest.webmanifest', '/Lexora/icon.svg'],
  offlineFallback: '/Lexora/',
  handlesOnlyGetRequests: true,
  restrictsToSameOrigin: true,
  cleansOldCaches: true,
};

describe('service worker readiness audit', () => {
  it('accepts the current app-shell caching baseline', () => {
    const report = auditServiceWorkerConfig(readyConfig);

    expect(report.errorCount).toBe(0);
    expect(isServiceWorkerReady(report)).toBe(true);
  });

  it('requires cache name and valid app scope', () => {
    const report = auditServiceWorkerConfig({ ...readyConfig, cacheName: '', appScope: 'Lexora/' });
    const codes = report.issues.map((issue) => issue.code);

    expect(codes).toContain('sw.cache_name.missing');
    expect(codes).toContain('sw.scope.invalid');
    expect(isServiceWorkerReady(report)).toBe(false);
  });

  it('requires scope root in app shell', () => {
    const report = auditServiceWorkerConfig({ ...readyConfig, appShell: ['/Lexora/icon.svg'] });

    expect(report.issues.map((issue) => issue.code)).toContain('sw.shell.scope_missing');
  });

  it('requires safe fetch boundaries', () => {
    const report = auditServiceWorkerConfig({
      ...readyConfig,
      handlesOnlyGetRequests: false,
      restrictsToSameOrigin: false,
    });
    const codes = report.issues.map((issue) => issue.code);

    expect(codes).toContain('sw.fetch.get_only_missing');
    expect(codes).toContain('sw.fetch.same_origin_missing');
    expect(report.errorCount).toBe(2);
  });

  it('warns when old cache cleanup is missing', () => {
    const report = auditServiceWorkerConfig({ ...readyConfig, cleansOldCaches: false });

    expect(report.errorCount).toBe(0);
    expect(report.issues.map((issue) => issue.code)).toContain('sw.activate.cleanup_missing');
  });
});
