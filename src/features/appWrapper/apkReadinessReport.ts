import { WebManifest } from '../pwa/manifestAudit';
import { runPwaReadinessGate, PwaReadinessGateResult } from '../pwa/pwaReadinessGate';
import { AndroidWrapperConfig, defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { isAndroidWrapperConfigReady, validateAndroidWrapperConfig, AndroidWrapperValidationReport } from './androidWrapperValidator';

export type ApkReadinessReport = {
  android: AndroidWrapperValidationReport;
  pwa: PwaReadinessGateResult;
  isReadyForWrapperBuild: boolean;
  blockingIssueCount: number;
  warningIssueCount: number;
};

export function createApkReadinessReport(
  manifest: WebManifest,
  androidConfig: AndroidWrapperConfig = defaultAndroidWrapperConfig,
): ApkReadinessReport {
  const android = validateAndroidWrapperConfig(androidConfig);
  const pwa = runPwaReadinessGate(manifest);
  const blockingIssueCount = android.errorCount + pwa.report.blockingIssueCount;
  const warningIssueCount = android.warningCount + pwa.report.warningIssueCount;

  return {
    android,
    pwa,
    isReadyForWrapperBuild: isAndroidWrapperConfigReady(android) && pwa.canProceedToWrapper,
    blockingIssueCount,
    warningIssueCount,
  };
}

export function formatApkReadinessReport(report: ApkReadinessReport): string {
  const androidLines = report.android.issues.map((issue) => `- android ${issue.severity} ${issue.code}: ${issue.message}`);

  return [
    'LEXORA APK READINESS REPORT',
    `Ready for wrapper build: ${report.isReadyForWrapperBuild ? 'yes' : 'no'}`,
    `Blocking issues: ${report.blockingIssueCount}`,
    `Warnings: ${report.warningIssueCount}`,
    androidLines.length > 0 ? 'Android issues:' : 'Android issues: none',
    ...androidLines,
    'PWA readiness:',
    report.pwa.formatted,
  ].join('\n');
}
