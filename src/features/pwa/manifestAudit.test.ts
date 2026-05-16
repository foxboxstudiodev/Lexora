import { describe, expect, it } from 'vitest';
import { auditWebManifest, isManifestStoreReady, WebManifest } from './manifestAudit';

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

describe('manifest readiness audit', () => {
  it('accepts a baseline app-like manifest', () => {
    const report = auditWebManifest(validManifest);

    expect(report.errorCount).toBe(0);
    expect(isManifestStoreReady(report)).toBe(true);
  });

  it('requires core manifest identity fields', () => {
    const report = auditWebManifest({});
    const codes = report.issues.map((issue) => issue.code);

    expect(report.errorCount).toBeGreaterThan(0);
    expect(codes).toEqual(expect.arrayContaining([
      'manifest.name.missing',
      'manifest.short_name.missing',
      'manifest.start_url.missing',
      'manifest.scope.missing',
      'manifest.icons.missing',
    ]));
  });

  it('requires a large install icon', () => {
    const report = auditWebManifest({
      ...validManifest,
      icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    });

    expect(report.issues.map((issue) => issue.code)).toContain('manifest.icons.large_missing');
    expect(isManifestStoreReady(report)).toBe(false);
  });

  it('warns when maskable icon is missing', () => {
    const report = auditWebManifest({
      ...validManifest,
      icons: [{ src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }],
    });

    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBeGreaterThanOrEqual(1);
    expect(report.issues.map((issue) => issue.code)).toContain('manifest.icons.maskable_missing');
  });
});
