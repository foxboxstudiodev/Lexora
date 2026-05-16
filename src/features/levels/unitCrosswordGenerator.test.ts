import { describe, expect, it } from 'vitest';
import { generateUnitCrossword } from './unitCrosswordGenerator';

describe('language-aware crossword generator', () => {
  it('places Latin words and counts intersections by units', () => {
    const result = generateUnitCrossword(['STONE', 'TONE', 'ONE'], 'en');

    expect(result.runtimePlacedWords.length).toBeGreaterThanOrEqual(2);
    expect(result.intersections).toBeGreaterThanOrEqual(1);
    expect(result.runtimePlacedWords[0].word).toBe('STONE');
  });

  it('keeps Hindi grapheme-like units intact in placed words', () => {
    const result = generateUnitCrossword(['का', 'कम'], 'hi');

    expect(result.placedWords[0].units).toContain('का');
    expect(result.runtimePlacedWords[0].word).toContain('का');
  });

  it('places Chinese words by character units', () => {
    const result = generateUnitCrossword(['山水', '水火'], 'zh');

    expect(result.runtimePlacedWords.length).toBe(2);
    expect(result.intersections).toBeGreaterThanOrEqual(1);
    expect(result.placedWords[0].units).toEqual(['山', '水']);
  });

  it('places Japanese words by kana units', () => {
    const result = generateUnitCrossword(['さくら', 'くも'], 'ja');

    expect(result.runtimePlacedWords.length).toBeGreaterThanOrEqual(1);
    expect(result.placedWords[0].units).toEqual(['さ', 'く', 'ら']);
  });

  it('places Korean words by syllable block units', () => {
    const result = generateUnitCrossword(['하늘', '늘봄'], 'ko');

    expect(result.runtimePlacedWords.length).toBe(2);
    expect(result.intersections).toBeGreaterThanOrEqual(1);
    expect(result.placedWords[0].units).toEqual(['하', '늘']);
  });

  it('rejects words that cannot intersect the current unit grid', () => {
    const result = generateUnitCrossword(['STONE', 'PUP'], 'en');

    expect(result.rejectedWords).toContain('PUP');
  });
});
