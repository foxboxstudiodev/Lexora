import { describe, expect, it } from 'vitest';
import {
  assertBeginnerAzerbaijaniWord,
  isBeginnerAzerbaijaniWord,
  normalizeAzerbaijaniWord,
  REJECTED_AZERBAIJANI_WORDS,
} from '../src/features/i18n/azerbaijaniWordPolicy';
import { azContentPack } from '../src/features/levels/contentPacks/azContentPack';

function collectEntryWords(entry: (typeof azContentPack.entries)[number]): string[] {
  return [...entry.words, ...(entry.bonusWords ?? [])].map((word) => word.trim()).filter(Boolean);
}

describe('Azerbaijani content quality release gate', () => {
  it('uses the production Azerbaijani content pack', () => {
    expect(azContentPack.language).toBe('az');
    expect(azContentPack.targetLevelCount).toBe(300);
    expect(azContentPack.entries.length).toBeGreaterThanOrEqual(5);
  });

  it('rejects known placeholder/fake Azerbaijani words', () => {
    for (const rejected of REJECTED_AZERBAIJANI_WORDS) {
      expect(isBeginnerAzerbaijaniWord(rejected), `Rejected Azerbaijani word leaked: ${rejected}`).toBe(false);
    }
  });

  it('uses beginner-safe Azerbaijani words only', () => {
    for (const entry of azContentPack.entries) {
      for (const word of collectEntryWords(entry)) {
        expect(isBeginnerAzerbaijaniWord(word), `Invalid Azerbaijani beginner word: ${word}`).toBe(true);
        expect(() => assertBeginnerAzerbaijaniWord(word)).not.toThrow();
      }
    }
  });

  it('requires noun-only verified metadata for every Azerbaijani source and bonus word', () => {
    for (const entry of azContentPack.entries) {
      const words = new Set(collectEntryWords(entry).map(normalizeAzerbaijaniWord));
      const qualityByWord = new Map((entry.wordQuality ?? []).map((item) => [normalizeAzerbaijaniWord(item.word), item]));

      for (const word of words) {
        const quality = qualityByWord.get(word);
        expect(quality, `Missing Azerbaijani word quality metadata for ${word}`).toBeDefined();
        expect(quality?.lexicalClass, `Azerbaijani word must be noun-only: ${word}`).toBe('noun');
        expect(quality?.quality, `Azerbaijani word must be verified: ${word}`).toBe('verified-real-word');
      }
    }
  });

  it('provides enough Azerbaijani source words for expansion levels', () => {
    for (const entry of azContentPack.entries) {
      expect(entry.words.length, `Azerbaijani level ${entry.packLevelNumber} needs a rich source pool`).toBeGreaterThanOrEqual(30);
    }
  });
});
