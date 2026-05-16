import { ApkReadinessReport } from './apkReadinessReport';

export type ApkReadinessStatus = 'ready' | 'warning' | 'blocked';

export type ApkReadinessSummary = {
  status: ApkReadinessStatus;
  headline: string;
  nextAction: string;
};

export function summarizeApkReadiness(report: ApkReadinessReport): ApkReadinessSummary {
  if (report.blockingIssueCount > 0) {
    return {
      status: 'blocked',
      headline: 'APK wrapper preparation is blocked.',
      nextAction: 'Fix blocking Android wrapper or PWA readiness errors before generating an APK.',
    };
  }

  if (report.warningIssueCount > 0) {
    return {
      status: 'warning',
      headline: 'APK wrapper preparation is possible with warnings.',
      nextAction: 'Proceed only for internal testing; resolve warnings before Play Store submission.',
    };
  }

  return {
    status: 'ready',
    headline: 'APK wrapper preparation is ready.',
    nextAction: 'Proceed to wrapper project generation and Android device testing.',
  };
}
