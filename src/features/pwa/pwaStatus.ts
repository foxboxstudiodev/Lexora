export type PwaDisplayMode = 'browser' | 'standalone' | 'fullscreen' | 'minimal-ui' | 'unknown';

export type PwaStatus = {
  displayMode: PwaDisplayMode;
  isInstalled: boolean;
  canPromptInstall: boolean;
};

export function getDisplayMode(): PwaDisplayMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'unknown';

  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';

  return 'browser';
}

export function createPwaStatus(canPromptInstall: boolean): PwaStatus {
  const displayMode = getDisplayMode();
  return {
    displayMode,
    isInstalled: displayMode === 'standalone' || displayMode === 'fullscreen' || displayMode === 'minimal-ui',
    canPromptInstall,
  };
}
