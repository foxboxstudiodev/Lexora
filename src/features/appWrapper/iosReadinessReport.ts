import { WebManifest } from '../pwa/manifestAudit';
import { PwaReadinessGateResult, runPwaReadinessGate } from '../pwa/pwaReadinessGate';
import { defaultIosWrapperConfig, IosWrapperConfig } from './iosWrapperConfig';
import { isIosWrapperConfigReady, IosWrapperValidationReport, validateIosWrapperConfig } from './iosWrapperValidator';

export type IosReadinessReport = {
  ios: IosWrapperValidationReport;
  pwa: PwaReadinessGateResult;
  isReadyForWrapperBuild: boolean;
  blockingIssueCount: number;
  warningIssueCount: number;
};

export function createIosReadinessReport(
  manifest: WebManifest,
  iosConfig: IosWrapperConfig = defaultIosWrapperConfig,
): IosReadinessReport {
  const ios = validateIosWrapperConfig(iosConfig);
  const pwa = runPwaReadinessGate(manifest);
  const blockingIssueCount = ios.errorCount + pwa.report.blockingIssueCount;
  const warningIssueCount = ios.warningCount + pwa.report.warningIssueCount;

  return {
    ios,
    pwa,
    isReadyForWrapperBuild: isIosWrapperConfigReady(ios) && pwa.canProceedToWrapper,
    blockingIssueCount,
    warningIssueCount,
  };
}

export function formatIosReadinessReport(report: IosReadinessReport): string {
  const iosLines = report.ios.issues.map((issue) => `- ios ${issue.severity} ${issue.code}: ${issue.message}`);

  return [
    'LEXORA IOS READINESS REPORT',
    `Ready for wrapper build: ${report.isReadyForWrapperBuild ? 'yes' : 'no'}`,
    `Blocking issues: ${report.blockingIssueCount}`,
    `Warnings: ${report.warningIssueCount}`,
    iosLines.length > 0 ? 'iOS issues:' : 'iOS issues: none',
    ...iosLines,
    'PWA readiness:',
    report.pwa.formatted,
  ].join('\n');
}
