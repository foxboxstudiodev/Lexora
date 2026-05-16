import { WebManifest } from '../pwa/manifestAudit';
import { AndroidWrapperConfig, defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { createCrossPlatformReadinessReport, CrossPlatformReadinessReport, formatCrossPlatformReadinessReport } from './crossPlatformReadinessReport';
import { CrossPlatformReadinessSummary, summarizeCrossPlatformReadiness } from './crossPlatformReadinessSummary';
import { defaultIosWrapperConfig, IosWrapperConfig } from './iosWrapperConfig';

export type AppWrapperReadinessGateResult = {
  report: CrossPlatformReadinessReport;
  summary: CrossPlatformReadinessSummary;
  formatted: string;
  canProceedAndroid: boolean;
  canProceedIos: boolean;
  canProceedAnyPlatform: boolean;
};

export function runAppWrapperReadinessGate(
  manifest: WebManifest,
  androidConfig: AndroidWrapperConfig = defaultAndroidWrapperConfig,
  iosConfig: IosWrapperConfig = defaultIosWrapperConfig,
): AppWrapperReadinessGateResult {
  const report = createCrossPlatformReadinessReport(manifest, androidConfig, iosConfig);
  const summary = summarizeCrossPlatformReadiness(report);

  return {
    report,
    summary,
    formatted: formatCrossPlatformReadinessReport(report),
    canProceedAndroid: report.isAndroidReady,
    canProceedIos: report.isIosReady,
    canProceedAnyPlatform: report.isAnyPlatformReady,
  };
}
