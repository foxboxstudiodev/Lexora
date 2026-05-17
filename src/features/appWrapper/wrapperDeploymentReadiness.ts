import { defaultAndroidWrapperConfig } from './androidWrapperConfig';
import { defaultIosWrapperConfig } from './iosWrapperConfig';

const PRODUCTION_ORIGIN = 'https://lexora.vercel.app';
const PRODUCTION_URL = `${PRODUCTION_ORIGIN}/`;

export type WrapperDeploymentReadiness = {
  androidReady: boolean;
  iosReady: boolean;
  productionOrigin: string;
};

function usesProductionUrl(startUrl: string, allowedOrigins: string[]): boolean {
  return startUrl === PRODUCTION_URL && allowedOrigins.length === 1 && allowedOrigins[0] === PRODUCTION_ORIGIN;
}

export function getWrapperDeploymentReadiness(): WrapperDeploymentReadiness {
  return {
    androidReady: usesProductionUrl(defaultAndroidWrapperConfig.startUrl, defaultAndroidWrapperConfig.allowedOrigins)
      && defaultAndroidWrapperConfig.orientation === 'portrait',
    iosReady: usesProductionUrl(defaultIosWrapperConfig.startUrl, defaultIosWrapperConfig.allowedOrigins)
      && defaultIosWrapperConfig.orientation === 'portrait',
    productionOrigin: PRODUCTION_ORIGIN,
  };
}
