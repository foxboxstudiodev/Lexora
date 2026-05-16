export type WebManifestIcon = {
  src?: string;
  sizes?: string;
  type?: string;
  purpose?: string;
};

export type WebManifest = {
  name?: string;
  short_name?: string;
  description?: string;
  start_url?: string;
  scope?: string;
  display?: string;
  background_color?: string;
  theme_color?: string;
  orientation?: string;
  icons?: WebManifestIcon[];
};

export type ManifestAuditIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

export type ManifestAuditReport = {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: ManifestAuditIssue[];
};

function issue(code: string, message: string, severity: ManifestAuditIssue['severity']): ManifestAuditIssue {
  return { code, message, severity };
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function auditWebManifest(manifest: WebManifest): ManifestAuditReport {
  const issues: ManifestAuditIssue[] = [];

  if (!hasText(manifest.name)) issues.push(issue('manifest.name.missing', 'Manifest name is required.', 'error'));
  if (!hasText(manifest.short_name)) issues.push(issue('manifest.short_name.missing', 'Manifest short_name is required.', 'error'));
  if (!hasText(manifest.start_url)) issues.push(issue('manifest.start_url.missing', 'Manifest start_url is required.', 'error'));
  if (!hasText(manifest.scope)) issues.push(issue('manifest.scope.missing', 'Manifest scope is required.', 'error'));
  if (manifest.display !== 'standalone' && manifest.display !== 'fullscreen' && manifest.display !== 'minimal-ui') {
    issues.push(issue('manifest.display.not_app_like', 'Manifest display should be standalone, fullscreen, or minimal-ui.', 'warning'));
  }
  if (!hasText(manifest.background_color)) issues.push(issue('manifest.background_color.missing', 'Manifest background_color is recommended.', 'warning'));
  if (!hasText(manifest.theme_color)) issues.push(issue('manifest.theme_color.missing', 'Manifest theme_color is recommended.', 'warning'));
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    issues.push(issue('manifest.icons.missing', 'At least one manifest icon is required.', 'error'));
  } else {
    const hasLargeIcon = manifest.icons.some((icon) => hasText(icon.src) && icon.sizes?.includes('512x512'));
    const hasMaskableIcon = manifest.icons.some((icon) => icon.purpose?.includes('maskable'));
    if (!hasLargeIcon) issues.push(issue('manifest.icons.large_missing', 'A 512x512 icon is required for install surfaces.', 'error'));
    if (!hasMaskableIcon) issues.push(issue('manifest.icons.maskable_missing', 'A maskable icon is recommended for Android install surfaces.', 'warning'));
  }

  return {
    issueCount: issues.length,
    errorCount: issues.filter((item) => item.severity === 'error').length,
    warningCount: issues.filter((item) => item.severity === 'warning').length,
    issues,
  };
}

export function isManifestStoreReady(report: ManifestAuditReport): boolean {
  return report.errorCount === 0;
}
