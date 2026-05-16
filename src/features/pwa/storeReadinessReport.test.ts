import { describe, expect, it } from 'vitest';
import { createStoreReadinessReport, formatStoreReadinessReport } from './storeReadinessReport';
import { WebManifest } from './manifestAudit';

const validManifest: WebManifest = {
  name: 'Lexora',
  short_name: 'Lexora',
  description: 'A multilingual word-connect crossword puzzle game.',
  start_url: '/Lexora/',
  scope: '/Lexora/',
  display: 'standalone',
  background_color: '#0f172a',
  theme_color: '#18233f',
  orientation: 'portrait-primary',
  icons: [
    {
      src: '/Lexora/icon.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
};

describe('store readiness report', () => {
  it('combines manifest and service worker readiness', () => {
    const report = createStoreReadinessReport(validManifest);

    expect(report.manifest.errorCount).toBe(0);
    expect(report.serviceWorker.errorCount).toBe(0);
    expect(report.blockingIssueCount).toBe(0);
    expect(report.isPwaBaselineReady).toBe(true);
  });

  it('reports manifest blocking issues in the combined result', () => {
    const report = createStoreReadinessReport({ ...validManifest, name: '', icons: [] });

    expect(report.isPwaBaselineReady).toBe(false);
    expect(report.blockingIssueCount).toBeGreaterThan(0);
  });

  it('formats a readable readiness report', () => {
    const formatted = formatStoreReadinessReport(createStoreReadinessReport(validManifest));

    expect(formatted).toContain('LEXORA STORE READINESS REPORT');
    expect(formatted).toContain('PWA baseline ready: yes');
    expect(formatted).toContain('Blocking issues: 0');
  });
});
