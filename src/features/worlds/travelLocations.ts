export type TravelLocationKind = 'landmark' | 'city' | 'nature' | 'culture';

export type TravelLocation = {
  id: string;
  countryCode: string;
  countryName: string;
  regionName: string;
  locationName: string;
  chapterName: string;
  kind: TravelLocationKind;
  order: number;
  backgroundPrompt: string;
};

export const travelLocations: TravelLocation[] = [
  {
    id: 'eg-giza-pyramids',
    countryCode: 'EG',
    countryName: 'Egypt',
    regionName: 'Giza',
    locationName: 'Pyramids of Giza',
    chapterName: 'Desert Wonders',
    kind: 'landmark',
    order: 1,
    backgroundPrompt: 'Original bright cartoon travel background inspired by the Pyramids of Giza, desert dunes, warm sunset, palm silhouettes, playful mobile game style.',
  },
  {
    id: 'fr-paris-eiffel',
    countryCode: 'FR',
    countryName: 'France',
    regionName: 'Paris',
    locationName: 'Eiffel Tower',
    chapterName: 'City of Lights',
    kind: 'landmark',
    order: 2,
    backgroundPrompt: 'Original cartoon travel background inspired by Paris and the Eiffel Tower, soft sky, riverside park, warm lights, polished casual puzzle game style.',
  },
  {
    id: 'jp-kyoto-sakura',
    countryCode: 'JP',
    countryName: 'Japan',
    regionName: 'Kyoto',
    locationName: 'Sakura Garden',
    chapterName: 'Cherry Blossom Path',
    kind: 'culture',
    order: 3,
    backgroundPrompt: 'Original cartoon travel background inspired by Kyoto gardens, sakura trees, pond reflections, soft pink atmosphere, premium mobile puzzle style.',
  },
  {
    id: 'az-baku-old-city',
    countryCode: 'AZ',
    countryName: 'Azerbaijan',
    regionName: 'Baku',
    locationName: 'Old City',
    chapterName: 'Caspian Stories',
    kind: 'city',
    order: 4,
    backgroundPrompt: 'Original cartoon travel background inspired by Baku Old City, stone walls, Caspian blue tones, warm evening light, clean mobile game composition.',
  },
  {
    id: 'it-rome-colosseum',
    countryCode: 'IT',
    countryName: 'Italy',
    regionName: 'Rome',
    locationName: 'Colosseum',
    chapterName: 'Ancient Roads',
    kind: 'landmark',
    order: 5,
    backgroundPrompt: 'Original cartoon travel background inspired by Rome and the Colosseum, golden stone, blue sky, small trees, charming puzzle game style.',
  },
  {
    id: 'br-rio-coast',
    countryCode: 'BR',
    countryName: 'Brazil',
    regionName: 'Rio de Janeiro',
    locationName: 'Rio Coast',
    chapterName: 'Sunny Coastline',
    kind: 'nature',
    order: 6,
    backgroundPrompt: 'Original cartoon travel background inspired by Rio coastline, green mountains, ocean, bright beach colors, cheerful mobile puzzle game style.',
  },
  {
    id: 'de-bavaria-castle',
    countryCode: 'DE',
    countryName: 'Germany',
    regionName: 'Bavaria',
    locationName: 'Mountain Castle',
    chapterName: 'Alpine Tales',
    kind: 'landmark',
    order: 7,
    backgroundPrompt: 'Original cartoon travel background inspired by Bavarian mountain castles, alpine forest, soft clouds, polished casual game style.',
  },
  {
    id: 'cn-guilin-river',
    countryCode: 'CN',
    countryName: 'China',
    regionName: 'Guilin',
    locationName: 'Karst River',
    chapterName: 'River Mountains',
    kind: 'nature',
    order: 8,
    backgroundPrompt: 'Original cartoon travel background inspired by Guilin karst mountains, winding river, misty green cliffs, elegant mobile puzzle style.',
  },
  {
    id: 'kr-seoul-palace',
    countryCode: 'KR',
    countryName: 'Korea',
    regionName: 'Seoul',
    locationName: 'Royal Palace',
    chapterName: 'Palace Gates',
    kind: 'culture',
    order: 9,
    backgroundPrompt: 'Original cartoon travel background inspired by Seoul royal palace gates, tiled roofs, city skyline hints, bright clean puzzle style.',
  },
  {
    id: 'in-jaipur-palace',
    countryCode: 'IN',
    countryName: 'India',
    regionName: 'Jaipur',
    locationName: 'Pink Palace',
    chapterName: 'Royal Colors',
    kind: 'culture',
    order: 10,
    backgroundPrompt: 'Original cartoon travel background inspired by Jaipur palace architecture, warm pink tones, decorative arches, vibrant mobile puzzle style.',
  },
];

const travelLocationMap = new Map(travelLocations.map((location) => [location.id, location]));

export function getTravelLocationById(id: string): TravelLocation {
  const location = travelLocationMap.get(id);
  if (!location) {
    throw new Error(`Unknown travel location: ${id}`);
  }
  return location;
}

export function getTravelLocationsByCountry(countryCode: string): TravelLocation[] {
  return travelLocations
    .filter((location) => location.countryCode === countryCode)
    .sort((a, b) => a.order - b.order);
}

export function getKnownTravelLocationIds(): Set<string> {
  return new Set(travelLocations.map((location) => location.id));
}
