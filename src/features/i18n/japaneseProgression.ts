import { JapaneseJlptLevel, LanguageLearningMetadata, ScriptExposure } from '../levels/contentPackTypes';
import { jaContentPack } from '../levels/contentPacks/jaContentPack';
import { japaneseKatakanaSeeds } from './japaneseKatakanaSeeds';

const JLPT_ORDER: JapaneseJlptLevel[] = ['pre-n5', 'n5', 'n4', 'n3', 'n2', 'n1'];
const SCRIPT_ORDER: ScriptExposure[] = ['hiragana', 'katakana', 'kana-mixed', 'kanji-assisted', 'kanji-primary'];

export type JapaneseProgressionProfile = {
  maxJlptLevel: JapaneseJlptLevel;
  allowedScripts: ScriptExposure[];
  maxFrequencyBand: 1 | 2 | 3 | 4 | 5;
  learnerStages: Array<NonNullable<LanguageLearningMetadata['learnerStage']>>;
};

export const JAPANESE_STARTER_PROFILE: JapaneseProgressionProfile = {
  maxJlptLevel: 'n5',
  allowedScripts: ['hiragana'],
  maxFrequencyBand: 2,
  learnerStages: ['starter', 'early', 'core'],
};

export const JAPANESE_KATAKANA_ONBOARDING_PROFILE: JapaneseProgressionProfile = {
  maxJlptLevel: 'n5',
  allowedScripts: ['hiragana', 'katakana'],
  maxFrequencyBand: 2,
  learnerStages: ['starter', 'early', 'core'],
};

function rankJlpt(level: JapaneseJlptLevel): number {
  return JLPT_ORDER.indexOf(level);
}

function isJlptWithinLimit(level: JapaneseJlptLevel, maxLevel: JapaneseJlptLevel): boolean {
  return rankJlpt(level) <= rankJlpt(maxLevel);
}

function isLearningMetadataAllowed(metadata: LanguageLearningMetadata | undefined, profile: JapaneseProgressionProfile): boolean {
  if (!metadata?.jlptLevel || !metadata.scriptExposure || !metadata.frequencyBand || !metadata.learnerStage) return false;
  if (!isJlptWithinLimit(metadata.jlptLevel, profile.maxJlptLevel)) return false;
  if (!profile.allowedScripts.includes(metadata.scriptExposure)) return false;
  if (metadata.frequencyBand > profile.maxFrequencyBand) return false;
  if (!profile.learnerStages.includes(metadata.learnerStage)) return false;
  return true;
}

export function getJapaneseWordsForProgression(profile: JapaneseProgressionProfile = JAPANESE_STARTER_PROFILE): string[] {
  const words = new Set<string>();

  for (const entry of jaContentPack.entries) {
    if (!isLearningMetadataAllowed(entry.learning, profile)) continue;

    for (const item of entry.wordQuality ?? []) {
      if (isLearningMetadataAllowed(item.learning, profile)) {
        words.add(item.word);
      }
    }
  }

  if (profile.allowedScripts.includes('katakana')) {
    for (const seed of japaneseKatakanaSeeds) {
      if (isLearningMetadataAllowed(seed.quality.learning, profile)) {
        words.add(seed.katakana);
      }
    }
  }

  return Array.from(words).sort((left, right) => left.localeCompare(right, 'ja'));
}

export function getJapaneseEntriesForProgression(profile: JapaneseProgressionProfile = JAPANESE_STARTER_PROFILE) {
  return jaContentPack.entries.filter((entry) => isLearningMetadataAllowed(entry.learning, profile));
}

export function getNextJapaneseScriptExposure(current: ScriptExposure): ScriptExposure | null {
  const index = SCRIPT_ORDER.indexOf(current);
  if (index < 0 || index >= SCRIPT_ORDER.length - 1) return null;
  return SCRIPT_ORDER[index + 1];
}
