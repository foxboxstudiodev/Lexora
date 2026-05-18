import { LanguageCode } from '../i18n/languages';

export type LevelSourceKind = 'manual' | 'seed-expanded';
export type WordLexicalClass = 'noun';
export type WordQualityTag = 'verified-real-word' | 'needs-native-review' | 'rejected';

export type WordQualityMetadata = {
  word: string;
  lexicalClass: WordLexicalClass;
  quality: WordQualityTag;
  source?: string;
  note?: string;
};

export type LevelSourceEntry = {
  packLevelNumber: number;
  words: string[];
  bonusWords?: string[];
  locationId: string;
  seed?: string;
  sourceKind?: LevelSourceKind;
  wordQuality?: WordQualityMetadata[];
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
