import { describe, expect, it } from 'vitest';
import {
  assertBeginnerJapaneseHiraganaWord,
  isBeginnerJapaneseHiraganaWord,
} from '../src/features/i18n/japaneseWordPolicy';
import { jaContentPack } from '../src/features/levels/contentPacks/jaContentPack';

function collectEntryWords(entry: (typeof jaContentPack.entries)[number]): string[] {
  return [...entry.words, ...(entry.bonusWords ?? [])].map((word) => word.trim()).filter(Boolean);
}

describe('Japanese content quality release gate', () => {
  it('keeps Japanese content in the production jaContentPack instead of the planned placeholder pack', () => {
    expect(jaContentPack.language).toBe('ja');
    expect(jaContentPack.targetLevelCount).toBe(300);
    expect(jaContentPack.entries.length).toBeGreaterThanOrEqual(5);
  });

  it('uses beginner-safe hiragana words only for the initial Japanese pack', () => {
    for (const entry of jaContentPack.entries) {
      for (const word of collectEntryWords(entry)) {
        expect(isBeginnerJapaneseHiraganaWord(word), `Invalid Japanese beginner word: ${word}`).toBe(true);
        expect(() => assertBeginnerJapaneseHiraganaWord(word)).not.toThrow();
      }
    }
  });

  it('requires noun-only verified metadata for every Japanese source and bonus word', () => {
    for (const entry of jaContentPack.entries) {
      const words = new Set(collectEntryWords(entry));
      const qualityByWord = new Map((entry.wordQuality ?? []).map((item) => [item.word.trim(), item]));

      for (const word of words) {
        const quality = qualityByWord.get(word);
        expect(quality, `Missing Japanese word quality metadata for ${word}`).toBeDefined();
        expect(quality?.lexicalClass, `Japanese word must be noun-only: ${word}`).toBe('noun');
        expect(quality?.quality, `Japanese word must be verified: ${word}`).toBe('verified-real-word');
      }
    }
  });

  it('requires Japanese learning metadata on every entry and word-quality item', () => {
    for (const entry of jaContentPack.entries) {
      expect(entry.learning?.jlptLevel, `Japanese level ${entry.packLevelNumber} missing JLPT metadata`).toBe('n5');
      expect(entry.learning?.scriptExposure, `Japanese level ${entry.packLevelNumber} missing script metadata`).toBe('hiragana');
      expect(entry.learning?.frequencyBand, `Japanese level ${entry.packLevelNumber} missing frequency band`).toBeGreaterThanOrEqual(1);
      expect(entry.learning?.frequencyBand, `Japanese level ${entry.packLevelNumber} invalid frequency band`).toBeLessThanOrEqual(5);
      expect(entry.learning?.learnerStage, `Japanese level ${entry.packLevelNumber} missing learner stage`).toBeDefined();

      for (const quality of entry.wordQuality ?? []) {
        expect(quality.learning?.jlptLevel, `Japanese word ${quality.word} missing JLPT metadata`).toBe('n5');
        expect(quality.learning?.scriptExposure, `Japanese word ${quality.word} missing script metadata`).toBe('hiragana');
        expect(quality.learning?.frequencyBand, `Japanese word ${quality.word} missing frequency band`).toBeGreaterThanOrEqual(1);
        expect(quality.learning?.frequencyBand, `Japanese word ${quality.word} invalid frequency band`).toBeLessThanOrEqual(5);
        expect(quality.learning?.learnerStage, `Japanese word ${quality.word} missing learner stage`).toBeDefined();
      }
    }
  });

  it('provides enough Japanese source words for high target-main-word levels after full-pack expansion', () => {
    for (const entry of jaContentPack.entries) {
      expect(entry.words.length, `Japanese level ${entry.packLevelNumber} needs a rich source pool`).toBeGreaterThanOrEqual(30);
    }
  });
});
