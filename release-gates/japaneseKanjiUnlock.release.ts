import { describe, expect, it } from 'vitest';
import {
  getJapaneseKanjiUnlocks,
  isJapaneseKanjiUnlocked,
} from '../src/features/i18n/japaneseKanjiUnlock';
import {
  JAPANESE_KANJI_ONBOARDING_PROFILE,
  JAPANESE_KATAKANA_ONBOARDING_PROFILE,
  JAPANESE_STARTER_PROFILE,
} from '../src/features/i18n/japaneseProgression';

describe('Japanese kanji unlock release gate', () => {
  it('keeps kanji locked for non-kanji beginner profiles', () => {
    expect(getJapaneseKanjiUnlocks(JAPANESE_STARTER_PROFILE).stage).toBe('locked');
    expect(getJapaneseKanjiUnlocks(JAPANESE_KATAKANA_ONBOARDING_PROFILE).stage).toBe('locked');
  });

  it('unlocks onboarding kanji for kanji-assisted profiles', () => {
    const result = getJapaneseKanjiUnlocks(JAPANESE_KANJI_ONBOARDING_PROFILE);

    expect(result.stage).toBe('basic');
    expect(result.unlocked.length).toBeGreaterThan(0);
    expect(result.unlocked.some((item) => item.kanji === '山')).toBe(true);
    expect(result.unlocked.some((item) => item.kanji === '猫')).toBe(true);
  });

  it('supports direct unlock checks', () => {
    expect(isJapaneseKanjiUnlocked(JAPANESE_KANJI_ONBOARDING_PROFILE, '山')).toBe(true);
    expect(isJapaneseKanjiUnlocked(JAPANESE_KANJI_ONBOARDING_PROFILE, '猫')).toBe(true);
    expect(isJapaneseKanjiUnlocked(JAPANESE_STARTER_PROFILE, '山')).toBe(false);
  });
});
