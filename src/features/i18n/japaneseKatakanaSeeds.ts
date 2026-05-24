import { LanguageLearningMetadata, WordQualityMetadata } from '../levels/contentPackTypes';

export type JapaneseKatakanaSeed = {
  katakana: string;
  hiraganaReading: string;
  meaningHint: string;
  quality: WordQualityMetadata;
};

const KATAKANA_LEARNING: LanguageLearningMetadata = {
  jlptLevel: 'n5',
  scriptExposure: 'katakana',
  frequencyBand: 2,
  learnerStage: 'early',
};

function katakanaSeed(katakana: string, hiraganaReading: string, meaningHint: string): JapaneseKatakanaSeed {
  return {
    katakana,
    hiraganaReading,
    meaningHint,
    quality: {
      word: katakana,
      lexicalClass: 'noun',
      quality: 'verified-real-word',
      source: 'manual-japanese-katakana-onboarding-pack',
      note: `Beginner katakana loanword. Hiragana reading: ${hiraganaReading}. Meaning hint: ${meaningHint}.`,
      learning: KATAKANA_LEARNING,
    },
  };
}

export const japaneseKatakanaSeeds: JapaneseKatakanaSeed[] = [
  katakanaSeed('パン', 'ぱん', 'bread'),
  katakanaSeed('バナナ', 'ばなな', 'banana'),
  katakanaSeed('コーヒー', 'こーひー', 'coffee'),
  katakanaSeed('ミルク', 'みるく', 'milk'),
  katakanaSeed('チーズ', 'ちーず', 'cheese'),
  katakanaSeed('カメラ', 'かめら', 'camera'),
  katakanaSeed('ホテル', 'ほてる', 'hotel'),
  katakanaSeed('レストラン', 'れすとらん', 'restaurant'),
  katakanaSeed('バス', 'ばす', 'bus'),
  katakanaSeed('タクシー', 'たくしー', 'taxi'),
  katakanaSeed('テレビ', 'てれび', 'television'),
  katakanaSeed('ラジオ', 'らじお', 'radio'),
  katakanaSeed('カード', 'かーど', 'card'),
  katakanaSeed('ノート', 'のーと', 'notebook'),
  katakanaSeed('ペン', 'ぺん', 'pen'),
  katakanaSeed('テーブル', 'てーぶる', 'table'),
  katakanaSeed('ドア', 'どあ', 'door'),
  katakanaSeed('クラス', 'くらす', 'class'),
  katakanaSeed('テスト', 'てすと', 'test'),
  katakanaSeed('ゲーム', 'げーむ', 'game'),
];

export function getJapaneseKatakanaWordQuality(): WordQualityMetadata[] {
  return japaneseKatakanaSeeds.map((seed) => seed.quality);
}
