export type IosWrapperStrategy = 'capacitor' | 'webview';

export type IosWrapperConfig = {
  appName: string;
  bundleId: string;
  versionName: string;
  buildNumber: number;
  strategy: IosWrapperStrategy;
  startUrl: string;
  allowedOrigins: string[];
  orientation: 'portrait' | 'landscape' | 'any';
  minimumIosVersion: string;
};

export const defaultIosWrapperConfig: IosWrapperConfig = {
  appName: 'Lexora',
  bundleId: 'com.foxboxstudio.lexora',
  versionName: '0.1.0',
  buildNumber: 1,
  strategy: 'capacitor',
  startUrl: 'https://lexora.vercel.app/',
  allowedOrigins: ['https://lexora.vercel.app'],
  orientation: 'portrait',
  minimumIosVersion: '15.0',
};

export function getIosBundleId(config: IosWrapperConfig = defaultIosWrapperConfig): string {
  return config.bundleId;
}

export function getIosVersionLabel(config: IosWrapperConfig = defaultIosWrapperConfig): string {
  return `${config.versionName} (${config.buildNumber})`;
}
