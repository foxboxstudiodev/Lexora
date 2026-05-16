import { describe, expect, it } from 'vitest';
import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { isAndroidWrapperConfigReady, validateAndroidWrapperConfig } from './androidWrapperValidator';

describe('Android wrapper validator', () => {
  it('accepts the default Android wrapper config', () => {
    const report = validateAndroidWrapperConfig(defaultAndroidWrapperConfig);

    expect(report.errorCount).toBe(0);
    expect(isAndroidWrapperConfigReady(report)).toBe(true);
  });

  it('rejects invalid package names', () => {
    const report = validateAndroidWrapperConfig({
      ...defaultAndroidWrapperConfig,
      packageName: 'Lexora',
    });

    expect(report.issues.map((issue) => issue.code)).toContain('android.package_name.invalid');
    expect(isAndroidWrapperConfigReady(report)).toBe(false);
  });

  it('rejects invalid version codes', () => {
    const report = validateAndroidWrapperConfig({
      ...defaultAndroidWrapperConfig,
      versionCode: 0,
    });

    expect(report.issues.map((issue) => issue.code)).toContain('android.version_code.invalid');
  });

  it('requires HTTPS start URLs and origins', () => {
    const report = validateAndroidWrapperConfig({
      ...defaultAndroidWrapperConfig,
      startUrl: 'http://example.com/Lexora/',
      allowedOrigins: ['http://example.com'],
    });

    const codes = report.issues.map((issue) => issue.code);
    expect(codes).toContain('android.start_url.invalid');
    expect(codes).toContain('android.allowed_origins.invalid');
  });

  it('warns when SDK targets are below baseline', () => {
    const report = validateAndroidWrapperConfig({
      ...defaultAndroidWrapperConfig,
      minSdkVersion: 21,
      targetSdkVersion: 30,
    });

    const codes = report.issues.map((issue) => issue.code);
    expect(codes).toContain('android.min_sdk.low');
    expect(codes).toContain('android.target_sdk.low');
    expect(report.errorCount).toBe(0);
  });
});
