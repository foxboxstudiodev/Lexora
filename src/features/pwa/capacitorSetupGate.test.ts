import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf-8')) as T;
}

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type CapacitorConfig = {
  appId?: string;
  appName?: string;
  webDir?: string;
  bundledWebRuntime?: boolean;
  server?: {
    androidScheme?: string;
  };
};

describe('Capacitor setup gate', () => {
  it('keeps the selected Android package identity configured', () => {
    const config = readJson<CapacitorConfig>('capacitor.config.json');

    expect(config.appId).toBe('com.foxboxstudio.lexora');
    expect(config.appName).toBe('Lexora');
    expect(config.webDir).toBe('dist');
    expect(config.bundledWebRuntime).toBe(false);
    expect(config.server?.androidScheme).toBe('https');
  });

  it('keeps Capacitor packages installed in package.json', () => {
    const pkg = readJson<PackageJson>('package.json');

    expect(pkg.dependencies?.['@capacitor/core']).toBeDefined();
    expect(pkg.devDependencies?.['@capacitor/cli']).toBeDefined();
    expect(pkg.devDependencies?.['@capacitor/android']).toBeDefined();
  });

  it('keeps Android workflow scripts available', () => {
    const pkg = readJson<PackageJson>('package.json');

    expect(pkg.scripts?.['android:init']).toBe('npx cap add android');
    expect(pkg.scripts?.['android:sync']).toContain('npx cap sync android');
    expect(pkg.scripts?.['android:open']).toBe('npx cap open android');
    expect(pkg.scripts?.['android:copy']).toContain('npx cap copy android');
  });
});
