import { describe, expect, it } from 'vitest';
import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { defaultIosWrapperConfig } from './iosWrapperConfig';
import { getWrapperDeploymentReadiness } from './wrapperDeploymentReadiness';

describe('wrapper deployment readiness', () => {
  it('marks Android and iOS wrapper configs ready for production URL', () => {
    const readiness = getWrapperDeploymentReadiness();

    expect(readiness.productionOrigin).toBe('https://lexora.vercel.app');
    expect(readiness.androidReady).toBe(true);
    expect(readiness.iosReady).toBe(true);
  });

  it('keeps Android package ready for Play Console baseline', () => {
    expect(defaultAndroidWrapperConfig.appName).toBe('Lexora');
    expect(defaultAndroidWrapperConfig.packageName).toBe('com.foxboxstudio.lexora');
    expect(defaultAndroidWrapperConfig.strategy).toBe('twa');
    expect(defaultAndroidWrapperConfig.startUrl).toBe('https://lexora.vercel.app/');
    expect(defaultAndroidWrapperConfig.allowedOrigins).toEqual(['https://lexora.vercel.app']);
    expect(defaultAndroidWrapperConfig.orientation).toBe('portrait');
    expect(defaultAndroidWrapperConfig.minSdkVersion).toBeGreaterThanOrEqual(23);
    expect(defaultAndroidWrapperConfig.targetSdkVersion).toBeGreaterThanOrEqual(35);
  });

  it('keeps iOS wrapper baseline aligned with production URL', () => {
    expect(defaultIosWrapperConfig.appName).toBe('Lexora');
    expect(defaultIosWrapperConfig.bundleId).toBe('com.foxboxstudio.lexora');
    expect(defaultIosWrapperConfig.startUrl).toBe('https://lexora.vercel.app/');
    expect(defaultIosWrapperConfig.allowedOrigins).toEqual(['https://lexora.vercel.app']);
    expect(defaultIosWrapperConfig.orientation).toBe('portrait');
  });
});
