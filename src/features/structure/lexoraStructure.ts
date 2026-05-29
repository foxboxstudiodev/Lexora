export const LEXORA_ACTIVE_LANGUAGE_COUNT = 14;

export const LEXORA_LEVELS_PER_LANGUAGE = 1000;
export const LEXORA_WORLD_BLOCK_COUNT = 20;
export const LEXORA_LEVELS_PER_WORLD_BLOCK = 50;

export const LEXORA_TOTAL_RUNTIME_LEVELS =
  LEXORA_ACTIVE_LANGUAGE_COUNT * LEXORA_LEVELS_PER_LANGUAGE;

export type LexoraDifficultyLayer = 'easy' | 'medium' | 'hard' | 'very-hard';

export type LexoraWorldBlockRange = {
  blockIndex: number;
  fromLevel: number;
  toLevel: number;
};

export function assertValidLexoraLevelNumber(levelNumber: number): void {
  if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > LEXORA_LEVELS_PER_LANGUAGE) {
    throw new Error(
      `Invalid Lexora level number: ${levelNumber}. Expected 1-${LEXORA_LEVELS_PER_LANGUAGE}.`,
    );
  }
}

export function isValidLexoraLevelNumber(levelNumber: number): boolean {
  return Number.isInteger(levelNumber) && levelNumber >= 1 && levelNumber <= LEXORA_LEVELS_PER_LANGUAGE;
}

export function getWorldBlockIndex(levelNumber: number): number {
  assertValidLexoraLevelNumber(levelNumber);
  return Math.floor((levelNumber - 1) / LEXORA_LEVELS_PER_WORLD_BLOCK) + 1;
}

export function getLevelInWorldBlock(levelNumber: number): number {
  assertValidLexoraLevelNumber(levelNumber);
  return ((levelNumber - 1) % LEXORA_LEVELS_PER_WORLD_BLOCK) + 1;
}

export function getDifficultyLayerForLevel(levelNumber: number): LexoraDifficultyLayer {
  const levelInBlock = getLevelInWorldBlock(levelNumber);

  if (levelInBlock <= 10) return 'easy';
  if (levelInBlock <= 25) return 'medium';
  if (levelInBlock <= 40) return 'hard';
  return 'very-hard';
}

export function getWorldBlockRange(blockIndex: number): LexoraWorldBlockRange {
  if (!Number.isInteger(blockIndex) || blockIndex < 1 || blockIndex > LEXORA_WORLD_BLOCK_COUNT) {
    throw new Error(
      `Invalid Lexora world block index: ${blockIndex}. Expected 1-${LEXORA_WORLD_BLOCK_COUNT}.`,
    );
  }

  const fromLevel = (blockIndex - 1) * LEXORA_LEVELS_PER_WORLD_BLOCK + 1;
  const toLevel = blockIndex * LEXORA_LEVELS_PER_WORLD_BLOCK;

  return { blockIndex, fromLevel, toLevel };
}

export function getAllWorldBlockRanges(): LexoraWorldBlockRange[] {
  return Array.from({ length: LEXORA_WORLD_BLOCK_COUNT }, (_, index) => getWorldBlockRange(index + 1));
}
