import { describe, expect, it } from 'vitest';
import { getStarterLevelsByLanguageAsync } from './levelPacks';
import { Level, PlacedWord } from './types';

const AZ_WORD_RE = /^[A-Z\u00c7\u018f\u011e\u0130I\u00d6\u015e\u00dc]+$/u;

function countLetters(items: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const letter of item) {
      counts.set(letter, (counts.get(letter) ?? 0) + 1);
    }
  }

  return counts;
}

function canBuildWordByCounts(word: string, letters: string[]): boolean {
  const counts = countLetters(letters);

  for (const letter of word) {
    const current = counts.get(letter) ?? 0;
    if (current <= 0) return false;
    counts.set(letter, current - 1);
  }

  return true;
}

function minMainWordsForLevel(id: number): number {
  if (id <= 20) return 2;
  if (id <= 100) return 3;
  if (id <= 300) return 4;
  return 5;
}

function wordCells(word: PlacedWord): Array<{ key: string; letter: string }> {
  return [...word.word].map((letter, index) => {
    const row = word.direction === 'down' ? word.row + index : word.row;
    const col = word.direction === 'across' ? word.col + index : word.col;
    return { key: `${row}:${col}`, letter };
  });
}

function gridConflictCount(words: PlacedWord[]): number {
  const cells = new Map<string, string>();
  let conflicts = 0;

  for (const word of words) {
    for (const cell of wordCells(word)) {
      const existing = cells.get(cell.key);
      if (existing && existing !== cell.letter) conflicts += 1;
      cells.set(cell.key, cell.letter);
    }
  }

  return conflicts;
}

function levelSignature(level: Level): string {
  return [
    level.letters.join(''),
    level.mainWords.map((word) => word.word).sort().join('|'),
  ].join('::');
}

function sample<T>(items: T[], limit = 25): T[] {
  return items.slice(0, limit);
}

describe('Azerbaijani runtime level audit', () => {
  it('keeps all 1000 Azerbaijani levels playable and non-repetitive', async () => {
    const levels = await getStarterLevelsByLanguageAsync('az');

    const missingIds: number[] = [];
    const duplicateIds: number[] = [];
    const seenIds = new Set<number>();
    const badMainWords: Array<{ level: number; word: string; letters: string[] }> = [];
    const badBonusWords: Array<{ level: number; word: string; letters: string[] }> = [];
    const badChars: Array<{ level: number; word: string }> = [];
    const insideDuplicates: Array<{ level: number; words: string[] }> = [];
    const weakLevels: Array<{ level: number; wordCount: number; expectedMin: number; words: string[] }> = [];
    const gridConflicts: Array<{ level: number; conflicts: number }> = [];
    const duplicateSignatures: Array<{ first: number; second: number; signature: string }> = [];

    const signatureToLevel = new Map<string, number>();
    const wordUsage = new Map<string, number>();

    for (const level of levels) {
      if (seenIds.has(level.id)) duplicateIds.push(level.id);
      seenIds.add(level.id);

      const mainWords = level.mainWords.map((word) => word.word);
      const uniqueMainWords = new Set(mainWords);

      for (const word of mainWords) {
        wordUsage.set(word, (wordUsage.get(word) ?? 0) + 1);
      }

      if (uniqueMainWords.size !== mainWords.length) {
        insideDuplicates.push({ level: level.id, words: mainWords });
      }

      const expectedMin = minMainWordsForLevel(level.id);
      if (mainWords.length < expectedMin) {
        weakLevels.push({ level: level.id, wordCount: mainWords.length, expectedMin, words: mainWords });
      }

      for (const word of mainWords) {
        if (!AZ_WORD_RE.test(word)) badChars.push({ level: level.id, word });
        if (!canBuildWordByCounts(word, level.letters)) {
          badMainWords.push({ level: level.id, word, letters: level.letters });
        }
      }

      for (const word of level.bonusWords) {
        if (!AZ_WORD_RE.test(word)) badChars.push({ level: level.id, word });
        if (!canBuildWordByCounts(word, level.letters)) {
          badBonusWords.push({ level: level.id, word, letters: level.letters });
        }
      }

      const conflicts = gridConflictCount(level.mainWords);
      if (conflicts > 0) gridConflicts.push({ level: level.id, conflicts });

      const signature = levelSignature(level);
      const firstLevel = signatureToLevel.get(signature);
      if (firstLevel) {
        duplicateSignatures.push({ first: firstLevel, second: level.id, signature });
      } else {
        signatureToLevel.set(signature, level.id);
      }
    }

    for (let id = 1; id <= 1000; id += 1) {
      if (!seenIds.has(id)) missingIds.push(id);
    }

    const highRepetitionWords = [...wordUsage.entries()]
      .filter(([, count]) => count > 20)
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));

    const report = {
      totalLevels: levels.length,
      missingIds,
      duplicateIds,
      badMainWordsCount: badMainWords.length,
      badMainWords: sample(badMainWords),
      badBonusWordsCount: badBonusWords.length,
      badBonusWords: sample(badBonusWords),
      badCharsCount: badChars.length,
      badChars: sample(badChars),
      insideDuplicatesCount: insideDuplicates.length,
      insideDuplicates: sample(insideDuplicates),
      weakLevelsCount: weakLevels.length,
      weakLevels: sample(weakLevels),
      gridConflictsCount: gridConflicts.length,
      gridConflicts: sample(gridConflicts),
      duplicateSignaturesCount: duplicateSignatures.length,
      duplicateSignatures: sample(duplicateSignatures),
      highRepetitionWordsCount: highRepetitionWords.length,
      highRepetitionWords: sample(highRepetitionWords),
    };

    console.info('AZ_RUNTIME_AUDIT_REPORT=' + JSON.stringify(report, null, 2));

    expect(levels.length).toBe(1000);
    expect(missingIds).toEqual([]);
    expect(duplicateIds).toEqual([]);
    expect(badMainWords).toEqual([]);
    expect(badBonusWords).toEqual([]);
    expect(badChars).toEqual([]);
    expect(insideDuplicates).toEqual([]);
    expect(weakLevels).toEqual([]);
    expect(gridConflicts).toEqual([]);
    expect(duplicateSignatures).toEqual([]);
    expect(highRepetitionWords).toEqual([]);
  });
});
