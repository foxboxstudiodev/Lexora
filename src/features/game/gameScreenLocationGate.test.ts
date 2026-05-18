import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.join(process.cwd(), 'src/features/game/GameScreen.tsx'), 'utf-8');

describe('game screen travel location gate', () => {
  it('uses runtime travel location metadata when a level has locationId', () => {
    expect(source).toContain('getTravelLocationById');
    expect(source).toContain('level.locationId');
    expect(source).toContain('gameplayPlaceName');
    expect(source).toContain('data-location-id');
  });

  it('uses location kind classes for travel backgrounds', () => {
    expect(source).toContain('location-${travelLocation.kind}');
  });
});
