import { Level } from './types';

export type LevelNodeStatus = 'completed' | 'current' | 'unlocked' | 'locked';

export type LevelMapWorldSection = {
  themeId: string;
  levels: Level[];
};

export function groupLevelsByWorld(levels: Level[]): LevelMapWorldSection[] {
  const sections: LevelMapWorldSection[] = [];

  for (const level of levels) {
    const lastSection = sections[sections.length - 1];
    if (lastSection?.themeId === level.themeId) {
      lastSection.levels.push(level);
    } else {
      sections.push({ themeId: level.themeId, levels: [level] });
    }
  }

  return sections;
}

export function getWorldProgress(sectionLevels: Level[], completed: number[]): string {
  const completedCount = sectionLevels.filter((level) => completed.includes(level.id)).length;
  return `${completedCount}/${sectionLevels.length}`;
}

export function getLevelNodeStatus(levelId: number, currentLevel: number, completed: number[]): LevelNodeStatus {
  const isCompleted = completed.includes(levelId);
  const isCurrent = levelId === currentLevel;
  const isUnlocked = isCompleted || isCurrent || levelId <= currentLevel;

  if (isCompleted) return 'completed';
  if (isCurrent) return 'current';
  if (isUnlocked) return 'unlocked';
  return 'locked';
}

export function isLevelNodePlayable(status: LevelNodeStatus): boolean {
  return status !== 'locked';
}
