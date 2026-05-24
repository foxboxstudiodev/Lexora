import { describe, expect, it } from 'vitest';
import { jaContentPack } from '../src/features/levels/contentPacks/jaContentPack';

const HIRAGANA_ONLY = /^[ぁ-ゖー]+$/u;

const REJECTED_JA_WORDS = new Set([
  'やち',
  'ぜか',
  'りか',
  'なわ',
  'ちま',
  'まね',
  'まなび',
  'たべる',
  'のむ',
  'みる',
  'きく',
  'よむ',
  'かく',
  'いく',
  'くる',
  'する',
  'ねる',
  'おきる',
  'あるく',
  'はしる',
  'おおきい',
  'ちいさい',
  'あたらしい',
  'ふるい',
  'たのしい',
  'かなしい',
  'しずか',
  'にぎやか',
]);

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
        expect(HIRAGANA_ONLY.test(word), `Japanese word must be hiragana-only: ${word}`).toBe(true);
        expect(word.length, `Japanese word must contain at least two kana: ${word}`).toBeGreaterThanOrEqual(2);
        expect(REJECTED_JA_WORDS.has(word), `Rejected fake/non-noun Japanese word leaked into pack: ${word}`).toBe(false);
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

  it('provides enough Japanese source words for high target-main-word levels after full-pack expansion', () => {
    for (const entry of jaContentPack.entries) {
      expect(entry.words.length, `Japanese level ${entry.packLevelNumber} needs a rich source pool`).toBeGreaterThanOrEqual(30);
    }
  });
});
