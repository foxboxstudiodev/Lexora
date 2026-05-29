import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson<T = unknown>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf-8')) as T;
}

describe('iOS App Store readiness release gate', () => {
  it('requires Capacitor iOS tooling to be configured', () => {
    const packageJson = readJson<{
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>('package.json');

    expect(packageJson.devDependencies?.['@capacitor/ios']).toBeDefined();
    expect(packageJson.scripts?.['ios:init']).toBe('npx cap add ios');
    expect(packageJson.scripts?.['ios:sync']).toBe('npm run build && npx cap sync ios');
    expect(packageJson.scripts?.['ios:open']).toBe('npx cap open ios');
    expect(packageJson.scripts?.['ios:copy']).toBe('npm run build && npx cap copy ios');
  });

  it('requires the native iOS project before App Store release', () => {
    expect(exists('ios')).toBe(true);
    expect(exists('ios/App')).toBe(true);
  });

  it('requires App Store policy and listing artifacts', () => {
    expect(exists('docs/release/privacy-policy.md')).toBe(true);
    expect(exists('docs/release/data-safety.md')).toBe(true);
    expect(exists('docs/release/app-store-listing.md')).toBe(true);
    expect(exists('docs/release/ios-release-checklist.md')).toBe(true);
  });

  it('requires iOS visual asset folders', () => {
    expect(exists('store-assets/screenshots/ios-phone')).toBe(true);
    expect(exists('store-assets/screenshots/ios-tablet')).toBe(true);
    expect(exists('store-assets/ios-app-icon.png')).toBe(true);
  });
});
