import { WebManifest } from './manifestAudit';
import { createStoreReadinessReport, formatStoreReadinessReport, StoreReadinessReport } from './storeReadinessReport';
import { summarizeStoreReadiness, StoreReadinessSummary } from './storeReadinessSummary';

export type PwaReadinessGateResult = {
  report: StoreReadinessReport;
  summary: StoreReadinessSummary;
  formatted: string;
  canProceedToWrapper: boolean;
};

export function runPwaReadinessGate(manifest: WebManifest): PwaReadinessGateResult {
  const report = createStoreReadinessReport(manifest);
  const summary = summarizeStoreReadiness(report);

  return {
    report,
    summary,
    formatted: formatStoreReadinessReport(report),
    canProceedToWrapper: summary.status === 'ready' || summary.status === 'warning',
  };
}
