import { describe, expect, it } from 'vitest';
import {
  detectJapaneseCollisions,
  hasJapaneseBlockingCollision,
} from '../src/features/i18n/japaneseCollision';

describe('Japanese collision release gate', () => {
  it('detects same reading collisions safely', () => {
    const report = detectJapaneseCollisions(['ねこ', '猫']);

    expect(report.collisions.some((collision) => collision.kind === 'same-reading-different-surface')).toBe(true);
    expect(report.hasBlockingCollision).toBe(false);
  });

  it('detects blocking duplicate collisions', () => {
    const report = detectJapaneseCollisions(['山', '山']);

    expect(report.hasBlockingCollision).toBe(true);
    expect(report.collisions.some((collision) => collision.kind === 'duplicate-surface')).toBe(true);
  });

  it('detects unknown token collisions', () => {
    const report = detectJapaneseCollisions(['unknown']);

    expect(report.collisions.some((collision) => collision.kind === 'unknown-token')).toBe(true);
  });

  it('supports blocking collision checks', () => {
    expect(hasJapaneseBlockingCollision(['山', '山'])).toBe(true);
    expect(hasJapaneseBlockingCollision(['ねこ', '猫'])).toBe(false);
  });
});
