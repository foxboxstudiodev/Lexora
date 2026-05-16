import { normalizeWord } from '../game/engine';
import { Level } from './types';

export type LevelPackValidationIssue = {
  code: string;
  message: string;
  affectedLevelIds: number[];
};

export type LevelPackValidationReport = {
  language: string;
  totalLevels: number;
  orderedPrimaryWordCount: number;
  orderedPrimaryWordRate: number;
  maxAllowedOrderedPrimaryWords: number;
  issues: LevelPackValidationIssue[];
};

const ORDERED_PRIMARY_WORD_LIMIT_RATE = 0.01;

function wheelOrderWord(letters: string[]): string {
  return normalizeWord(letters.join(''));
}

function reverseWheelOrderWord(letters: string[]): string {
  return normalizeWord([...letters].reverse().join(''));
}

function getPrimaryWord(level: Level): string {
  return normalizeWord(level.mainWords[0]?.word ?? '');
}

export function hasOrderedPrimaryWord(level: Level): boolean {
  const primary = getPrimaryWord(level);
  if (!primary) return false;
  return primary === wheelOrderWord(level.letters) || primary === reverseWheelOrderWord(level.letters);
}

export function validateLevelPack(language: string, levels: Level[]): LevelPackValidationReport {
  const orderedLevels = levels.filter(hasOrderedPrimaryWord);
  const maxAllowedOrderedPrimaryWords = Math.max(1, Math.floor(levels.length * ORDERED_PRIMARY_WORD_LIMIT_RATE));
  const orderedPrimaryWordRate = levels.length === 0 ? 0 : orderedLevels.length / levels.length;
  const issues: LevelPackValidationIssue[] = [];

  if (orderedLevels.length > maxAllowedOrderedPrimaryWords) {
    issues.push({
      code: 'pack.ordered_primary_word_rate_exceeded',
      message: `Ordered primary words exceed the ${ORDERED_PRIMARY_WORD_LIMIT_RATE * 100}% target: ${orderedLevels.length}/${levels.length}.`,
      affectedLevelIds: orderedLevels.map((level) => level.id),
    });
  }

  return {
    language,
    totalLevels: levels.length,
    orderedPrimaryWordCount: orderedLevels.length,
    orderedPrimaryWordRate,
    maxAllowedOrderedPrimaryWords,
    issues,
  };
}

export function validateLevelPacksByLanguage(levels: Level[]): LevelPackValidationReport[] {
  const groups = new Map<string, Level[]>();

  for (const level of levels) {
    const group = groups.get(level.language) ?? [];
    group.push(level);
    groups.set(level.language, group);
  }

  return Array.from(groups.entries())
    .map(([language, languageLevels]) => validateLevelPack(language, languageLevels.sort((a, b) => a.id - b.id)))
    .sort((a, b) => a.language.localeCompare(b.language));
}
