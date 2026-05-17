export type AndroidWrapperStrategy = 'twa' | 'capacitor' | 'webview';

export type AndroidWrapperConfig = {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  strategy: AndroidWrapperStrategy;
  startUrl: string;
  allowedOrigins: string[];
  orientation: 'portrait' | 'landscape' | 'any';
  minSdkVersion: number;
  targetSdkVersion: number;
};

export const defaultAndroidWrapperConfig: AndroidWrapperConfig = {
  appName: 'Lexora',
  packageName: 'com.foxboxstudio.lexora',
  versionName: '0.1.0',
  versionCode: 1,
  strategy: 'twa',
  startUrl: 'https://lexora.vercel.app/',
  allowedOrigins: ['https://lexora.vercel.app'],
  orientation: 'portrait',
  minSdkVersion: 23,
  targetSdkVersion: 35,
};

export function getAndroidApplicationId(config: AndroidWrapperConfig = defaultAndroidWrapperConfig): string {
  return config.packageName;
}

export function getAndroidVersionLabel(config: AndroidWrapperConfig = defaultAndroidWrapperConfig): string {
  return `${config.versionName} (${config.versionCode})`;
}
