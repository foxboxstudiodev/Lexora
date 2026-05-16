import { LanguageCode } from '../i18n/languages';
import { countWordUnits } from '../i18n/wordUnits';

export type HintType = 'reveal_letter' | 'reveal_word_start' | 'reveal_word';

export type HintPrice = {
  type: HintType;
  price: number;
};

export const hintPrices: HintPrice[] = [
  { type: 'reveal_letter', price: 25 },
  { type: 'reveal_word_start', price: 45 },
  { type: 'reveal_word', price: 120 },
];

export function getHintPrice(type: HintType): number {
  return hintPrices.find((item) => item.type === type)?.price ?? 0;
}

export function canAfford(coins: number, price: number): boolean {
  return coins >= price;
}

export function spendCoins(coins: number, price: number): number {
  if (!canAfford(coins, price)) return coins;
  return coins - price;
}

export function addCoins(coins: number, reward: number): number {
  return Math.max(0, coins + reward);
}

export function bonusWordReward(wordLength: number): number {
  return Math.max(1, Math.min(8, wordLength));
}

export function bonusWordRewardByLanguage(word: string, language: LanguageCode): number {
  return bonusWordReward(countWordUnits(word, language));
}
