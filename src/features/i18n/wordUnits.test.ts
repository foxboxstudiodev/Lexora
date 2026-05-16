import { describe, expect, it } from 'vitest';
import { countWordUnits, isWordLengthAllowedForEarlyLevels, normalizeWordForLanguage, splitWordIntoUnits } from './wordUnits';

describe('language-aware word units', () => {
  it('splits Latin and Cyrillic words into letters', () => {
    expect(splitWordIntoUnits('stone', 'en')).toEqual(['S', 'T', 'O', 'N', 'E']);
    expect(splitWordIntoUnits('мир', 'ru')).toEqual(['М', 'И', 'Р']);
  });

  it('preserves Azerbaijani and Turkish special letters', () => {
    expect(splitWordIntoUnits('söz', 'az')).toEqual(['S', 'Ö', 'Z']);
    expect(splitWordIntoUnits('iş', 'tr')).toEqual(['İ', 'Ş']);
  });

  it('segments Hindi Devanagari into grapheme-like units', () => {
    expect(splitWordIntoUnits('कमल', 'hi')).toEqual(['क', 'म', 'ल']);
    expect(splitWordIntoUnits('का', 'hi')).toEqual(['का']);
  });

  it('segments Chinese and Japanese by characters', () => {
    expect(splitWordIntoUnits('山水', 'zh')).toEqual(['山', '水']);
    expect(splitWordIntoUnits('さくら', 'ja')).toEqual(['さ', 'く', 'ら']);
  });

  it('segments Korean by Hangul syllable blocks', () => {
    expect(splitWordIntoUnits('하늘', 'ko')).toEqual(['하', '늘']);
  });

  it('counts word units using the language profile', () => {
    expect(countWordUnits('STONE', 'en')).toBe(5);
    expect(countWordUnits('山水', 'zh')).toBe(2);
    expect(countWordUnits('하늘', 'ko')).toBe(2);
  });

  it('validates early-level word length by language units', () => {
    expect(isWordLengthAllowedForEarlyLevels('STONE', 'en')).toBe(true);
    expect(isWordLengthAllowedForEarlyLevels('山水', 'zh')).toBe(true);
    expect(isWordLengthAllowedForEarlyLevels('ABCDEFGHI', 'en')).toBe(false);
  });

  it('normalizes language words consistently', () => {
    expect(normalizeWordForLanguage('stone', 'en')).toBe('STONE');
    expect(normalizeWordForLanguage('azərbaycan', 'az')).toBe('AZƏRBAYCAN');
  });
});
