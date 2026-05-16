import { IosWrapperConfig } from './iosWrapperConfig';

export type IosWrapperValidationIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

export type IosWrapperValidationReport = {
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: IosWrapperValidationIssue[];
};

const BUNDLE_ID_PATTERN = /^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z][A-Za-z0-9-]*)+$/;

function issue(code: string, message: string, severity: IosWrapperValidationIssue['severity']): IosWrapperValidationIssue {
  return { code, message, severity };
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function parseMajorIosVersion(value: string): number {
  const major = Number(value.split('.')[0]);
  return Number.isFinite(major) ? major : 0;
}

export function validateIosWrapperConfig(config: IosWrapperConfig): IosWrapperValidationReport {
  const issues: IosWrapperValidationIssue[] = [];

  if (config.appName.trim().length < 2) {
    issues.push(issue('ios.app_name.invalid', 'iOS app name must be readable.', 'error'));
  }

  if (!BUNDLE_ID_PATTERN.test(config.bundleId)) {
    issues.push(issue('ios.bundle_id.invalid', 'Bundle ID must use reverse-domain format.', 'error'));
  }

  if (!/^\d+\.\d+\.\d+$/.test(config.versionName)) {
    issues.push(issue('ios.version_name.invalid', 'Version name should use semantic version format x.y.z.', 'warning'));
  }

  if (!Number.isInteger(config.buildNumber) || config.buildNumber < 1) {
    issues.push(issue('ios.build_number.invalid', 'Build number must be a positive integer.', 'error'));
  }

  if (!isHttpsUrl(config.startUrl)) {
    issues.push(issue('ios.start_url.invalid', 'iOS wrapper startUrl must be a valid HTTPS URL.', 'error'));
  }

  if (config.allowedOrigins.length === 0 || config.allowedOrigins.some((origin) => !isHttpsUrl(origin))) {
    issues.push(issue('ios.allowed_origins.invalid', 'Allowed origins must contain valid HTTPS origins.', 'error'));
  }

  if (parseMajorIosVersion(config.minimumIosVersion) < 15) {
    issues.push(issue('ios.minimum_version.low', 'Minimum iOS version should be at least 15.0 for the planned wrapper baseline.', 'warning'));
  }

  return {
    issueCount: issues.length,
    errorCount: issues.filter((item) => item.severity === 'error').length,
    warningCount: issues.filter((item) => item.severity === 'warning').length,
    issues,
  };
}

export function isIosWrapperConfigReady(report: IosWrapperValidationReport): boolean {
  return report.errorCount === 0;
}
