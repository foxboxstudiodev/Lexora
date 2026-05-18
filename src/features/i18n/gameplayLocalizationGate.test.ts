import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from './languages';
import { translations } from './translations';

const criticalGameplayKeys = [
  'play',
  'level',
  'coins',
  'hint',
  'hintPrice',
  'shuffle',
  'clear',
  'found',
  'bonus',
  'complete',
  'next',
  'invalid',
  'tooShort',
  'notInPuzzle',
  'alreadyFound',
  'notEnoughCoins',
  'back',
] as const;

describe('critical gameplay localization gate', () => {
  it('does not silently reuse English critical gameplay labels for non-English languages', () => {
    for (const language of ALL_LANGUAGES.filter((item) => item !== 'en')) {
      for (const key of criticalGameplayKeys) {
        expect(translations[language][key], `${language}.${key}`).not.toBe(translations.en[key]);
      }
    }
  });
});
