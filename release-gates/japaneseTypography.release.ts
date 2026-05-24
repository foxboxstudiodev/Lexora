import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Japanese typography release gate', () => {
  it('loads the Japanese typography stylesheet in the main application entrypoint', () => {
    const mainFile = fs.readFileSync(path.resolve(process.cwd(), 'src/main.tsx'), 'utf8');

    expect(mainFile).toContain("./styles/japaneseTypography.css");
  });

  it('defines Japanese-specific typography utility classes', () => {
    const typographyFile = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/japaneseTypography.css'), 'utf8');

    expect(typographyFile).toContain('.japanese-text');
    expect(typographyFile).toContain('.japanese-display-token');
    expect(typographyFile).toContain('.japanese-furigana-token');
    expect(typographyFile).toContain('ruby-position');
    expect(typographyFile).toContain('Noto Sans JP');
  });
});
