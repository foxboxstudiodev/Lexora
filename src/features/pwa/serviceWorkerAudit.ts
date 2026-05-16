export type ServiceWorkerConfig = {
  cacheName: string;
  appScope: string;
  appShell: string[];
  offlineFallback: string;
  handlesOnlyGetRequests: boolean;
  restrictsToSameOrigin: boolean;
  cleansOldCaches: boolean;
};

export type ServiceWorkerAuditIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

export type ServiceWorkerAuditReport = {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: ServiceWorkerAuditIssue[];
};

function issue(code: string, message: string, severity: ServiceWorkerAuditIssue['severity']): ServiceWorkerAuditIssue {
  return { code, message, severity };
}

export function auditServiceWorkerConfig(config: ServiceWorkerConfig): ServiceWorkerAuditReport {
  const issues: ServiceWorkerAuditIssue[] = [];

  if (!config.cacheName.trim()) {
    issues.push(issue('sw.cache_name.missing', 'Service worker must define a cache name.', 'error'));
  }

  if (!config.appScope.startsWith('/')) {
    issues.push(issue('sw.scope.invalid', 'App scope must be an absolute path.', 'error'));
  }

  if (!config.appShell.includes(config.appScope)) {
    issues.push(issue('sw.shell.scope_missing', 'App shell should include the app scope root.', 'error'));
  }

  if (!config.appShell.some((asset) => asset.endsWith('manifest.webmanifest'))) {
    issues.push(issue('sw.shell.manifest_missing', 'App shell should cache the web manifest.', 'warning'));
  }

  if (!config.appShell.some((asset) => asset.includes('icon'))) {
    issues.push(issue('sw.shell.icon_missing', 'App shell should cache at least one app icon.', 'warning'));
  }

  if (config.offlineFallback !== config.appScope) {
    issues.push(issue('sw.offline_fallback.not_scope_root', 'Offline fallback should return the app scope root for SPA navigation.', 'warning'));
  }

  if (!config.handlesOnlyGetRequests) {
    issues.push(issue('sw.fetch.get_only_missing', 'Service worker should only handle GET requests.', 'error'));
  }

  if (!config.restrictsToSameOrigin) {
    issues.push(issue('sw.fetch.same_origin_missing', 'Service worker should restrict cache handling to same-origin requests.', 'error'));
  }

  if (!config.cleansOldCaches) {
    issues.push(issue('sw.activate.cleanup_missing', 'Service worker should clean old caches during activate.', 'warning'));
  }

  return {
    issueCount: issues.length,
    errorCount: issues.filter((item) => item.severity === 'error').length,
    warningCount: issues.filter((item) => item.severity === 'warning').length,
    issues,
  };
}

export function isServiceWorkerReady(report: ServiceWorkerAuditReport): boolean {
  return report.errorCount === 0;
}
