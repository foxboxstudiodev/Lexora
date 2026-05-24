import { describe, expect, it } from 'vitest';
import {
  getJapaneseKanjiDifficulty,
  getJapaneseKanjiDifficultyPool,
} from '../src/features/i18n/japaneseKanjiDifficulty';

describe('Japanese kanji difficulty release gate', () => {
  it('returns difficulty metadata for starter onboarding kanji', () => {
    expect(getJapaneseKanjiDifficulty('山')?.tier).toBe('starter');
    expect(getJapaneseKanjiDifficulty('川')?.tier).toBe('starter');
    expect(getJapaneseKanjiDifficulty('水')?.reading).toBe('みず');
    expect(getJapaneseKanjiDifficulty('猫')?.tier).toBe('basic');
  });

  it('returns null for unknown kanji', () => {
    expect(getJapaneseKanjiDifficulty('龍')).toBeNull();
    expect(getJapaneseKanjiDifficulty('unknown')).toBeNull();
  });

  it('builds tier-limited kanji pools', () => {
    const starter = getJapaneseKanjiDifficultyPool('starter');
    const basic = getJapaneseKanjiDifficultyPool('basic');
    const intermediate = getJapaneseKanjiDifficultyPool('intermediate');

    expect(starter.length).toBeGreaterThan(0);
    expect(basic.length).toBeGreaterThan(starter.length);
    expect(intermediate.length).toBeGreaterThanOrEqual(basic.length);
    expect(starter.some((item) => item.kanji === '山')).toBe(true);
    expect(starter.some((item) => item.kanji === '猫')).toBe(false);
    expect(basic.some((item) => item.kanji === '猫')).toBe(true);
  });
});
