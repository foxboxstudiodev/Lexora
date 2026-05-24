import { describe, expect, it } from 'vitest';
import {
  getJapaneseEntriesForProgression,
  getJapaneseWordsForProgression,
  getNextJapaneseScriptExposure,
  JAPANESE_STARTER_PROFILE,
} from '../src/features/i18n/japaneseProgression';

describe('Japanese progression release gate', () => {
  it('returns beginner-safe Japanese entries for the starter progression profile', () => {
    const entries = getJapaneseEntriesForProgression(JAPANESE_STARTER_PROFILE);

    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(entry.learning?.jlptLevel).toBe('n5');
      expect(entry.learning?.scriptExposure).toBe('hiragana');
      expect(entry.learning?.frequencyBand).toBeLessThanOrEqual(2);
    }
  });

  it('returns a stable beginner Japanese vocabulary pool', () => {
    const words = getJapaneseWordsForProgression(JAPANESE_STARTER_PROFILE);

    expect(words.length).toBeGreaterThanOrEqual(100);
    expect(words).toContain('ねこ');
    expect(words).toContain('やま');
    expect(words).toContain('ごはん');
    expect(words).not.toContain('たべる');
    expect(words).not.toContain('おおきい');
  });

  it('supports deterministic Japanese script progression ordering', () => {
    expect(getNextJapaneseScriptExposure('hiragana')).toBe('katakana');
    expect(getNextJapaneseScriptExposure('katakana')).toBe('kana-mixed');
    expect(getNextJapaneseScriptExposure('kana-mixed')).toBe('kanji-assisted');
    expect(getNextJapaneseScriptExposure('kanji-assisted')).toBe('kanji-primary');
    expect(getNextJapaneseScriptExposure('kanji-primary')).toBeNull();
  });
});
