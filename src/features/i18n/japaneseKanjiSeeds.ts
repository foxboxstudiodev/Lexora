import { LanguageLearningMetadata, WordQualityMetadata } from '../levels/contentPackTypes';

export type JapaneseKanjiSeed = {
  kanji: string;
  kanaReading: string;
  meaningHint: string;
  gradeHint: 'starter-kanji' | 'early-kanji' | 'core-kanji';
  quality: WordQualityMetadata;
};

const KANJI_ASSISTED_LEARNING: LanguageLearningMetadata = {
  jlptLevel: 'n5',
  scriptExposure: 'kanji-assisted',
  frequencyBand: 2,
  learnerStage: 'core',
};

function kanjiSeed(kanji: string, kanaReading: string, meaningHint: string, gradeHint: JapaneseKanjiSeed['gradeHint']): JapaneseKanjiSeed {
  return {
    kanji,
    kanaReading,
    meaningHint,
    gradeHint,
    quality: {
      word: kanji,
      lexicalClass: 'noun',
      quality: 'verified-real-word',
      source: 'manual-japanese-kanji-onboarding-pack',
      note: `Beginner kanji-assisted noun. Reading: ${kanaReading}. Meaning hint: ${meaningHint}.`,
      learning: KANJI_ASSISTED_LEARNING,
    },
  };
}

export const japaneseKanjiSeeds: JapaneseKanjiSeed[] = [
  kanjiSeed('山', 'やま', 'mountain', 'starter-kanji'),
  kanjiSeed('川', 'かわ', 'river', 'starter-kanji'),
  kanjiSeed('水', 'みず', 'water', 'starter-kanji'),
  kanjiSeed('火', 'ひ', 'fire', 'starter-kanji'),
  kanjiSeed('木', 'き', 'tree/wood', 'starter-kanji'),
  kanjiSeed('日', 'ひ', 'sun/day', 'starter-kanji'),
  kanjiSeed('月', 'つき', 'moon/month', 'starter-kanji'),
  kanjiSeed('人', 'ひと', 'person', 'starter-kanji'),
  kanjiSeed('口', 'くち', 'mouth', 'starter-kanji'),
  kanjiSeed('目', 'め', 'eye', 'starter-kanji'),
  kanjiSeed('手', 'て', 'hand', 'starter-kanji'),
  kanjiSeed('足', 'あし', 'foot/leg', 'starter-kanji'),
  kanjiSeed('花', 'はな', 'flower', 'early-kanji'),
  kanjiSeed('雨', 'あめ', 'rain', 'early-kanji'),
  kanjiSeed('空', 'そら', 'sky', 'early-kanji'),
  kanjiSeed('海', 'うみ', 'sea', 'early-kanji'),
  kanjiSeed('犬', 'いぬ', 'dog', 'early-kanji'),
  kanjiSeed('猫', 'ねこ', 'cat', 'early-kanji'),
  kanjiSeed('本', 'ほん', 'book', 'early-kanji'),
  kanjiSeed('車', 'くるま', 'car', 'early-kanji'),
];

export function getJapaneseKanjiWordQuality(): WordQualityMetadata[] {
  return japaneseKanjiSeeds.map((seed) => seed.quality);
}
