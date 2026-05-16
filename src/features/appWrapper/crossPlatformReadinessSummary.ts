import { CrossPlatformReadinessReport } from './crossPlatformReadinessReport';

export type CrossPlatformReadinessStatus = 'ready' | 'partial' | 'blocked';

export type CrossPlatformReadinessSummary = {
  status: CrossPlatformReadinessStatus;
  headline: string;
  nextAction: string;
};

export function summarizeCrossPlatformReadiness(report: CrossPlatformReadinessReport): CrossPlatformReadinessSummary {
  if (report.isEveryPlatformReady) {
    return {
      status: 'ready',
      headline: 'Android and iOS wrapper preparation are ready.',
      nextAction: 'Proceed to wrapper project generation and real-device testing for both platforms.',
    };
  }

  if (report.isAnyPlatformReady) {
    return {
      status: 'partial',
      headline: 'One platform is ready and the other is blocked.',
      nextAction: 'Proceed with the ready platform only; fix the blocked platform before store submission.',
    };
  }

  return {
    status: 'blocked',
    headline: 'Wrapper preparation is blocked for all platforms.',
    nextAction: 'Fix blocking PWA, Android or iOS readiness errors before generating wrapper projects.',
  };
}
