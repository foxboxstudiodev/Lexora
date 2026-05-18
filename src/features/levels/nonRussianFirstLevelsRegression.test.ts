import { describe, expect, it } from 'vitest';
import { ACTIVE_LANGUAGES } from '../i18n/languages';
import { getLevelsByLanguage } from './levels';

function signature(level: ReturnType<typeof getLevelsByLanguage>[number]): string {
  const letters = [...level.letters].sort((a, b) => a.localeCompare(b)).join('|');
  const words = level.mainWords.map((item) => item.word).sort((a, b) => a.localeCompare(b)).join('|');
  return `${letters}::${words}`;
}

describe('non Russian first levels regression', () => {
  it('does not repeat level 1 as levels 2 and 3 for any non-Russian language', () => {
    for (const language of ACTIVE_LANGUAGES.filter((item) => item !== 'ru')) {
      const levels = getLevelsByLanguage(language).slice(0, 3);
      expect(levels.length, `${language} must have first three levels`).toBe(3);
      expect(new Set(levels.map(signature)).size, `${language} levels 1, 2 and 3 must be different`).toBe(3);
    }
  });
});
