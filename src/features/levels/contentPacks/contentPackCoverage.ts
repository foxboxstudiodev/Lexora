import { ALL_LANGUAGES, LanguageCode } from '../../i18n/languages';
import { FULL_PACK_LEVEL_COUNT } from '../difficultyProgression';
import { getContentPack } from './contentPackRegistry';

export type ContentPackCoverageStatus = 'complete' | 'partial' | 'missing';

export type ContentPackCoverageRow = {
  language: LanguageCode;
  targetLevelCount: number;
  readyLevelCount: number;
  missingLevelCount: number;
  completionRate: number;
  status: ContentPackCoverageStatus;
};

export type ContentPackCoverageReport = {
  totalTargetLevels: number;
  totalReadyLevels: number;
  totalMissingLevels: number;
  overallCompletionRate: number;
  rows: ContentPackCoverageRow[];
};

function getStatus(readyLevelCount: number, targetLevelCount: number): ContentPackCoverageStatus {
  if (readyLevelCount === 0) return 'missing';
  if (readyLevelCount >= targetLevelCount) return 'complete';
  return 'partial';
}

export function createContentPackCoverageReport(languages: LanguageCode[] = [...ALL_LANGUAGES]): ContentPackCoverageReport {
  const rows = languages.map((language): ContentPackCoverageRow => {
    const pack = getContentPack(language);
    const targetLevelCount = pack?.targetLevelCount ?? FULL_PACK_LEVEL_COUNT;
    const readyLevelCount = pack?.entries.length ?? 0;
    const missingLevelCount = Math.max(0, targetLevelCount - readyLevelCount);

    return {
      language,
      targetLevelCount,
      readyLevelCount,
      missingLevelCount,
      completionRate: targetLevelCount === 0 ? 0 : readyLevelCount / targetLevelCount,
      status: getStatus(readyLevelCount, targetLevelCount),
    };
  });

  const totalTargetLevels = rows.reduce((sum, row) => sum + row.targetLevelCount, 0);
  const totalReadyLevels = rows.reduce((sum, row) => sum + row.readyLevelCount, 0);
  const totalMissingLevels = rows.reduce((sum, row) => sum + row.missingLevelCount, 0);

  return {
    totalTargetLevels,
    totalReadyLevels,
    totalMissingLevels,
    overallCompletionRate: totalTargetLevels === 0 ? 0 : totalReadyLevels / totalTargetLevels,
    rows,
  };
}

export function formatCoveragePercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatContentPackCoverageReport(report: ContentPackCoverageReport): string {
  const lines = report.rows.map((row) =>
    `${row.language}: ${row.readyLevelCount}/${row.targetLevelCount} (${formatCoveragePercent(row.completionRate)}) ${row.status}`,
  );

  return [
    'LEXORA CONTENT PACK COVERAGE',
    `Total ready: ${report.totalReadyLevels}/${report.totalTargetLevels}`,
    `Missing: ${report.totalMissingLevels}`,
    `Overall: ${formatCoveragePercent(report.overallCompletionRate)}`,
    ...lines,
  ].join('\n');
}
