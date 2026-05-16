import { ACTIVE_LANGUAGES, PLANNED_LANGUAGES, LanguageCode } from '../i18n/languages';
import { FULL_PACK_LEVEL_COUNT, isValidFullPackLevelNumber } from './difficultyProgression';
import { getContentPack } from './contentPacks/contentPackRegistry';

export type ContentPackCoverageRow = {
  language: LanguageCode;
  status: 'active' | 'planned';
  targetLevelCount: number;
  readyLevelCount: number;
  missingLevelCount: number;
  completionRate: number;
  missingLevelNumbers: number[];
};

export type ContentPackCoverageReport = {
  rows: ContentPackCoverageRow[];
  totalTargetLevels: number;
  totalReadyLevels: number;
  totalMissingLevels: number;
  totalCompletionRate: number;
};

function getStatus(language: LanguageCode): ContentPackCoverageRow['status'] {
  return ACTIVE_LANGUAGES.includes(language as never) ? 'active' : 'planned';
}

function getMissingLevelNumbers(readyNumbers: Set<number>, targetLevelCount: number): number[] {
  const missing: number[] = [];
  for (let levelNumber = 1; levelNumber <= targetLevelCount; levelNumber += 1) {
    if (!readyNumbers.has(levelNumber)) missing.push(levelNumber);
  }
  return missing;
}

export function createContentPackCoverageRow(language: LanguageCode): ContentPackCoverageRow {
  const pack = getContentPack(language);
  const targetLevelCount = pack?.targetLevelCount ?? FULL_PACK_LEVEL_COUNT;
  const readyNumbers = new Set(
    (pack?.entries ?? [])
      .map((entry) => entry.packLevelNumber)
      .filter((levelNumber) => isValidFullPackLevelNumber(levelNumber)),
  );
  const readyLevelCount = readyNumbers.size;
  const missingLevelNumbers = getMissingLevelNumbers(readyNumbers, targetLevelCount);
  const missingLevelCount = missingLevelNumbers.length;

  return {
    language,
    status: getStatus(language),
    targetLevelCount,
    readyLevelCount,
    missingLevelCount,
    completionRate: targetLevelCount === 0 ? 0 : readyLevelCount / targetLevelCount,
    missingLevelNumbers,
  };
}

export function createContentPackCoverageReport(): ContentPackCoverageReport {
  const languages: LanguageCode[] = [...ACTIVE_LANGUAGES, ...PLANNED_LANGUAGES];
  const rows = languages.map(createContentPackCoverageRow);
  const totalTargetLevels = rows.reduce((sum, row) => sum + row.targetLevelCount, 0);
  const totalReadyLevels = rows.reduce((sum, row) => sum + row.readyLevelCount, 0);
  const totalMissingLevels = rows.reduce((sum, row) => sum + row.missingLevelCount, 0);

  return {
    rows,
    totalTargetLevels,
    totalReadyLevels,
    totalMissingLevels,
    totalCompletionRate: totalTargetLevels === 0 ? 0 : totalReadyLevels / totalTargetLevels,
  };
}

export function formatContentPackCoverageReport(report: ContentPackCoverageReport): string {
  const lines = report.rows.map((row) => {
    const percent = Math.round(row.completionRate * 10000) / 100;
    return `${row.language} [${row.status}] ${row.readyLevelCount}/${row.targetLevelCount} (${percent}%) missing=${row.missingLevelCount}`;
  });

  const totalPercent = Math.round(report.totalCompletionRate * 10000) / 100;

  return [
    'LEXORA CONTENT PACK COVERAGE',
    `Total: ${report.totalReadyLevels}/${report.totalTargetLevels} (${totalPercent}%)`,
    `Missing: ${report.totalMissingLevels}`,
    ...lines,
  ].join('\n');
}
