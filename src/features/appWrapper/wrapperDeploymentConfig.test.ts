import { describe, expect, it } from 'vitest';
import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { defaultIosWrapperConfig } from './iosWrapperConfig';

describe('wrapper deployment config', () => {
  it('uses the root Vercel production URL for Android', () => {
    expect(defaultAndroidWrapperConfig.startUrl).toBe('https://lexora.vercel.app/');
    expect(defaultAndroidWrapperConfig.allowedOrigins).toEqual(['https://lexora.vercel.app']);
  });

  it('uses the root Vercel production URL for iOS', () => {
    expect(defaultIosWrapperConfig.startUrl).toBe('https://lexora.vercel.app/');
    expect(defaultIosWrapperConfig.allowedOrigins).toEqual(['https://lexora.vercel.app']);
  });
});
