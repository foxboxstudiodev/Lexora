import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf-8'));
}

describe('store readiness release gate', () => {
  it('requires a complete PWA manifest foundation', () => {
    const manifest = readJson('public/manifest.webmanifest') as {
      name?: string;
      short_name?: string;
      display?: string;
      orientation?: string;
      icons?: Array<{ src?: string; sizes?: string; type?: string; purpose?: string }>;
    };

    expect(manifest.name).toBe('Lexora');
    expect(manifest.short_name).toBe('Lexora');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait-primary');
    expect(manifest.icons?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(manifest.icons?.some((icon) => icon.type === 'image/png' && icon.sizes === '192x192')).toBe(true);
    expect(manifest.icons?.some((icon) => icon.type === 'image/png' && icon.sizes === '512x512' && icon.purpose?.includes('maskable'))).toBe(true);
  });

  it('requires Android packaging and store policy artifacts', () => {
    expect(exists('android')).toBe(true);
    expect(exists('docs/release/privacy-policy.md')).toBe(true);
    expect(exists('docs/release/data-safety.md')).toBe(true);
    expect(exists('docs/release/store-listing.md')).toBe(true);
  });

  it('requires store visual assets placeholders to be replaced by real files', () => {
    expect(exists('public/icons/icon-192.png')).toBe(true);
    expect(exists('public/icons/icon-512.png')).toBe(true);
    expect(exists('store-assets/play-feature-graphic.png')).toBe(true);
    expect(exists('store-assets/screenshots/android-phone')).toBe(true);
  });
});
