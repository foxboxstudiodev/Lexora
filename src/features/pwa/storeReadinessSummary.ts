import { StoreReadinessReport } from './storeReadinessReport';

export type StoreReadinessStatus = 'ready' | 'blocked' | 'warning';

export type StoreReadinessSummary = {
  status: StoreReadinessStatus;
  headline: string;
  nextAction: string;
};

export function summarizeStoreReadiness(report: StoreReadinessReport): StoreReadinessSummary {
  if (report.blockingIssueCount > 0) {
    return {
      status: 'blocked',
      headline: 'PWA baseline is blocked.',
      nextAction: 'Fix blocking manifest or service-worker errors before creating an APK/App wrapper.',
    };
  }

  if (report.warningIssueCount > 0) {
    return {
      status: 'warning',
      headline: 'PWA baseline is usable with warnings.',
      nextAction: 'Resolve warnings before store submission for stronger install quality.',
    };
  }

  return {
    status: 'ready',
    headline: 'PWA baseline is ready.',
    nextAction: 'Proceed to wrapper/APK preparation and device testing.',
  };
}
