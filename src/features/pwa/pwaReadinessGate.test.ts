import { describe, expect, it } from 'vitest';
import { WebManifest } from './manifestAudit';
import { runPwaReadinessGate } from './pwaReadinessGate';

const readyManifest: WebManifest = {
  name: 'Lexora',
  short_name: 'Lexora',
  description: 'A multilingual word-connect crossword puzzle game.',
  start_url: '/Lexora/',
  scope: '/Lexora/',
  display: 'standalone',
  background_color: '#0f172a',
  theme_color: '#18233f',
  orientation: 'portrait-primary',
  icons: [
    {
      src: '/Lexora/icon.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
};

describe('PWA readiness gate', () => {
  it('allows wrapper preparation for a ready manifest', () => {
    const result = runPwaReadinessGate(readyManifest);

    expect(result.summary.status).toBe('ready');
    expect(result.canProceedToWrapper).toBe(true);
    expect(result.formatted).toContain('LEXORA STORE READINESS REPORT');
  });

  it('allows wrapper preparation with warnings but keeps warning status', () => {
    const result = runPwaReadinessGate({
      ...readyManifest,
      icons: [{ src: '/Lexora/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }],
    });

    expect(result.summary.status).toBe('warning');
    expect(result.canProceedToWrapper).toBe(true);
  });

  it('blocks wrapper preparation when manifest has blocking errors', () => {
    const result = runPwaReadinessGate({ ...readyManifest, name: '', icons: [] });

    expect(result.summary.status).toBe('blocked');
    expect(result.canProceedToWrapper).toBe(false);
  });
});
