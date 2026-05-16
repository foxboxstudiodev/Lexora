import { IosReadinessReport } from './iosReadinessReport';

export type IosReadinessStatus = 'ready' | 'warning' | 'blocked';

export type IosReadinessSummary = {
  status: IosReadinessStatus;
  headline: string;
  nextAction: string;
};

export function summarizeIosReadiness(report: IosReadinessReport): IosReadinessSummary {
  if (report.blockingIssueCount > 0) {
    return {
      status: 'blocked',
      headline: 'iOS wrapper preparation is blocked.',
      nextAction: 'Fix blocking iOS wrapper or PWA readiness errors before generating an iOS build.',
    };
  }

  if (report.warningIssueCount > 0) {
    return {
      status: 'warning',
      headline: 'iOS wrapper preparation is possible with warnings.',
      nextAction: 'Proceed only for internal TestFlight-style testing; resolve warnings before App Store submission.',
    };
  }

  return {
    status: 'ready',
    headline: 'iOS wrapper preparation is ready.',
    nextAction: 'Proceed to iOS wrapper project generation and real-device testing.',
  };
}
