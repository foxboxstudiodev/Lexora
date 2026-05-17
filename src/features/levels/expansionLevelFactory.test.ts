import { describe, expect, it } from 'vitest';
import { getWheelUnitCountForLevel } from './difficultyProgression';
import { createExpansionLevel } from './expansionLevelFactory';

const sourceWords = ['STONE', 'TONE', 'ONE', 'NOTE', 'TOE', 'TEN', 'NET', 'SET', 'SON'];

describe('expansion level factory', () => {
  it('creates a level with the exact wheel size for level 1', () => {
    const result = createExpansionLevel({
      id: 100001,
      packLevelNumber: 1,
      language: 'en',
      words: sourceWords,
      bonusWords: ['NOTE', 'TOE'],
      locationId: 'eg-giza-pyramids',
      fillerLetters: ['A', 'R', 'L'],
      seed: 'en-1',
    });

    expect(result.level).not.toBeNull();
    expect(result.level?.packLevelNumber).toBe(1);
    expect(result.level?.difficultyBand).toBe('easy');
    expect(result.level?.location.countryName).toBe('Egypt');
    expect(result.level?.letters).toHaveLength(getWheelUnitCountForLevel(1));
    expect(result.level?.mainWords.length).toBeGreaterThanOrEqual(2);
  });

  it('restarts exact wheel size at every twenty-level block', () => {
    for (const levelNumber of [1, 21, 41, 281]) {
      const result = createExpansionLevel({
        id: 200000 + levelNumber,
        packLevelNumber: levelNumber,
        language: 'en',
        words: sourceWords,
        locationId: 'eg-giza-pyramids',
        seed: `block-start-${levelNumber}`,
      });

      expect(result.level).not.toBeNull();
      expect(result.level?.letters).toHaveLength(4);
    }
  });

  it('creates exact ten-letter wheel levels at every block peak when source words allow it', () => {
    for (const levelNumber of [20, 40, 60, 300]) {
      const result = createExpansionLevel({
        id: 300000 + levelNumber,
        packLevelNumber: levelNumber,
        language: 'en',
        words: ['STONE', 'TONE', 'ONE', 'NOTE', 'TOE', 'TEN', 'NET', 'SET', 'SON', 'ROSE'],
        bonusWords: ['ORE', 'REST'],
        locationId: 'fr-paris-eiffel',
        fillerLetters: ['A', 'B', 'C', 'D', 'F', 'G'],
        seed: `block-peak-${levelNumber}`,
      });

      expect(result.level).not.toBeNull();
      expect(result.level?.letters).toHaveLength(10);
    }
  });

  it('filters incompatible bonus words instead of rejecting the whole level', () => {
    const result = createExpansionLevel({
      id: 100004,
      packLevelNumber: 1,
      language: 'en',
      words: ['STONE', 'TONE', 'ONE'],
      bonusWords: ['ZZZ', 'NOTE'],
      locationId: 'eg-giza-pyramids',
      seed: 'bonus-filter',
    });

    expect(result.level).not.toBeNull();
    expect(result.level?.bonusWords).not.toContain('ZZZ');
  });

  it('filters banned Russian fragments from main and bonus words', () => {
    const result = createExpansionLevel({
      id: 100006,
      packLevelNumber: 1,
      language: 'ru',
      words: ['ДОМ', 'ДАР', 'САД', 'ВОД', 'РАД'],
      bonusWords: ['ВОД', 'АД'],
      locationId: 'eg-giza-pyramids',
      fillerLetters: ['А', 'Р', 'С', 'М'],
      seed: 'ru-banned-filter',
    });

    const mainWords = result.level?.mainWords.map((word) => word.word) ?? [];
    expect(result.level).not.toBeNull();
    expect(mainWords).not.toContain('ВОД');
    expect(mainWords).not.toContain('РАД');
    expect(result.level?.bonusWords).not.toContain('ВОД');
    expect(result.level?.bonusWords).not.toContain('АД');
    expect(result.rejectedWords).toEqual(expect.arrayContaining(['ВОД', 'РАД', 'АД']));
  });

  it('uses language word profile filler letters when custom filler is omitted', () => {
    const result = createExpansionLevel({
      id: 100005,
      packLevelNumber: 1,
      language: 'az',
      words: ['ANA', 'NAR'],
      locationId: 'az-baku-old-city',
      seed: 'az-profile-fallback',
    });

    expect(result.level).not.toBeNull();
    expect(result.level?.letters).toHaveLength(getWheelUnitCountForLevel(1));
  });

  it('rejects invalid pack level numbers', () => {
    const result = createExpansionLevel({
      id: 1,
      packLevelNumber: 301,
      language: 'en',
      words: ['STONE'],
      locationId: 'eg-giza-pyramids',
      fillerLetters: ['A'],
      seed: 'bad',
    });

    expect(result.level).toBeNull();
    expect(result.issues[0]).toContain('between 1 and 300');
  });

  it('rejects impossible source sets that cannot create any valid crossword pair', () => {
    const result = createExpansionLevel({
      id: 100002,
      packLevelNumber: 1,
      language: 'en',
      words: ['STONE', 'PUP'],
      locationId: 'eg-giza-pyramids',
      fillerLetters: ['A', 'R', 'L'],
      seed: 'en-2',
    });

    expect(result.level).toBeNull();
    expect(result.rejectedWords).toContain('PUP');
  });
});
