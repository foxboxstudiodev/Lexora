import { describe, expect, it } from 'vitest';
import { ApkReadinessReport } from './apkReadinessReport';
import { summarizeApkReadiness } from './apkReadinessSummary';

function makeReport(blockingIssueCount: number, warningIssueCount: number): ApkReadinessReport {
  return {
    android: {
      issueCount: blockingIssueCount + warningIssueCount,
      errorCount: blockingIssueCount,
      warningCount: warningIssueCount,
      issues: [],
    },
    pwa: {
      report: {
        manifest: { issueCount: 0, errorCount: 0, warningCount: 0, issues: [] },
        serviceWorker: { issueCount: 0, errorCount: 0, warningCount: 0, issues: [] },
        isPwaBaselineReady: blockingIssueCount === 0,
        blockingIssueCount: 0,
        warningIssueCount: 0,
      },
      summary: {
        status: blockingIssueCount > 0 ? 'blocked' : warningIssueCount > 0 ? 'warning' : 'ready',
        headline: 'test',
        nextAction: 'test',
      },
      formatted: 'test',
      canProceedToWrapper: blockingIssueCount === 0,
    },
    isReadyForWrapperBuild: blockingIssueCount === 0,
    blockingIssueCount,
    warningIssueCount,
  };
}

describe('APK readiness summary', () => {
  it('returns blocked when blocking issues exist', () => {
    const summary = summarizeApkReadiness(makeReport(1, 0));
    expect(summary.status).toBe('blocked');
    expect(summary.nextAction).toContain('Fix blocking');
  });

  it('returns warning when only warnings exist', () => {
    const summary = summarizeApkReadiness(makeReport(0, 2));
    expect(summary.status).toBe('warning');
    expect(summary.nextAction).toContain('internal testing');
  });

  it('returns ready when no issues exist', () => {
    const summary = summarizeApkReadiness(makeReport(0, 0));
    expect(summary.status).toBe('ready');
    expect(summary.nextAction).toContain('wrapper project');
  });
});
