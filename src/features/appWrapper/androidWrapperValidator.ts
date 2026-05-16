import { AndroidWrapperConfig } from './androidWrapperConfig';

export type AndroidWrapperValidationIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

export type AndroidWrapperValidationReport = {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: AndroidWrapperValidationIssue[];
};

const PACKAGE_NAME_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

function issue(code: string, message: string, severity: AndroidWrapperValidationIssue['severity']): AndroidWrapperValidationIssue {
  return { code, message, severity };
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateAndroidWrapperConfig(config: AndroidWrapperConfig): AndroidWrapperValidationReport {
  const issues: AndroidWrapperValidationIssue[] = [];

  if (config.appName.trim().length < 2) {
    issues.push(issue('android.app_name.invalid', 'Android app name must be readable.', 'error'));
  }

  if (!PACKAGE_NAME_PATTERN.test(config.packageName)) {
    issues.push(issue('android.package_name.invalid', 'Package name must use reverse-domain Android format.', 'error'));
  }

  if (!/^\d+\.\d+\.\d+$/.test(config.versionName)) {
    issues.push(issue('android.version_name.invalid', 'Version name should use semantic version format x.y.z.', 'warning'));
  }

  if (!Number.isInteger(config.versionCode) || config.versionCode < 1) {
    issues.push(issue('android.version_code.invalid', 'Version code must be a positive integer.', 'error'));
  }

  if (!isHttpsUrl(config.startUrl)) {
    issues.push(issue('android.start_url.invalid', 'Android wrapper startUrl must be a valid HTTPS URL.', 'error'));
  }

  if (config.allowedOrigins.length === 0 || config.allowedOrigins.some((origin) => !isHttpsUrl(origin))) {
    issues.push(issue('android.allowed_origins.invalid', 'Allowed origins must contain valid HTTPS origins.', 'error'));
  }

  if (config.minSdkVersion < 23) {
    issues.push(issue('android.min_sdk.low', 'minSdkVersion should be at least 23 for the planned wrapper baseline.', 'warning'));
  }

  if (config.targetSdkVersion < 34) {
    issues.push(issue('android.target_sdk.low', 'targetSdkVersion should stay current for Play Store readiness.', 'warning'));
  }

  return {
    issueCount: issues.length,
    errorCount: issues.filter((item) => item.severity === 'error').length,
    warningCount: issues.filter((item) => item.severity === 'warning').length,
    issues,
  };
}

export function isAndroidWrapperConfigReady(report: AndroidWrapperValidationReport): boolean {
  return report.errorCount === 0;
}
