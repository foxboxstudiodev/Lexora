import { describe, expect, it } from 'vitest';
import { defaultIosWrapperConfig } from './iosWrapperConfig';
import { isIosWrapperConfigReady, validateIosWrapperConfig } from './iosWrapperValidator';

describe('iOS wrapper validator', () => {
  it('accepts the default iOS wrapper config', () => {
    const report = validateIosWrapperConfig(defaultIosWrapperConfig);

    expect(report.errorCount).toBe(0);
    expect(isIosWrapperConfigReady(report)).toBe(true);
  });

  it('rejects invalid bundle ids', () => {
    const report = validateIosWrapperConfig({
      ...defaultIosWrapperConfig,
      bundleId: 'Lexora',
    });

    expect(report.issues.map((issue) => issue.code)).toContain('ios.bundle_id.invalid');
    expect(isIosWrapperConfigReady(report)).toBe(false);
  });

  it('rejects invalid build numbers', () => {
    const report = validateIosWrapperConfig({
      ...defaultIosWrapperConfig,
      buildNumber: 0,
    });

    expect(report.issues.map((issue) => issue.code)).toContain('ios.build_number.invalid');
  });

  it('requires HTTPS start URLs and origins', () => {
    const report = validateIosWrapperConfig({
      ...defaultIosWrapperConfig,
      startUrl: 'http://example.com/Lexora/',
      allowedOrigins: ['http://example.com'],
    });

    const codes = report.issues.map((issue) => issue.code);
    expect(codes).toContain('ios.start_url.invalid');
    expect(codes).toContain('ios.allowed_origins.invalid');
  });

  it('warns when minimum iOS version is below baseline', () => {
    const report = validateIosWrapperConfig({
      ...defaultIosWrapperConfig,
      minimumIosVersion: '14.0',
    });

    expect(report.errorCount).toBe(0);
    expect(report.issues.map((issue) => issue.code)).toContain('ios.minimum_version.low');
  });
});
