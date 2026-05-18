import { describe, expect, it } from 'vitest';
import { achievements, getAchievementProgress, isAchievementUnlocked } from './achievements';

describe('achievement model', () => {
  const emptyStats = {
    wordsFound: 0,
    levelsCompleted: 0,
    bonusWordsFound: 0,
    noHintClears: 0,
  };

  it('defines stable achievement ids', () => {
    expect(achievements.map((achievement) => achievement.id)).toEqual([
      'first_word',
      'first_level',
      'bonus_hunter',
      'ten_words',
      'no_hint_clear',
    ]);
  });

  it('calculates progress from matching stats fields', () => {
    const stats = {
      wordsFound: 12,
      levelsCompleted: 3,
      bonusWordsFound: 6,
      noHintClears: 1,
    };

    expect(getAchievementProgress('first_word', stats)).toBe(12);
    expect(getAchievementProgress('ten_words', stats)).toBe(12);
    expect(getAchievementProgress('first_level', stats)).toBe(3);
    expect(getAchievementProgress('bonus_hunter', stats)).toBe(6);
    expect(getAchievementProgress('no_hint_clear', stats)).toBe(1);
  });

  it('keeps no-hint achievement locked when completed levels used hints', () => {
    const noHintAchievement = achievements.find((achievement) => achievement.id === 'no_hint_clear');
    expect(noHintAchievement).toBeDefined();

    const stats = {
      wordsFound: 50,
      levelsCompleted: 10,
      bonusWordsFound: 8,
      noHintClears: 0,
    };

    expect(isAchievementUnlocked(noHintAchievement!, stats)).toBe(false);
  });

  it('keeps achievements locked when target is not reached', () => {
    for (const achievement of achievements) {
      expect(isAchievementUnlocked(achievement, emptyStats)).toBe(false);
    }
  });

  it('unlocks achievements when target is reached', () => {
    const stats = {
      wordsFound: 10,
      levelsCompleted: 1,
      bonusWordsFound: 5,
      noHintClears: 1,
    };

    for (const achievement of achievements) {
      expect(isAchievementUnlocked(achievement, stats)).toBe(true);
    }
  });
});
