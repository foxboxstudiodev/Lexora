import { describe, expect, it } from 'vitest';
import { getDifficultyBandForLevel } from './difficultyProgression';
import { ExpansionLevel } from './expansionLevelTypes';

describe('expansion level schema', () => {
  it('supports travel metadata and difficulty requirements', () => {
    const band = getDifficultyBandForLevel(121);
    const level: ExpansionLevel = {
      id: 100121,
      packLevelNumber: 121,
      language: 'en',
      letters: ['T', 'R', 'A', 'V', 'E', 'L'],
      mainWords: [
        { word: 'TRAVEL', row: 0, col: 0, direction: 'across', order: 1 },
        { word: 'RAVE', row: 0, col: 1, direction: 'down', order: 2 },
      ],
      bonusWords: ['LATE'],
      difficultyBand: band.band,
      location: {
        countryCode: 'FR',
        countryName: 'France',
        locationName: 'Paris',
        chapterName: 'City Lights',
        backgroundPrompt: 'Original cartoon travel background inspired by Paris landmarks.',
        backgroundStyle: 'cartoon-landmark',
      },
      rewardCoins: 20,
      minRequiredIntersections: band.minIntersections,
    };

    expect(level.packLevelNumber).toBe(121);
    expect(level.difficultyBand).toBe('medium');
    expect(level.location.countryCode).toBe('FR');
    expect(level.mainWords[0].order).toBe(1);
  });
});
