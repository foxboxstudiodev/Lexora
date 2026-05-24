import { getJapaneseFrequencyEntry } from './japaneseFrequency';
import { getJapaneseFuriganaToken } from './japaneseFurigana';
import { analyzeJapaneseWord } from './japaneseMorphology';
import { getJapaneseSemanticGroup } from './japaneseSemanticDuplicates';

export type JapaneseDictionarySource = 'local-core' | 'local-kanji' | 'local-frequency-fallback';

export type JapaneseDictionaryEntry = {
  surface: string;
  reading: string;
  lexicalClass: 'noun' | 'unknown';
  meaningHint?: string;
  source: JapaneseDictionarySource;
  frequencyBand: 1 | 2 | 3 | 4 | 5;
  semanticGroupId?: string;
};

const LOCAL_CORE_MEANINGS: Record<string, string> = {
  ねこ: 'cat',
  いぬ: 'dog',
  やま: 'mountain',
  かわ: 'river',
  みず: 'water',
  そら: 'sky',
  はな: 'flower',
  ひと: 'person',
  ごはん: 'meal/rice',
  ほん: 'book',
  パン: 'bread',
  ゲーム: 'game',
  コーヒー: 'coffee',
  ホテル: 'hotel',
};

export function lookupJapaneseDictionaryEntry(surface: string): JapaneseDictionaryEntry | null {
  const word = surface.trim();
  if (!word) return null;

  const morphology = analyzeJapaneseWord(word);
  const furigana = getJapaneseFuriganaToken(word);
  const semanticGroup = getJapaneseSemanticGroup(word);
  const frequency = getJapaneseFrequencyEntry(word);
  const meaningHint = furigana?.meaningHint ?? LOCAL_CORE_MEANINGS[word];

  if (morphology.lexicalClass === 'unknown' && !meaningHint) return null;

  return {
    surface: word,
    reading: furigana?.reading ?? morphology.normalizedReading,
    lexicalClass: morphology.lexicalClass,
    meaningHint,
    source: furigana ? 'local-kanji' : meaningHint ? 'local-core' : 'local-frequency-fallback',
    frequencyBand: frequency.band,
    semanticGroupId: semanticGroup?.id,
  };
}

export function lookupJapaneseDictionaryEntries(words: string[]): JapaneseDictionaryEntry[] {
  return words
    .map(lookupJapaneseDictionaryEntry)
    .filter((entry): entry is JapaneseDictionaryEntry => entry !== null);
}

export function isJapaneseDictionaryKnownWord(surface: string): boolean {
  return lookupJapaneseDictionaryEntry(surface) !== null;
}
