import { japaneseKanjiSeeds } from './japaneseKanjiSeeds';

export type JapaneseFuriganaToken = {
  surface: string;
  reading: string;
  meaningHint?: string;
};

const furiganaBySurface = new Map(
  japaneseKanjiSeeds.map((seed) => [
    seed.kanji,
    {
      surface: seed.kanji,
      reading: seed.kanaReading,
      meaningHint: seed.meaningHint,
    } satisfies JapaneseFuriganaToken,
  ]),
);

export function getJapaneseFuriganaToken(surface: string): JapaneseFuriganaToken | null {
  return furiganaBySurface.get(surface.trim()) ?? null;
}

export function hasJapaneseFurigana(surface: string): boolean {
  return getJapaneseFuriganaToken(surface) !== null;
}

export function annotateJapaneseFurigana(words: string[]): JapaneseFuriganaToken[] {
  return words
    .map((word) => getJapaneseFuriganaToken(word))
    .filter((token): token is JapaneseFuriganaToken => token !== null);
}

export function getJapaneseFuriganaDictionary(): JapaneseFuriganaToken[] {
  return Array.from(furiganaBySurface.values()).sort((left, right) => left.surface.localeCompare(right.surface, 'ja'));
}
