import { describe, expect, it } from 'vitest';
import { WebManifest } from '../pwa/manifestAudit';
import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { createApkReadinessReport, formatApkReadinessReport } from './apkReadinessReport';

const readyManifest: WebManifest = {
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

describe('APK readiness report', () => {
  it('accepts ready PWA and Android wrapper config', () => {
    const report = createApkReadinessReport(readyManifest, defaultAndroidWrapperConfig);

    expect(report.android.errorCount).toBe(0);
    expect(report.pwa.report.blockingIssueCount).toBe(0);
    expect(report.blockingIssueCount).toBe(0);
    expect(report.isReadyForWrapperBuild).toBe(true);
  });

  it('blocks wrapper build when Android config has blocking issues', () => {
    const report = createApkReadinessReport(readyManifest, {
      ...defaultAndroidWrapperConfig,
      packageName: 'bad',
    });

    expect(report.isReadyForWrapperBuild).toBe(false);
    expect(report.blockingIssueCount).toBeGreaterThan(0);
  });

  it('blocks wrapper build when PWA baseline has blocking issues', () => {
    const report = createApkReadinessReport({ ...readyManifest, name: '', icons: [] }, defaultAndroidWrapperConfig);

    expect(report.isReadyForWrapperBuild).toBe(false);
    expect(report.blockingIssueCount).toBeGreaterThan(0);
  });

  it('formats a readable APK readiness report', () => {
    const formatted = formatApkReadinessReport(createApkReadinessReport(readyManifest));

    expect(formatted).toContain('LEXORA APK READINESS REPORT');
    expect(formatted).toContain('Ready for wrapper build: yes');
    expect(formatted).toContain('PWA readiness:');
  });
});
