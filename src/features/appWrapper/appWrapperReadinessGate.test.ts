import { describe, expect, it } from 'vitest';
import { WebManifest } from '../pwa/manifestAudit';
import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { runAppWrapperReadinessGate } from './appWrapperReadinessGate';
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

describe('app wrapper readiness gate', () => {
  it('allows both platforms when configs are valid', () => {
    const result = runAppWrapperReadinessGate(manifest);
    expect(result.summary.status).toBe('ready');
    expect(result.canProceedAndroid).toBe(true);
    expect(result.canProceedIos).toBe(true);
    expect(result.canProceedAnyPlatform).toBe(true);
  });

  it('allows one platform when only Android is blocked', () => {
    const result = runAppWrapperReadinessGate(
      manifest,
      { ...defaultAndroidWrapperConfig, packageName: 'bad' },
      defaultIosWrapperConfig,
    );

    expect(result.summary.status).toBe('partial');
    expect(result.canProceedAndroid).toBe(false);
    expect(result.canProceedIos).toBe(true);
    expect(result.canProceedAnyPlatform).toBe(true);
  });

  it('blocks all platforms when the manifest is invalid', () => {
    const result = runAppWrapperReadinessGate({ ...manifest, name: '', icons: [] });
    expect(result.summary.status).toBe('blocked');
    expect(result.canProceedAnyPlatform).toBe(false);
  });
});
