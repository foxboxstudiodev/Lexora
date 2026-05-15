export type WorldDefinition = {
  id: string;
  name: string;
  order: number;
  description: string;
};

export const worlds: WorldDefinition[] = [
  { id: 'dawn-garden', name: 'Dawn Garden', order: 1, description: 'Fresh, calm opening levels with bright garden tones.' },
  { id: 'sunny-coast', name: 'Sunny Coast', order: 2, description: 'Warm coastal levels with light and energetic colors.' },
  { id: 'crystal-lake', name: 'Crystal Lake', order: 3, description: 'Clear blue levels with a polished water-like atmosphere.' },
  { id: 'mystic-forest', name: 'Mystic Forest', order: 4, description: 'Green forest levels with deeper, softer contrast.' },
  { id: 'ancient-city', name: 'Ancient City', order: 5, description: 'Golden stone levels with an old-city feel.' },
  { id: 'sakura-valley', name: 'Sakura Valley', order: 6, description: 'Pink and violet levels with a soft valley mood.' },
  { id: 'golden-desert', name: 'Golden Desert', order: 7, description: 'Bright desert levels with strong warm highlights.' },
  { id: 'sky-temple', name: 'Sky Temple', order: 8, description: 'Airy blue levels with a clean sky progression.' },
  { id: 'northern-lights', name: 'Northern Lights', order: 9, description: 'Dark teal and violet levels with aurora effects.' },
  { id: 'aurora-peak', name: 'Aurora Peak', order: 10, description: 'Late-game mountain levels with cold glowing gradients.' },
];

const worldMap = new Map(worlds.map((world) => [world.id, world]));

export function getWorldById(id: string): WorldDefinition {
  return worldMap.get(id) ?? {
    id,
    name: id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    order: 999,
    description: 'Custom world.',
  };
}

export function getKnownWorldIds(): Set<string> {
  return new Set(worlds.map((world) => world.id));
}
