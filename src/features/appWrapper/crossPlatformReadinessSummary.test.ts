import { describe, expect, it } from 'vitest';
import { CrossPlatformReadinessReport } from './crossPlatformReadinessReport';
import { summarizeCrossPlatformReadiness } from './crossPlatformReadinessSummary';

function makeReport(isAndroidReady: boolean, isIosReady: boolean): CrossPlatformReadinessReport {
  return {
    android: {
      android: { issueCount: 0, errorCount: isAndroidReady ? 0 : 1, warningCount: 0, issues: [] },
      pwa: {
        report: {
          manifest: { issueCount: 0, errorCount: 0, warningCount: 0, issues: [] },
          serviceWorker: { issueCount: 0, errorCount: 0, warningCount: 0, issues: [] },
          isPwaBaselineReady: true,
          blockingIssueCount: 0,
          warningIssueCount: 0,
        },
        summary: { status: 'ready', headline: 'ready', nextAction: 'ready' },
        formatted: 'ready',
        canProceedToWrapper: true,
      },
      isReadyForWrapperBuild: isAndroidReady,
      blockingIssueCount: isAndroidReady ? 0 : 1,
      warningIssueCount: 0,
    },
    ios: {
      ios: { issueCount: 0, errorCount: isIosReady ? 0 : 1, warningCount: 0, issues: [] },
      pwa: {
        report: {
          manifest: { issueCount: 0, errorCount: 0, warningCount: 0, issues: [] },
          serviceWorker: { issueCount: 0, errorCount: 0, warningCount: 0, issues: [] },
          isPwaBaselineReady: true,
          blockingIssueCount: 0,
          warningIssueCount: 0,
        },
        summary: { status: 'ready', headline: 'ready', nextAction: 'ready' },
        formatted: 'ready',
        canProceedToWrapper: true,
      },
      isReadyForWrapperBuild: isIosReady,
      blockingIssueCount: isIosReady ? 0 : 1,
      warningIssueCount: 0,
    },
    isAndroidReady,
    isIosReady,
    isAnyPlatformReady: isAndroidReady || isIosReady,
    isEveryPlatformReady: isAndroidReady && isIosReady,
    totalBlockingIssues: (isAndroidReady ? 0 : 1) + (isIosReady ? 0 : 1),
    totalWarnings: 0,
  };
}

describe('cross-platform readiness summary', () => {
  it('returns ready when every platform is ready', () => {
    const summary = summarizeCrossPlatformReadiness(makeReport(true, true));
    expect(summary.status).toBe('ready');
  });

  it('returns partial when one platform is ready', () => {
    const summary = summarizeCrossPlatformReadiness(makeReport(true, false));
    expect(summary.status).toBe('partial');
  });

  it('returns blocked when every platform is blocked', () => {
    const summary = summarizeCrossPlatformReadiness(makeReport(false, false));
    expect(summary.status).toBe('blocked');
  });
});
