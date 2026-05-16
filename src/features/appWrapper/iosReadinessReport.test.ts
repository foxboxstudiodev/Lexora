import { describe, expect, it } from 'vitest';
import { WebManifest } from '../pwa/manifestAudit';
import { defaultIosWrapperConfig } from './iosWrapperConfig';
import { createIosReadinessReport, formatIosReadinessReport } from './iosReadinessReport';

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

describe('iOS readiness report', () => {
  it('accepts ready inputs', () => {
    const report = createIosReadinessReport(manifest, defaultIosWrapperConfig);
    expect(report.blockingIssueCount).toBe(0);
    expect(report.isReadyForWrapperBuild).toBe(true);
  });

  it('blocks bad iOS config', () => {
    const report = createIosReadinessReport(manifest, { ...defaultIosWrapperConfig, bundleId: 'bad' });
    expect(report.isReadyForWrapperBuild).toBe(false);
    expect(report.blockingIssueCount).toBeGreaterThan(0);
  });

  it('blocks bad manifest', () => {
    const report = createIosReadinessReport({ ...manifest, name: '', icons: [] }, defaultIosWrapperConfig);
    expect(report.isReadyForWrapperBuild).toBe(false);
    expect(report.blockingIssueCount).toBeGreaterThan(0);
  });

  it('formats report', () => {
    const formatted = formatIosReadinessReport(createIosReadinessReport(manifest));
    expect(formatted).toContain('LEXORA IOS READINESS REPORT');
    expect(formatted).toContain('Ready for wrapper build: yes');
  });
});
