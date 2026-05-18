import { describe, expect, it } from 'vitest';
import { ALL_LANGUAGES } from '../src/features/i18n/languages';
import { getContentPack } from '../src/features/levels/contentPacks/contentPackRegistry';

describe('word quality release gate', () => {
  it('requires noun-only verified word quality metadata for every main and bonus word', () => {
    for (const language of ALL_LANGUAGES) {
      const pack = getContentPack(language);
      expect(pack, `${language} pack`).not.toBeNull();
      if (!pack) continue;

      for (const entry of pack.entries) {
        const requiredWords = new Set([...entry.words, ...(entry.bonusWords ?? [])].map((word) => word.trim()));
        const metadata = entry.wordQuality ?? [];
        const metadataByWord = new Map(metadata.map((item) => [item.word.trim(), item]));

        for (const word of requiredWords) {
          const quality = metadataByWord.get(word);
          expect(quality, `${language} level ${entry.packLevelNumber} missing quality metadata for ${word}`).toBeDefined();
          expect(quality?.lexicalClass, `${language} level ${entry.packLevelNumber} ${word}`).toBe('noun');
          expect(quality?.quality, `${language} level ${entry.packLevelNumber} ${word}`).toBe('verified-real-word');
        }

        for (const item of metadata) {
          expect(item.quality, `${language} level ${entry.packLevelNumber} ${item.word}`).not.toBe('rejected');
          expect(item.quality, `${language} level ${entry.packLevelNumber} ${item.word}`).not.toBe('needs-native-review');
        }
      }
    }
  });
});
