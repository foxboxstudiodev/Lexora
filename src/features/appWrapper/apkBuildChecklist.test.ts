import { describe, expect, it } from 'vitest';
import { apkBuildChecklist, getApkChecklistCompletionRate, getRequiredApkChecklistItems } from './apkBuildChecklist';

describe('APK build checklist', () => {
  it('defines required APK preparation steps', () => {
    expect(apkBuildChecklist.map((item) => item.id)).toEqual([
      'pwa-readiness',
      'android-wrapper-config',
      'wrapper-generation',
      'device-test',
      'signing',
      'play-console-internal-test',
    ]);
  });

  it('returns required checklist items', () => {
    expect(getRequiredApkChecklistItems()).toHaveLength(apkBuildChecklist.length);
  });

  it('calculates completion rate from required items', () => {
    expect(getApkChecklistCompletionRate([])).toBe(0);
    expect(getApkChecklistCompletionRate(['pwa-readiness', 'android-wrapper-config', 'wrapper-generation'])).toBe(0.5);
    expect(getApkChecklistCompletionRate(apkBuildChecklist.map((item) => item.id))).toBe(1);
  });
});
