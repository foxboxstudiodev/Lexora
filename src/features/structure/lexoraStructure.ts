export const LEXORA_ACTIVE_LANGUAGE_COUNT = 14;
export const LEXORA_LEVELS_PER_LANGUAGE = 1000;
export const LEXORA_WORLD_BLOCK_COUNT = 20;
export const LEXORA_LEVELS_PER_WORLD_BLOCK = 50;

export type LexoraDifficultyLayer = 'easy' | 'medium' | 'hard' | 'very-hard';

export function getWorldBlockForLevel(level: number): number {
  return Math.ceil(level / LEXORA_LEVELS_PER_WORLD_BLOCK);
}

export function getLevelIndexWithinWorldBlock(level: number): number {
  return ((level - 1) % LEXORA_LEVELS_PER_WORLD_BLOCK) + 1;
}

export function getDifficultyLayerForLevel(level: number): LexoraDifficultyLayer {
  const index = getLevelIndexWithinWorldBlock(level);
  if (index <= 10) return 'easy';
  if (index <= 25) return 'medium';
  if (index <= 40) return 'hard';
  return 'very-hard';
}
