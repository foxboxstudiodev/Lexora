import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/features/achievements/AchievementsScreen.tsx'), 'utf-8');

describe('achievements screen stats gate', () => {
  it('shows total hint usage and all hint type counters', () => {
    expect(source).toContain('labels.hintsUsed');
    expect(source).toContain('stats.hintsUsed');
    expect(source).toContain('stats.hintsByType.reveal_letter');
    expect(source).toContain('stats.hintsByType.reveal_word_start');
    expect(source).toContain('stats.hintsByType.reveal_word');
  });

  it('keeps hint breakdown labels localized through Labels', () => {
    expect(source).toContain('labels.hintLetter');
    expect(source).toContain('labels.hintStart');
    expect(source).toContain('labels.hintWord');
  });
});
