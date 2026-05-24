import { LanguageCode } from '../i18n/languages';

export type LevelSourceKind = 'manual' | 'seed-expanded';
export type WordLexicalClass = 'noun';
export type WordQualityTag = 'verified-real-word' | 'needs-native-review' | 'rejected';
export type JapaneseJlptLevel = 'pre-n5' | 'n5' | 'n4' | 'n3' | 'n2' | 'n1';
export type ScriptExposure = 'hiragana' | 'katakana' | 'kana-mixed' | 'kanji-assisted' | 'kanji-primary';

export type LanguageLearningMetadata = {
  jlptLevel?: JapaneseJlptLevel;
  scriptExposure?: ScriptExposure;
  frequencyBand?: 1 | 2 | 3 | 4 | 5;
  learnerStage?: 'starter' | 'early' | 'core' | 'expansion' | 'advanced';
};

export type WordQualityMetadata = {
  word: string;
  lexicalClass: WordLexicalClass;
  quality: WordQualityTag;
  source?: string;
  note?: string;
  learning?: LanguageLearningMetadata;
};

export type LevelSourceEntry = {
  packLevelNumber: number;
  words: string[];
  bonusWords?: string[];
  locationId: string;
  seed?: string;
  sourceKind?: LevelSourceKind;
  wordQuality?: WordQualityMetadata[];
  learning?: LanguageLearningMetadata;
};

export type LanguageContentPack = {
  language: LanguageCode;
  targetLevelCount: number;
  entries: LevelSourceEntry[];
};

export type ContentPackBuildStats = {
  language: LanguageCode;
  targetLevelCount: number;
  sourceEntryCount: number;
  completionRate: number;
};

export function getContentPackBuildStats(pack: LanguageContentPack): ContentPackBuildStats {
  return {
    language: pack.language,
    targetLevelCount: pack.targetLevelCount,
    sourceEntryCount: pack.entries.length,
    completionRate: pack.targetLevelCount === 0 ? 0 : pack.entries.length / pack.targetLevelCount,
  };
}
