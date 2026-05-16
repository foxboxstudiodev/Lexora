import { describe, expect, it } from 'vitest';
import { toUnitWord, toUnitWords, unitWordsToStrings } from './wordUnitAdapter';

describe('word unit adapter', () => {
  it('converts a word into normalized units', () => {
    const word = toUnitWord('stone', 'en');
    expect(word.units).toEqual(['S', 'T', 'O', 'N', 'E']);
    expect(word.normalized).toBe('STONE');
  });

  it('deduplicates normalized words', () => {
    const words = toUnitWords(['stone', 'STONE', 'tone'], 'en');
    expect(unitWordsToStrings(words)).toEqual(['STONE', 'TONE']);
  });

  it('supports CJK word units', () => {
    const chinese = toUnitWord('山水', 'zh');
    const japanese = toUnitWord('さくら', 'ja');
    const korean = toUnitWord('하늘', 'ko');

    expect(chinese.units).toEqual(['山', '水']);
    expect(japanese.units).toEqual(['さ', 'く', 'ら']);
    expect(korean.units).toEqual(['하', '늘']);
  });

  it('supports Hindi grapheme-like units', () => {
    expect(toUnitWord('का', 'hi').units).toEqual(['का']);
  });
});
