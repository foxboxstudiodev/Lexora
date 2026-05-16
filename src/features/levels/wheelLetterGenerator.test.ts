import { describe, expect, it } from 'vitest';
import { canBuildWordFromWheel, generateWheelLetters } from './wheelLetterGenerator';

describe('wheel letter generator', () => {
  it('generates at least the configured minimum wheel size', () => {
    const letters = generateWheelLetters({
      primaryWord: 'CAT',
      words: ['CAT', 'ACT'],
      minWheelLetters: 5,
      maxWheelLetters: 6,
      fillerLetters: ['R', 'S', 'T'],
      seed: 'level-1',
    });

    expect(letters.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps every main word buildable from the wheel', () => {
    const words = ['STONE', 'TONE', 'ONE'];
    const letters = generateWheelLetters({
      primaryWord: 'STONE',
      words,
      minWheelLetters: 5,
      maxWheelLetters: 7,
      fillerLetters: ['A', 'R', 'L'],
      seed: 'level-2',
    });

    for (const word of words) {
      expect(canBuildWordFromWheel(word, letters)).toBe(true);
    }
  });

  it('is deterministic for the same seed', () => {
    const input = {
      primaryWord: 'TRAVEL',
      words: ['TRAVEL', 'LATE'],
      minWheelLetters: 6,
      maxWheelLetters: 7,
      fillerLetters: ['S', 'N'],
      seed: 'fixed-seed',
    };

    expect(generateWheelLetters(input)).toEqual(generateWheelLetters(input));
  });

  it('keeps generated wheels within configured maximum size', () => {
    const letters = generateWheelLetters({
      primaryWord: 'TRAVEL',
      words: ['TRAVEL', 'LATE'],
      minWheelLetters: 6,
      maxWheelLetters: 7,
      fillerLetters: ['S', 'N'],
      seed: 'size-check',
    });

    expect(letters.length).toBeLessThanOrEqual(7);
  });

  it('avoids returning the primary word in direct wheel order', () => {
    const letters = generateWheelLetters({
      primaryWord: 'ABCDE',
      words: ['ABCDE'],
      minWheelLetters: 5,
      maxWheelLetters: 5,
      fillerLetters: [],
      seed: 'ordered-risk',
    });

    expect(letters.join('')).not.toBe('ABCDE');
    expect([...letters].reverse().join('')).not.toBe('ABCDE');
  });
});
