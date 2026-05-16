export type ApkBuildChecklistItem = {
  id: string;
  title: string;
  description: string;
  required: boolean;
};

export const apkBuildChecklist: ApkBuildChecklistItem[] = [
  {
    id: 'pwa-readiness',
    title: 'Pass PWA readiness gate',
    description: 'Manifest, service worker, app scope and install baseline must pass the readiness checks.',
    required: true,
  },
  {
    id: 'android-wrapper-config',
    title: 'Validate Android wrapper config',
    description: 'Package name, versionCode, versionName, startUrl and allowed origins must be valid.',
    required: true,
  },
  {
    id: 'wrapper-generation',
    title: 'Generate Android wrapper project',
    description: 'Create the Android project using the selected wrapper strategy, currently TWA baseline.',
    required: true,
  },
  {
    id: 'device-test',
    title: 'Test on a real Android phone',
    description: 'Install the APK on a physical device and verify touch controls, offline start and navigation.',
    required: true,
  },
  {
    id: 'signing',
    title: 'Prepare signing key',
    description: 'Create or configure the Android signing key before release builds.',
    required: true,
  },
  {
    id: 'play-console-internal-test',
    title: 'Run Play Console internal testing',
    description: 'Upload an internal test build before production release.',
    required: true,
  },
];

export function getRequiredApkChecklistItems(): ApkBuildChecklistItem[] {
  return apkBuildChecklist.filter((item) => item.required);
}

export function getApkChecklistCompletionRate(completedIds: string[]): number {
  const required = getRequiredApkChecklistItems();
  if (required.length === 0) return 1;
  const completed = required.filter((item) => completedIds.includes(item.id)).length;
  return completed / required.length;
}
