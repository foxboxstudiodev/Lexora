import { auditWebManifest, isManifestStoreReady, ManifestAuditReport, WebManifest } from './manifestAudit';
import { auditServiceWorkerConfig, isServiceWorkerReady, ServiceWorkerAuditReport } from './serviceWorkerAudit';
import { serviceWorkerConfig } from './serviceWorkerConfig';

export type StoreReadinessReport = {
  manifest: ManifestAuditReport;
  serviceWorker: ServiceWorkerAuditReport;
  isPwaBaselineReady: boolean;
  blockingIssueCount: number;
  warningIssueCount: number;
};

export function createStoreReadinessReport(manifest: WebManifest): StoreReadinessReport {
  const manifestReport = auditWebManifest(manifest);
  const serviceWorkerReport = auditServiceWorkerConfig(serviceWorkerConfig);
  const blockingIssueCount = manifestReport.errorCount + serviceWorkerReport.errorCount;
  const warningIssueCount = manifestReport.warningCount + serviceWorkerReport.warningCount;

  return {
    manifest: manifestReport,
    serviceWorker: serviceWorkerReport,
    isPwaBaselineReady: isManifestStoreReady(manifestReport) && isServiceWorkerReady(serviceWorkerReport),
    blockingIssueCount,
    warningIssueCount,
  };
}

export function formatStoreReadinessReport(report: StoreReadinessReport): string {
  const manifestLines = report.manifest.issues.map((issue) => `- manifest ${issue.severity} ${issue.code}: ${issue.message}`);
  const serviceWorkerLines = report.serviceWorker.issues.map((issue) => `- service-worker ${issue.severity} ${issue.code}: ${issue.message}`);

  return [
    'LEXORA STORE READINESS REPORT',
    `PWA baseline ready: ${report.isPwaBaselineReady ? 'yes' : 'no'}`,
    `Blocking issues: ${report.blockingIssueCount}`,
    `Warnings: ${report.warningIssueCount}`,
    manifestLines.length > 0 ? 'Manifest issues:' : 'Manifest issues: none',
    ...manifestLines,
    serviceWorkerLines.length > 0 ? 'Service worker issues:' : 'Service worker issues: none',
    ...serviceWorkerLines,
  ].join('\n');
}
