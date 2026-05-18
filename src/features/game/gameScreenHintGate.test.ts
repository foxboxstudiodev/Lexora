import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/features/game/GameScreen.tsx'), 'utf-8');
const accessibilityCss = fs.readFileSync(path.join(process.cwd(), 'src/styles/accessibility.css'), 'utf-8');

describe('game screen multi-hint gate', () => {
  it('keeps all supported hint types wired into gameplay UI', () => {
    expect(source).toContain("'reveal_letter'");
    expect(source).toContain("'reveal_word_start'");
    expect(source).toContain("'reveal_word'");
    expect(source).toContain('getWordStartReveal');
    expect(source).toContain('getFullWordReveal');
    expect(source).toContain('hintTypes.map');
  });

  it('uses dedicated localized labels for each hint type', () => {
    expect(source).toContain('labels.hintLetter');
    expect(source).toContain('labels.hintStart');
    expect(source).toContain('labels.hintWord');
  });

  it('keeps multi-hint controls styled for mobile gameplay', () => {
    expect(source).toContain('hint-row');
    expect(accessibilityCss).toContain('.hint-row');
    expect(accessibilityCss).toContain('.hint-row button');
  });
});
