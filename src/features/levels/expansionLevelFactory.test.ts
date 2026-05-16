import { describe, expect, it } from 'vitest';
import { createExpansionLevel } from './expansionLevelFactory';

describe('expansion level factory', () => {
  it('creates an expansion level from words, difficulty and travel location', () => {
    const result = createExpansionLevel({
      id: 100001,
      packLevelNumber: 1,
      language: 'en',
      words: ['STONE', 'TONE', 'ONE'],
      bonusWords: ['NOTE'],
      locationId: 'eg-giza-pyramids',
      fillerLetters: ['A', 'R', 'L'],
      seed: 'en-1',
    });

    expect(result.level).not.toBeNull();
    expect(result.level?.packLevelNumber).toBe(1);
    expect(result.level?.difficultyBand).toBe('easy');
    expect(result.level?.location.countryName).toBe('Egypt');
    expect(result.level?.letters.length).toBeGreaterThanOrEqual(5);
    expect(result.level?.mainWords.length).toBeGreaterThanOrEqual(2);
  });

  it('uses language word profile filler letters when custom filler is omitted', () => {
    const result = createExpansionLevel({
      id: 100004,
      packLevelNumber: 1,
      language: 'az',
      words: ['ANA', 'NAR'],
      locationId: 'az-baku-old-city',
      seed: 'az-profile-fallback',
    });

    expect(result.level).not.toBeNull();
    expect(result.level?.letters.length).toBeGreaterThanOrEqual(5);
  });

  it('uses the unit-wheel path for generated letters', () => {
    const result = createExpansionLevel({
      id: 100005,
      packLevelNumber: 1,
      language: 'en',
      words: ['TRAVEL', 'LATE', 'RAVE'],
      locationId: 'fr-paris-eiffel',
      seed: 'unit-wheel-path',
    });

    expect(result.level).not.toBeNull();
    expect(result.level?.letters.length).toBeGreaterThanOrEqual(5);
    expect(result.level?.letters.join('')).not.toBe('TRAVEL');
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

  it('reports rejected words from the crossword generator', () => {
    const result = createExpansionLevel({
      id: 100002,
      packLevelNumber: 1,
      language: 'en',
      words: ['STONE', 'PUP'],
      locationId: 'eg-giza-pyramids',
      fillerLetters: ['A', 'R', 'L'],
      seed: 'en-2',
    });

    expect(result.rejectedWords).toContain('PUP');
  });

  it('adds quality issues when the level does not satisfy the difficulty band', () => {
    const result = createExpansionLevel({
      id: 100003,
      packLevelNumber: 261,
      language: 'en',
      words: ['STONE', 'TONE', 'ONE'],
      locationId: 'fr-paris-eiffel',
      fillerLetters: ['A', 'R', 'L', 'S'],
      seed: 'advanced-short',
    });

    expect(result.level?.difficultyBand).toBe('advanced');
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
