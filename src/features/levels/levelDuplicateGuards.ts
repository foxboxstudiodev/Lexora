import { Level } from './types';

export type LevelDuplicateFingerprint = {
  language: string;
  levelId: number;
  fingerprint: string;
  reason: 'same-main-words' | 'same-wheel-units' | 'same-grid-shape';
};

function sortedKey(values: string[]): string {
  return [...values].sort((left, right) => left.localeCompare(right)).join('|');
}

function getMainWordsFingerprint(level: Level): string {
  return `${level.language}:words:${sortedKey(level.mainWords.map((word) => word.word))}`;
}

function getWheelFingerprint(level: Level): string {
  return `${level.language}:wheel:${sortedKey(level.letters)}`;
}

function getGridShapeFingerprint(level: Level): string {
  return `${level.language}:shape:${level.mainWords
    .map((word) => `${word.direction}:${word.startRow},${word.startCol}:${word.word.length}`)
    .sort()
    .join('|')}`;
}

export function findDuplicateRuntimeLevelFingerprints(levels: Level[]): LevelDuplicateFingerprint[] {
  const seen = new Map<string, Level>();
  const duplicates: LevelDuplicateFingerprint[] = [];

  for (const level of levels) {
    const checks = [
      { fingerprint: getMainWordsFingerprint(level), reason: 'same-main-words' as const },
      { fingerprint: getWheelFingerprint(level), reason: 'same-wheel-units' as const },
      { fingerprint: getGridShapeFingerprint(level), reason: 'same-grid-shape' as const },
    ];

    for (const check of checks) {
      const previous = seen.get(check.fingerprint);
      if (previous) {
        duplicates.push({
          language: level.language,
          levelId: level.id,
          fingerprint: check.fingerprint,
          reason: check.reason,
        });
      } else {
        seen.set(check.fingerprint, level);
      }
    }
  }

  return duplicates;
}
