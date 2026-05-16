import { getAllLevels } from './levels';
import { validateLevelPacksByLanguage } from './levelPackValidator';
import { getBlockingLevelErrors, getExpansionLevelWarnings } from './levelValidator';
import { Level } from './types';

export type LevelQualityReport = {
  totalLevels: number;
  blockingErrorCount: number;
  expansionWarningCount: number;
  packIssueCount: number;
  levelsByLanguage: Record<string, number>;
  blockingErrors: ReturnType<typeof getBlockingLevelErrors>;
  expansionWarnings: ReturnType<typeof getExpansionLevelWarnings>;
  packReports: ReturnType<typeof validateLevelPacksByLanguage>;
};

function countLevelsByLanguage(levels: Level[]): Record<string, number> {
  return levels.reduce<Record<string, number>>((acc, level) => {
    acc[level.language] = (acc[level.language] ?? 0) + 1;
    return acc;
  }, {});
}

export function createLevelQualityReport(levels: Level[] = getAllLevels()): LevelQualityReport {
  const blockingErrors = levels.flatMap(getBlockingLevelErrors);
  const expansionWarnings = levels.flatMap(getExpansionLevelWarnings);
  const packReports = validateLevelPacksByLanguage(levels);
  const packIssueCount = packReports.reduce((sum, report) => sum + report.issues.length, 0);

  return {
    totalLevels: levels.length,
    blockingErrorCount: blockingErrors.length,
    expansionWarningCount: expansionWarnings.length,
    packIssueCount,
    levelsByLanguage: countLevelsByLanguage(levels),
    blockingErrors,
    expansionWarnings,
    packReports,
  };
}

export function hasBlockingQualityProblems(report: LevelQualityReport): boolean {
  return report.blockingErrorCount > 0;
}

export function formatLevelQualityReport(report: LevelQualityReport): string {
  const languageLines = Object.entries(report.levelsByLanguage)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([language, count]) => `- ${language}: ${count}`);

  const packIssueLines = report.packReports.flatMap((pack) =>
    pack.issues.map((issue) => `- ${pack.language} ${issue.code}: ${issue.message}`),
  );

  return [
    'LEXORA LEVEL QUALITY REPORT',
    `Total levels: ${report.totalLevels}`,
    `Blocking errors: ${report.blockingErrorCount}`,
    `Expansion warnings: ${report.expansionWarningCount}`,
    `Pack issues: ${report.packIssueCount}`,
    'Levels by language:',
    ...languageLines,
    packIssueLines.length > 0 ? 'Pack issues detail:' : 'Pack issues detail: none',
    ...packIssueLines,
  ].join('\n');
}
