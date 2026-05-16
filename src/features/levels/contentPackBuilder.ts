import { createExpansionLevel } from './expansionLevelFactory';
import { ExpansionLevel } from './expansionLevelTypes';
import { LanguageContentPack } from './contentPackTypes';
import { isContentPackValid, validateContentPack } from './contentPackValidator';

export type ContentPackBuildResult = {
  levels: ExpansionLevel[];
  rejectedWords: string[];
  issues: string[];
  sourceErrors: string[];
};

function makeSeed(language: string, packLevelNumber: number, seed?: string): string {
  return seed ?? `${language}-${packLevelNumber}`;
}

export function buildExpansionLevelsFromContentPack(pack: LanguageContentPack): ContentPackBuildResult {
  const validation = validateContentPack(pack);
  const sourceErrors = validation.issues
    .filter((issue) => issue.severity === 'error')
    .map((issue) => `${issue.code}: ${issue.message}`);

  if (!isContentPackValid(validation)) {
    return {
      levels: [],
      rejectedWords: [],
      issues: validation.issues.map((issue) => `${issue.code}: ${issue.message}`),
      sourceErrors,
    };
  }

  const levels: ExpansionLevel[] = [];
  const rejectedWords: string[] = [];
  const issues: string[] = validation.issues.map((issue) => `${issue.code}: ${issue.message}`);

  for (const entry of pack.entries) {
    const result = createExpansionLevel({
      id: pack.language === 'en' ? entry.packLevelNumber : Number(`${entry.packLevelNumber}`),
      packLevelNumber: entry.packLevelNumber,
      language: pack.language,
      words: entry.words,
      bonusWords: entry.bonusWords,
      locationId: entry.locationId,
      seed: makeSeed(pack.language, entry.packLevelNumber, entry.seed),
    });

    if (result.level) levels.push(result.level);
    rejectedWords.push(...result.rejectedWords);
    issues.push(...result.issues);
  }

  return {
    levels: levels.sort((a, b) => a.packLevelNumber - b.packLevelNumber),
    rejectedWords,
    issues,
    sourceErrors,
  };
}
