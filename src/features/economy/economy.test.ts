import { describe, expect, it } from 'vitest';
import { addCoins, bonusWordReward, bonusWordRewardByLanguage, canAfford, getHintPrice, spendCoins } from './economy';

describe('economy engine', () => {
  it('returns configured hint prices', () => {
    expect(getHintPrice('reveal_letter')).toBe(25);
    expect(getHintPrice('reveal_word_start')).toBe(45);
    expect(getHintPrice('reveal_word')).toBe(120);
  });

  it('checks affordability', () => {
    expect(canAfford(100, 25)).toBe(true);
    expect(canAfford(10, 25)).toBe(false);
  });

  it('spends coins only when affordable', () => {
    expect(spendCoins(100, 25)).toBe(75);
    expect(spendCoins(10, 25)).toBe(10);
  });

  it('adds coins safely', () => {
    expect(addCoins(10, 15)).toBe(25);
    expect(addCoins(0, -5)).toBe(0);
  });

  it('caps bonus word rewards', () => {
    expect(bonusWordReward(2)).toBe(2);
    expect(bonusWordReward(20)).toBe(8);
  });

  it('calculates bonus rewards by language-aware units', () => {
    expect(bonusWordRewardByLanguage('STONE', 'en')).toBe(5);
    expect(bonusWordRewardByLanguage('山水', 'zh')).toBe(2);
    expect(bonusWordRewardByLanguage('का', 'hi')).toBe(1);
    expect(bonusWordRewardByLanguage('하늘', 'ko')).toBe(2);
  });
});
