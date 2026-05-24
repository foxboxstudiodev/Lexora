import { describe, expect, it } from 'vitest';
import {
  classifyJapaneseScript,
  getBalancedJapaneseWordsForProfile,
  getJapaneseScriptBalance,
} from '../src/features/i18n/japaneseScriptBalance';
import {
  JAPANESE_KANJI_ONBOARDING_PROFILE,
  JAPANESE_KATAKANA_ONBOARDING_PROFILE,
  JAPANESE_STARTER_PROFILE,
} from '../src/features/i18n/japaneseProgression';

describe('Japanese script balance release gate', () => {
  it('classifies Japanese scripts correctly', () => {
    expect(classifyJapaneseScript('ねこ')).toBe('hiragana');
    expect(classifyJapaneseScript('ゲーム')).toBe('katakana');
    expect(classifyJapaneseScript('山')).toBe('kanji');
    expect(classifyJapaneseScript('学校')).toBe('kanji');
  });

  it('builds balanced hiragana-only beginner pools', () => {
    const words = getBalancedJapaneseWordsForProfile(JAPANESE_STARTER_PROFILE, 20);
    const report = getJapaneseScriptBalance(words);

    expect(words.length).toBeGreaterThan(0);
    expect(report.buckets.hiragana).toBe(words.length);
    expect(report.buckets.katakana).toBe(0);
    expect(report.buckets.kanji).toBe(0);
  });

  it('supports katakana onboarding balancing', () => {
    const words = getBalancedJapaneseWordsForProfile(JAPANESE_KATAKANA_ONBOARDING_PROFILE, 40);
    const report = getJapaneseScriptBalance(words);

    expect(report.buckets.katakana).toBeGreaterThan(0);
    expect(words).toContain('ゲーム');
  });

  it('supports kanji-assisted balancing', () => {
    const words = getBalancedJapaneseWordsForProfile(JAPANESE_KANJI_ONBOARDING_PROFILE, 60);
    const report = getJapaneseScriptBalance(words);

    expect(report.buckets.kanji).toBeGreaterThan(0);
    expect(words).toContain('山');
    expect(words).toContain('ゲーム');
    expect(words).toContain('ねこ');
  });
});
