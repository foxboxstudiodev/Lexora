import { describe, expect, it } from 'vitest';
import { getKnownWorldIds, getWorldById, worlds } from './worlds';

describe('world registry', () => {
  it('keeps unique ids', () => {
    const ids = worlds.map((world) => world.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps unique order values', () => {
    const orders = worlds.map((world) => world.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('resolves registered worlds', () => {
    for (const world of worlds) {
      expect(getWorldById(world.id).name).toBe(world.name);
    }
  });

  it('returns all known ids', () => {
    expect(getKnownWorldIds().size).toBe(worlds.length);
  });
});
