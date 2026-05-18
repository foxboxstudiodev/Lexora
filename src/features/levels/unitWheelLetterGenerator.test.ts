import { describe, expect, it } from 'vitest';
import { MAX_WHEEL_UNITS, MIN_WHEEL_UNITS } from './wheelRules';
import { canBuildWordFromWheelUnits, generateWheelUnits } from './unitWheelLetterGenerator';

describe('language-aware wheel unit generator', () => {
  it('enforces the global 4 to 10 wheel unit range', () => {
    const units = generateWheelUnits({
      language: 'en',
      primaryWord: 'STONE',
      words: ['STONE'],
      minWheelUnits: 1,
      maxWheelUnits: 20,
      fillerUnits: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      seed: 'global-range',
    });

    expect(MIN_WHEEL_UNITS).toBe(4);
    expect(MAX_WHEEL_UNITS).toBe(10);
    expect(units.length).toBeGreaterThanOrEqual(MIN_WHEEL_UNITS);
    expect(units.length).toBeLessThanOrEqual(MAX_WHEEL_UNITS);
  });

  it('keeps Hindi grapheme-like units intact', () => {
    const units = generateWheelUnits({
      language: 'hi',
      primaryWord: 'का',
      words: ['का'],
      minWheelUnits: 2,
      maxWheelUnits: 4,
      fillerUnits: ['म', 'न'],
      seed: 'hi-1',
    });

    expect(units.length).toBeGreaterThanOrEqual(MIN_WHEEL_UNITS);
    expect(units).toContain('का');
    expect(canBuildWordFromWheelUnits('का', units, 'hi')).toBe(true);
  });

  it('builds Chinese words from character units', () => {
    const units = generateWheelUnits({
      language: 'zh',
      primaryWord: '山水',
      words: ['山水'],
      minWheelUnits: 4,
      maxWheelUnits: 6,
      fillerUnits: ['人', '火', '木'],
      seed: 'zh-1',
    });

    expect(units.length).toBeGreaterThanOrEqual(MIN_WHEEL_UNITS);
    expect(canBuildWordFromWheelUnits('山水', units, 'zh')).toBe(true);
  });

  it('builds Japanese words from kana units', () => {
    const units = generateWheelUnits({
      language: 'ja',
      primaryWord: 'さくら',
      words: ['さくら'],
      minWheelUnits: 4,
      maxWheelUnits: 6,
      fillerUnits: ['あ', 'か', 'た'],
      seed: 'ja-1',
    });

    expect(canBuildWordFromWheelUnits('さくら', units, 'ja')).toBe(true);
  });

  it('builds Korean words from syllable-block units', () => {
    const units = generateWheelUnits({
      language: 'ko',
      primaryWord: '하늘',
      words: ['하늘'],
      minWheelUnits: 4,
      maxWheelUnits: 6,
      fillerUnits: ['가', '나', '다'],
      seed: 'ko-1',
    });

    expect(canBuildWordFromWheelUnits('하늘', units, 'ko')).toBe(true);
  });

  it('avoids direct ordered primary word when possible', () => {
    const units = generateWheelUnits({
      language: 'zh',
      primaryWord: '山水人火木',
      words: ['山水人火木'],
      minWheelUnits: 5,
      maxWheelUnits: 5,
      fillerUnits: [],
      seed: 'zh-ordered-risk',
    });

    expect(units.join('')).not.toBe('山水人火木');
    expect([...units].reverse().join('')).not.toBe('山水人火木');
  });
});
