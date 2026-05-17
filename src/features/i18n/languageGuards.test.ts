import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES, isActiveLanguageCode } from './languages';

describe('language guards', () => {
  it('accepts every supported language code', () => {
    for (const language of ALL_LANGUAGES) {
      expect(isActiveLanguageCode(language)).toBe(true);
    }
  });

  it('rejects unknown strings', () => {
    expect(isActiveLanguageCode('bad-language')).toBe(false);
    expect(isActiveLanguageCode('')).toBe(false);
  });
});
