import { WebManifest } from '../pwa/manifestAudit';
import { AndroidWrapperConfig, defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { ApkReadinessReport, createApkReadinessReport, formatApkReadinessReport } from './apkReadinessReport';
import { IosWrapperConfig, defaultIosWrapperConfig } from './iosWrapperConfig';
import { IosReadinessReport, createIosReadinessReport, formatIosReadinessReport } from './iosReadinessReport';

export type CrossPlatformReadinessReport = {
  android: ApkReadinessReport;
  ios: IosReadinessReport;
  isAndroidReady: boolean;
  isIosReady: boolean;
  isAnyPlatformReady: boolean;
  isEveryPlatformReady: boolean;
  totalBlockingIssues: number;
  totalWarnings: number;
};

export function createCrossPlatformReadinessReport(
  manifest: WebManifest,
  androidConfig: AndroidWrapperConfig = defaultAndroidWrapperConfig,
  iosConfig: IosWrapperConfig = defaultIosWrapperConfig,
): CrossPlatformReadinessReport {
  const android = createApkReadinessReport(manifest, androidConfig);
  const ios = createIosReadinessReport(manifest, iosConfig);
  const isAndroidReady = android.isReadyForWrapperBuild;
  const isIosReady = ios.isReadyForWrapperBuild;

  return {
    android,
    ios,
    isAndroidReady,
    isIosReady,
    isAnyPlatformReady: isAndroidReady || isIosReady,
    isEveryPlatformReady: isAndroidReady && isIosReady,
    totalBlockingIssues: android.blockingIssueCount + ios.blockingIssueCount,
    totalWarnings: android.warningIssueCount + ios.warningIssueCount,
  };
}

export function formatCrossPlatformReadinessReport(report: CrossPlatformReadinessReport): string {
  return [
    'LEXORA CROSS-PLATFORM WRAPPER READINESS REPORT',
    `Android ready: ${report.isAndroidReady ? 'yes' : 'no'}`,
    `iOS ready: ${report.isIosReady ? 'yes' : 'no'}`,
    `Any platform ready: ${report.isAnyPlatformReady ? 'yes' : 'no'}`,
    `Every platform ready: ${report.isEveryPlatformReady ? 'yes' : 'no'}`,
    `Total blocking issues: ${report.totalBlockingIssues}`,
    `Total warnings: ${report.totalWarnings}`,
    '',
    formatApkReadinessReport(report.android),
    '',
    formatIosReadinessReport(report.ios),
  ].join('\n');
}
