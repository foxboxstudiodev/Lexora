import { describe, expect, it } from 'vitest';
import { getKnownTravelLocationIds, getTravelLocationById, getTravelLocationsByCountry, travelLocations } from './travelLocations';

describe('travel locations', () => {
  it('has unique location ids', () => {
    expect(getKnownTravelLocationIds().size).toBe(travelLocations.length);
  });

  it('contains production background prompts for every location', () => {
    for (const location of travelLocations) {
      expect(location.backgroundPrompt.length).toBeGreaterThan(40);
      expect(location.countryCode.length).toBe(2);
      expect(location.countryName.length).toBeGreaterThan(1);
      expect(location.locationName.length).toBeGreaterThan(1);
    }
  });

  it('can look up a location by id', () => {
    const location = getTravelLocationById('fr-paris-eiffel');
    expect(location.countryName).toBe('France');
    expect(location.locationName).toBe('Eiffel Tower');
  });

  it('throws for unknown locations', () => {
    expect(() => getTravelLocationById('unknown-place')).toThrow();
  });

  it('returns locations sorted by order for a country', () => {
    const egypt = getTravelLocationsByCountry('EG');
    expect(egypt.length).toBeGreaterThan(0);
    expect(egypt[0].id).toBe('eg-giza-pyramids');
  });
});
