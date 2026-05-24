import { describe, expect, it } from 'vitest';
import {
  createJapaneseUserProficiencyMemory,
  recommendJapaneseAdaptiveSequence,
  updateJapaneseProficiencyMemory,
} from '../src/features/i18n/japaneseAdaptiveLearning';

describe('Japanese adaptive learning release gate', () => {
  it('creates stable Japanese proficiency memory', () => {
    const memory = createJapaneseUserProficiencyMemory();

    expect(memory.level).toBe('starter');
    expect(memory.correctStreak).toBe(0);
  });

  it('updates Japanese proficiency progression safely', () => {
    let memory = createJapaneseUserProficiencyMemory();

    for (let index = 0; index < 8; index += 1) {
      memory = updateJapaneseProficiencyMemory(memory, `word-${index}`, 'good', 1000 + index);
    }

    expect(memory.level).not.toBe('starter');
    expect(memory.correctStreak).toBeGreaterThan(0);
  });

  it('tracks weak Japanese vocabulary safely', () => {
    const memory = updateJapaneseProficiencyMemory(
      createJapaneseUserProficiencyMemory(),
      'ねこ',
      'again',
      1000,
    );

    expect(memory.weakWords).toContain('ねこ');
  });

  it('builds adaptive Japanese recommendations', () => {
    const memory = createJapaneseUserProficiencyMemory();
    const recommendation = recommendJapaneseAdaptiveSequence(
      memory,
      ['ねこ', '山', 'ゲーム'],
      1000,
    );

    expect(recommendation.introduceNext.length).toBeGreaterThan(0);
    expect(recommendation.difficulty).toBe('starter');
  });
});
