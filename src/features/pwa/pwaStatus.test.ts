import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPwaStatus, getDisplayMode } from './pwaStatus';

function mockDisplayMode(activeMode: string | null) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: activeMode !== null && query === `(display-mode: ${activeMode})`,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('PWA status helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects browser display mode', () => {
    mockDisplayMode(null);
    expect(getDisplayMode()).toBe('browser');
  });

  it('detects standalone display mode', () => {
    mockDisplayMode('standalone');
    expect(getDisplayMode()).toBe('standalone');
  });

  it('marks installed modes as installed', () => {
    mockDisplayMode('fullscreen');
    expect(createPwaStatus(false)).toEqual({
      displayMode: 'fullscreen',
      isInstalled: true,
      canPromptInstall: false,
    });
  });

  it('keeps install prompt availability separate from installed status', () => {
    mockDisplayMode(null);
    expect(createPwaStatus(true)).toEqual({
      displayMode: 'browser',
      isInstalled: false,
      canPromptInstall: true,
    });
  });
});
