import { describe, expect, it } from 'vitest';
import { getLevelNodeStatus, getWorldProgress, groupLevelsByWorld, isLevelNodePlayable } from './levelMapModel';
import { Level } from './types';

function makeLevel(id: number, themeId = 'dawn-garden'): Level {
  return {
    id,
    language: 'en',
    letters: ['S', 'T', 'O', 'N', 'E'],
    mainWords: [
      { word: 'STONE', row: 0, col: 0, direction: 'across' },
      { word: 'TONE', row: 0, col: 1, direction: 'down' },
    ],
    bonusWords: [],
    difficulty: 'easy',
    themeId,
    rewardCoins: 10,
  };
}

describe('level map model', () => {
  it('groups consecutive levels by world theme', () => {
    const sections = groupLevelsByWorld([
      makeLevel(1, 'dawn-garden'),
      makeLevel(2, 'dawn-garden'),
      makeLevel(3, 'desert-ruins'),
    ]);

    expect(sections).toHaveLength(2);
    expect(sections[0].themeId).toBe('dawn-garden');
    expect(sections[0].levels.map((level) => level.id)).toEqual([1, 2]);
    expect(sections[1].themeId).toBe('desert-ruins');
  });

  it('calculates world progress', () => {
    expect(getWorldProgress([makeLevel(1), makeLevel(2), makeLevel(3)], [1, 3])).toBe('2/3');
  });

  it('calculates level node statuses', () => {
    expect(getLevelNodeStatus(1, 3, [1])).toBe('completed');
    expect(getLevelNodeStatus(3, 3, [1])).toBe('current');
    expect(getLevelNodeStatus(2, 3, [1])).toBe('unlocked');
    expect(getLevelNodeStatus(4, 3, [1])).toBe('locked');
  });

  it('only locks locked nodes', () => {
    expect(isLevelNodePlayable('completed')).toBe(true);
    expect(isLevelNodePlayable('current')).toBe(true);
    expect(isLevelNodePlayable('unlocked')).toBe(true);
    expect(isLevelNodePlayable('locked')).toBe(false);
  });
});
