import { describe, expect, it } from 'vitest';
import { summarizeStoreReadiness, StoreReadinessSummary } from './storeReadinessSummary';
import { StoreReadinessReport } from './storeReadinessReport';

function makeReport(blockingIssueCount: number, warningIssueCount: number): StoreReadinessReport {
  return {
    manifest: {
      issueCount: blockingIssueCount + warningIssueCount,
      errorCount: blockingIssueCount,
      warningCount: warningIssueCount,
      issues: [],
    },
    serviceWorker: {
      issueCount: 0,
      errorCount: 0,
      warningCount: 0,
      issues: [],
    },
    isPwaBaselineReady: blockingIssueCount === 0,
    blockingIssueCount,
    warningIssueCount,
  };
}

function expectSummary(report: StoreReadinessReport, status: StoreReadinessSummary['status']) {
  const summary = summarizeStoreReadiness(report);
  expect(summary.status).toBe(status);
  expect(summary.headline.length).toBeGreaterThan(0);
  expect(summary.nextAction.length).toBeGreaterThan(0);
}

describe('store readiness summary', () => {
  it('returns blocked when blocking issues exist', () => {
    expectSummary(makeReport(1, 0), 'blocked');
  });

  it('returns warning when only warnings exist', () => {
    expectSummary(makeReport(0, 2), 'warning');
  });

  it('returns ready when no issues exist', () => {
    expectSummary(makeReport(0, 0), 'ready');
  });
});
