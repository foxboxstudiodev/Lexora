import { getAllLevels } from './levels';
import { validateLevelPacksByLanguage } from './levelPackValidator';
import { getBlockingLevelErrors, getExpansionLevelWarnings } from './levelValidator';
import { Level } from './types';
import { getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';

export type LevelProgressionIssue = {
  language: string;
  levelId: number;
  code: 'progression.wheel_units' | 'progression.main_words' | 'progression.adjacent_repeat';
  expected?: number;
  actual?: number;
  message: string;
};

export type LevelQualityReport = {
  totalLevels: number;
  blockingErrorCount: number;
  expansionWarningCount: number;
  packIssueCount: number;
  progressionIssueCount: number;
  levelsByLanguage: Record<string, number>;
  blockingErrors: ReturnType<typeof getBlockingLevelErrors>;
  expansionWarnings: ReturnType<typeof getExpansionLevelWarnings>;
  progressionIssues: LevelProgressionIssue[];
  packReports: ReturnType<typeof validateLevelPacksByLanguage>;
};

function countLevelsByLanguage(levels: Level[]): Record<string, number> {
  return levels.reduce<Record<string, number>>((acc, level) => {
    acc[level.language] = (acc[level.language] ?? 0) + 1;
    return acc;
  }, {});
}

function gameplaySignature(level: Level): string {
  const letters = [...level.letters].sort((a, b) => a.localeCompare(b)).join('|');
  const words = level.mainWords.map((word) => word.word).sort((a, b) => a.localeCompare(b)).join('|');
  return `${letters}::${words}`;
}

function getProgressionIssues(levels: Level[]): LevelProgressionIssue[] {
  const issues: LevelProgressionIssue[] = [];
  const byLanguage = new Map<string, Level[]>();

  for (const level of levels) {
    byLanguage.set(level.language, [...(byLanguage.get(level.language) ?? []), level]);

    const expectedWheelUnits = getWheelUnitCountForLevel(level.id);
    if (level.letters.length !== expectedWheelUnits) {
      issues.push({
        language: level.language,
        levelId: level.id,
        code: 'progression.wheel_units',
        expected: expectedWheelUnits,
        actual: level.letters.length,
        message: `${level.language} level ${level.id} has ${level.letters.length} wheel units instead of ${expectedWheelUnits}.`,
      });
    }

    const expectedMainWords = getTargetMainWordCountForLevel(level.id);
    if (level.mainWords.length !== expectedMainWords) {
      issues.push({
        language: level.language,
        levelId: level.id,
        code: 'progression.main_words',
        expected: expectedMainWords,
        actual: level.mainWords.length,
        message: `${level.language} level ${level.id} has ${level.mainWords.length} main words instead of ${expectedMainWords}.`,
      });
    }
  }

  for (const [language, languageLevels] of byLanguage.entries()) {
    if (language === 'ru') continue;
    const sorted = [...languageLevels].sort((a, b) => a.id - b.id);
    for (let index = 1; index < sorted.length; index += 1) {
      if (gameplaySignature(sorted[index]) === gameplaySignature(sorted[index - 1])) {
        issues.push({
          language,
          levelId: sorted[index].id,
          code: 'progression.adjacent_repeat',
          message: `${language} levels ${sorted[index - 1].id}-${sorted[index].id} repeat the same gameplay signature.`,
        });
      }
    }
  }

  return issues;
}

export function createLevelQualityReport(levels: Level[] = getAllLevels()): LevelQualityReport {
  const blockingErrors = levels.flatMap(getBlockingLevelErrors);
  const expansionWarnings = levels.flatMap(getExpansionLevelWarnings);
  const progressionIssues = getProgressionIssues(levels);
  const packReports = validateLevelPacksByLanguage(levels);
  const packIssueCount = packReports.reduce((sum, report) => sum + report.issues.length, 0);

  return {
    totalLevels: levels.length,
    blockingErrorCount: blockingErrors.length,
    expansionWarningCount: expansionWarnings.length,
    packIssueCount,
    progressionIssueCount: progressionIssues.length,
    levelsByLanguage: countLevelsByLanguage(levels),
    blockingErrors,
    expansionWarnings,
    progressionIssues,
    packReports,
  };
}

export function hasBlockingQualityProblems(report: LevelQualityReport): boolean {
  return report.blockingErrorCount > 0 || report.progressionIssueCount > 0;
}

export function formatLevelQualityReport(report: LevelQualityReport): string {
  const languageLines = Object.entries(report.levelsByLanguage)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([language, count]) => `- ${language}: ${count}`);

  const progressionLines = report.progressionIssues.slice(0, 80).map((issue) => `- ${issue.message}`);
  const packIssueLines = report.packReports.flatMap((pack) =>
    pack.issues.map((issue) => `- ${pack.language} ${issue.code}: ${issue.message}`),
  );

  return [
    'LEXORA LEVEL QUALITY REPORT',
    `Total levels: ${report.totalLevels}`,
    `Blocking errors: ${report.blockingErrorCount}`,
    `Expansion warnings: ${report.expansionWarningCount}`,
    `Progression issues: ${report.progressionIssueCount}`,
    `Pack issues: ${report.packIssueCount}`,
    'Levels by language:',
    ...languageLines,
    progressionLines.length > 0 ? 'Progression issue detail:' : 'Progression issue detail: none',
    ...progressionLines,
    packIssueLines.length > 0 ? 'Pack issues detail:' : 'Pack issues detail: none',
    ...packIssueLines,
  ].join('\n');
}