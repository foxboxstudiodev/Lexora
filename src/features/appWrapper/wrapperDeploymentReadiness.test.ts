import { describe, expect, it } from 'vitest';
import { getWrapperDeploymentReadiness } from './wrapperDeploymentReadiness';

describe('wrapper deployment readiness', () => {
  it('marks Android and iOS wrapper configs ready for production URL', () => {
    const readiness = getWrapperDeploymentReadiness();

    expect(readiness.productionOrigin).toBe('https://lexora.vercel.app');
    expect(readiness.androidReady).toBe(true);
    expect(readiness.iosReady).toBe(true);
  });
});
