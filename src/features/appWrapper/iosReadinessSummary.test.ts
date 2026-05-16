import { describe, expect, it } from 'vitest';
import { IosReadinessReport } from './iosReadinessReport';
import { summarizeIosReadiness } from './iosReadinessSummary';

function makeReport(blockingIssueCount: number, warningIssueCount: number): IosReadinessReport {
  return {
    ios: {
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

describe('iOS readiness summary', () => {
  it('returns blocked when blocking issues exist', () => {
    const summary = summarizeIosReadiness(makeReport(1, 0));
    expect(summary.status).toBe('blocked');
    expect(summary.nextAction).toContain('Fix blocking');
  });

  it('returns warning when only warnings exist', () => {
    const summary = summarizeIosReadiness(makeReport(0, 2));
    expect(summary.status).toBe('warning');
    expect(summary.nextAction).toContain('internal');
  });

  it('returns ready when no issues exist', () => {
    const summary = summarizeIosReadiness(makeReport(0, 0));
    expect(summary.status).toBe('ready');
    expect(summary.nextAction).toContain('iOS wrapper');
  });
});
