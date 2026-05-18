import { Level } from '../levels/types';
import { travelLocations, TravelLocation } from './travelLocations';

export type ExplorationLocationState = 'completed' | 'current' | 'locked';

export type ExplorationLocationNode = TravelLocation & {
  state: ExplorationLocationState;
  completedLevelCount: number;
  totalLevelCount: number;
};

export type ExplorationCountryNode = {
  countryCode: string;
  countryName: string;
  completedLevelCount: number;
  totalLevelCount: number;
  locations: ExplorationLocationNode[];
};

export type ExplorationProgress = {
  completedLocationIds: string[];
  currentLocationId: string;
  completedLevelsByLocation: Record<string, number>;
  totalLevelsByLocation: Record<string, number>;
};

function uniqueSortedCountryCodes(locations: TravelLocation[]): string[] {
  return Array.from(new Set(locations.map((location) => location.countryCode))).sort((a, b) => {
    const left = locations.find((location) => location.countryCode === a)?.order ?? 0;
    const right = locations.find((location) => location.countryCode === b)?.order ?? 0;
    return left - right;
  });
}

function getLocationState(location: TravelLocation, progress: ExplorationProgress): ExplorationLocationState {
  if (progress.completedLocationIds.includes(location.id)) return 'completed';
  if (progress.currentLocationId === location.id) return 'current';
  return 'locked';
}

export function createDefaultExplorationProgress(): ExplorationProgress {
  const firstLocation = [...travelLocations].sort((a, b) => a.order - b.order)[0];

  return {
    completedLocationIds: [],
    currentLocationId: firstLocation.id,
    completedLevelsByLocation: {},
    totalLevelsByLocation: Object.fromEntries(travelLocations.map((location) => [location.id, 30])),
  };
}

function getLevelLocationId(level: Level): string {
  return level.locationId ?? travelLocations[(level.id - 1) % travelLocations.length].id;
}

export function buildExplorationProgressFromLevels(levels: Level[], completedLevelIds: number[], currentLevelId: number): ExplorationProgress {
  const completedSet = new Set(completedLevelIds);
  const totalLevelsByLocation: Record<string, number> = {};
  const completedLevelsByLocation: Record<string, number> = {};

  for (const level of levels) {
    const locationId = getLevelLocationId(level);
    totalLevelsByLocation[locationId] = (totalLevelsByLocation[locationId] ?? 0) + 1;
    if (completedSet.has(level.id)) {
      completedLevelsByLocation[locationId] = (completedLevelsByLocation[locationId] ?? 0) + 1;
    }
  }

  const completedLocationIds = Object.entries(totalLevelsByLocation)
    .filter(([locationId, total]) => (completedLevelsByLocation[locationId] ?? 0) >= total)
    .map(([locationId]) => locationId);

  const currentLevel = levels.find((level) => level.id === currentLevelId) ?? levels.find((level) => !completedSet.has(level.id)) ?? levels[0];
  const fallback = createDefaultExplorationProgress();

  return {
    completedLocationIds,
    currentLocationId: currentLevel ? getLevelLocationId(currentLevel) : fallback.currentLocationId,
    completedLevelsByLocation,
    totalLevelsByLocation: { ...fallback.totalLevelsByLocation, ...totalLevelsByLocation },
  };
}

export function buildExplorationMap(progress: ExplorationProgress): ExplorationCountryNode[] {
  const countryCodes = uniqueSortedCountryCodes(travelLocations);

  return countryCodes.map((countryCode) => {
    const countryLocations = travelLocations
      .filter((location) => location.countryCode === countryCode)
      .sort((a, b) => a.order - b.order);

    const locations = countryLocations.map<ExplorationLocationNode>((location) => {
      const completedLevelCount = progress.completedLevelsByLocation[location.id] ?? 0;
      const totalLevelCount = progress.totalLevelsByLocation[location.id] ?? 30;

      return {
        ...location,
        state: getLocationState(location, progress),
        completedLevelCount,
        totalLevelCount,
      };
    });

    return {
      countryCode,
      countryName: countryLocations[0]?.countryName ?? countryCode,
      completedLevelCount: locations.reduce((sum, location) => sum + location.completedLevelCount, 0),
      totalLevelCount: locations.reduce((sum, location) => sum + location.totalLevelCount, 0),
      locations,
    };
  });
}

export function getNextTravelLocationId(currentLocationId: string): string | null {
  const ordered = [...travelLocations].sort((a, b) => a.order - b.order);
  const currentIndex = ordered.findIndex((location) => location.id === currentLocationId);

  if (currentIndex === -1) return null;
  return ordered[currentIndex + 1]?.id ?? null;
}
