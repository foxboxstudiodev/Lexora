import { LanguageCode } from '../i18n/translations';
import { getStarterLevels } from './levelPacks';
import { validateLevelPacksByLanguage } from './levelPackValidator';
import { getPlayableRuntimeLevels } from './playableLanguageGuard';
import { Level } from './types';
import { getBlockingLevelErrors, getExpansionLevelWarnings, LevelValidationError } from './levelValidator';

let cachedValidatedLevels: Level[] | null = null;
let cachedPlayableLevels: Level[] | null = null;

function formatLevelIssues(title: string, issues: LevelValidationError[]): string {
  return `${title}:\n${issues.map((item) => `${item.levelId} ${item.code}: ${item.message}`).join('\n')}`;
}

function formatPackIssues(levels: Level[]): string {
  const packReports = validateLevelPacksByLanguage(levels);
  const messages = packReports.flatMap((report) =>
    report.issues.map((issue) =>
      `${report.language} ${issue.code}: ${issue.message} Levels: ${issue.affectedLevelIds.slice(0, 25).join(', ')}${issue.affectedLevelIds.length > 25 ? '...' : ''}`,
    ),
  );

  return messages.length > 0 ? `Lexora language pack quality warnings:\n${messages.join('\n')}` : '';
}

function logDevelopmentWarnings(levels: Level[]): void {
  const expansionWarnings = levels.flatMap(getExpansionLevelWarnings);
  const packWarningMessage = formatPackIssues(levels);

  if (expansionWarnings.length > 0) {
    console.warn(formatLevelIssues('Lexora expansion quality warnings', expansionWarnings.slice(0, 100)));
  }

  if (packWarningMessage) {
    console.warn(packWarningMessage);
  }
}

function getLevelKey(level: Level): string {
  return `${level.language}:${level.id}`;
}

function getValidatedLevels(): Level[] {
  if (cachedValidatedLevels) return cachedValidatedLevels;

  const levels = getStarterLevels();

  if (import.meta.env.DEV) {
    logDevelopmentWarnings(levels);
  }

  cachedValidatedLevels = levels;
  return cachedValidatedLevels;
}

function getPlayableLevels(): Level[] {
  if (!cachedPlayableLevels) {
    const levels = getValidatedLevels();
    const blockingErrors = levels.flatMap((level) => getBlockingLevelErrors(level).map((error) => ({ level, error })));
    const blockedLevelKeys = new Set(blockingErrors.map(({ level }) => getLevelKey(level)));

    if (blockingErrors.length > 0) {
      console.error(formatLevelIssues('Lexora blocked invalid playable levels', blockingErrors.slice(0, 100).map(({ error }) => error)));
    }

    cachedPlayableLevels = getPlayableRuntimeLevels(levels).filter((level) => !blockedLevelKeys.has(getLevelKey(level)));
  }

  return cachedPlayableLevels;
}

export function getLevelsByLanguage(language: LanguageCode): Level[] {
  return getPlayableLevels().filter((level) => level.language === language).sort((a, b) => a.id - b.id);
}

export function getAllLevels(): Level[] {
  return [...getValidatedLevels()];
}

export function getAllPlayableLevels(): Level[] {
  return [...getPlayableLevels()];
}
