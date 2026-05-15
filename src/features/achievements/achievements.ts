export type AchievementId =
  | 'first_word'
  | 'first_level'
  | 'bonus_hunter'
  | 'ten_words'
  | 'no_hint_clear';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  target: number;
};

export type AchievementStats = {
  wordsFound: number;
  levelsCompleted: number;
  bonusWordsFound: number;
  noHintClears: number;
};

export const achievements: Achievement[] = [
  { id: 'first_word', title: 'First Spark', description: 'Find your first word.', target: 1 },
  { id: 'first_level', title: 'Path Opened', description: 'Complete your first level.', target: 1 },
  { id: 'bonus_hunter', title: 'Bonus Hunter', description: 'Find 5 bonus words.', target: 5 },
  { id: 'ten_words', title: 'Word Flow', description: 'Find 10 words.', target: 10 },
  { id: 'no_hint_clear', title: 'Pure Mind', description: 'Complete a level without hints.', target: 1 },
];

export function getAchievementProgress(id: AchievementId, stats: AchievementStats): number {
  switch (id) {
    case 'first_word':
    case 'ten_words':
      return stats.wordsFound;
    case 'first_level':
      return stats.levelsCompleted;
    case 'bonus_hunter':
      return stats.bonusWordsFound;
    case 'no_hint_clear':
      return stats.noHintClears;
  }
}

export function isAchievementUnlocked(achievement: Achievement, stats: AchievementStats): boolean {
  return getAchievementProgress(achievement.id, stats) >= achievement.target;
}
