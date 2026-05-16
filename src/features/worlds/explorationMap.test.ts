import { describe, expect, it } from 'vitest';
import { buildExplorationMap, createDefaultExplorationProgress, getNextTravelLocationId } from './explorationMap';

describe('exploration map', () => {
  it('creates default progress from the first travel location', () => {
    const progress = createDefaultExplorationProgress();
    expect(progress.currentLocationId).toBe('eg-giza-pyramids');
    expect(progress.completedLocationIds).toEqual([]);
  });

  it('builds country nodes with location states', () => {
    const map = buildExplorationMap(createDefaultExplorationProgress());
    const egypt = map.find((country) => country.countryCode === 'EG');
    const france = map.find((country) => country.countryCode === 'FR');

    expect(egypt?.locations[0].state).toBe('current');
    expect(france?.locations[0].state).toBe('locked');
  });

  it('marks completed locations', () => {
    const map = buildExplorationMap({
      completedLocationIds: ['eg-giza-pyramids'],
      currentLocationId: 'fr-paris-eiffel',
      completedLevelsByLocation: { 'eg-giza-pyramids': 30 },
      totalLevelsByLocation: { 'eg-giza-pyramids': 30, 'fr-paris-eiffel': 30 },
    });

    const egypt = map.find((country) => country.countryCode === 'EG');
    const france = map.find((country) => country.countryCode === 'FR');

    expect(egypt?.locations[0].state).toBe('completed');
    expect(egypt?.completedLevelCount).toBe(30);
    expect(france?.locations[0].state).toBe('current');
  });

  it('returns the next travel location id', () => {
    expect(getNextTravelLocationId('eg-giza-pyramids')).toBe('fr-paris-eiffel');
  });

  it('returns null for unknown or final locations', () => {
    expect(getNextTravelLocationId('unknown')).toBeNull();
  });
});
