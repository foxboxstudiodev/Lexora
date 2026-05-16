import { describe, expect, it } from 'vitest';
import { WebManifest } from '../pwa/manifestAudit';
import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { createCrossPlatformReadinessReport, formatCrossPlatformReadinessReport } from './crossPlatformReadinessReport';
import { defaultIosWrapperConfig } from './iosWrapperConfig';

const manifest: WebManifest = {
  name: 'Lexora',
  short_name: 'Lexora',
  start_url: '/Lexora/',
  scope: '/Lexora/',
  display: 'standalone',
  background_color: '#0f172a',
  theme_color: '#18233f',
  icons: [{ src: '/Lexora/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }],
};

describe('cross-platform readiness report', () => {
  it('marks both platforms ready with default configs', () => {
    const report = createCrossPlatformReadinessReport(manifest, defaultAndroidWrapperConfig, defaultIosWrapperConfig);

    expect(report.isAndroidReady).toBe(true);
    expect(report.isIosReady).toBe(true);
    expect(report.isAnyPlatformReady).toBe(true);
    expect(report.isEveryPlatformReady).toBe(true);
    expect(report.totalBlockingIssues).toBe(0);
  });

  it('detects one-platform readiness', () => {
    const report = createCrossPlatformReadinessReport(
      manifest,
      { ...defaultAndroidWrapperConfig, packageName: 'bad' },
      defaultIosWrapperConfig,
    );

    expect(report.isAndroidReady).toBe(false);
    expect(report.isIosReady).toBe(true);
    expect(report.isAnyPlatformReady).toBe(true);
    expect(report.isEveryPlatformReady).toBe(false);
  });

  it('formats cross-platform readiness', () => {
    const formatted = formatCrossPlatformReadinessReport(createCrossPlatformReadinessReport(manifest));

    expect(formatted).toContain('LEXORA CROSS-PLATFORM WRAPPER READINESS REPORT');
    expect(formatted).toContain('Android ready: yes');
    expect(formatted).toContain('iOS ready: yes');
  });
});
