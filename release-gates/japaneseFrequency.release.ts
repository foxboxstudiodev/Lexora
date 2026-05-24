import { describe, expect, it } from 'vitest';
import {
  getJapaneseFrequencyEntry,
  getJapaneseFrequencyPool,
  sortJapaneseWordsByFrequency,
} from '../src/features/i18n/japaneseFrequency';

describe('Japanese frequency release gate', () => {
  it('returns stable frequency entries for core Japanese words', () => {
    expect(getJapaneseFrequencyEntry('ねこ').band).toBe(1);
    expect(getJapaneseFrequencyEntry('ゲーム').band).toBe(2);
    expect(getJapaneseFrequencyEntry('山').band).toBe(1);
  });

  it('falls back safely for unknown Japanese words', () => {
    expect(getJapaneseFrequencyEntry('未知').band).toBe(3);
    expect(getJapaneseFrequencyEntry('未知').source).toBe('fallback-progression-order');
  });

  it('sorts Japanese vocabulary by frequency band', () => {
    const sorted = sortJapaneseWordsByFrequency(['ゲーム', 'ねこ', '山']);

    expect(sorted[0]).toBe('ねこ');
    expect(sorted.includes('ゲーム')).toBe(true);
  });

  it('builds limited frequency pools', () => {
    const pool = getJapaneseFrequencyPool(2);

    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((entry) => entry.band <= 2)).toBe(true);
    expect(pool.some((entry) => entry.word === 'ねこ')).toBe(true);
  });
});
