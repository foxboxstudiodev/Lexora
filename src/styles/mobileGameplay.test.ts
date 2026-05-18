import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mobileCss = fs.readFileSync(path.join(root, 'src/styles/mobileGameplay.css'), 'utf-8');
const accessibilityCss = fs.readFileSync(path.join(root, 'src/styles/accessibility.css'), 'utf-8');

describe('mobile gameplay CSS gate', () => {
  it('keeps mobile gameplay CSS imported into the app style pipeline', () => {
    expect(accessibilityCss).toContain("@import './mobileGameplay.css'");
  });

  it('uses dynamic viewport and safe-area rules for mobile gameplay fit', () => {
    expect(mobileCss).toContain('100dvh');
    expect(mobileCss).toContain('env(safe-area-inset-top)');
    expect(mobileCss).toContain('env(safe-area-inset-bottom)');
    expect(mobileCss).toContain('overflow: hidden');
  });

  it('contains compact fallbacks for short mobile screens', () => {
    expect(mobileCss).toContain('@media (max-height: 620px)');
    expect(mobileCss).toContain('grid-template-rows');
  });
});
