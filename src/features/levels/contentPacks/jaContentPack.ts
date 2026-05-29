import { LEXORA_LEVELS_PER_LANGUAGE } from '../../structure/lexoraStructure';
import { LanguageContentPack, WordQualityMetadata } from '../contentPackTypes';

const BASE_LEARNING = {
  jlptLevel: 'n5' as const,
  scriptExposure: 'hiragana' as const,
  frequencyBand: 1 as const,
  learnerStage: 'starter' as const,
};

function verifiedNouns(words: string[], note: string): WordQualityMetadata[] {
  return words.map((word) => ({
    word,
    lexicalClass: 'noun',
    quality: 'verified-real-word',
    source: 'manual-japanese-core-pack',
    note,
    learning: BASE_LEARNING,
  }));
}

const entry1Words = [
  'ねこ', 'こねこ', 'こえ', 'こめ', 'あめ', 'あさ', 'さけ', 'さめ', 'かめ', 'かね',
  'かさ', 'さかな', 'なか', 'なまえ', 'まめ', 'まち', 'かみ', 'みち', 'みせ', 'せき',
  'きみ', 'きせつ', 'つき', 'きつね', 'ねつ', 'つめ', 'めし', 'いぬ', 'いえ', 'いし',
];

const entry2Words = [
  'やま', 'かわ', 'うみ', 'そら', 'くも', 'あめ', 'かぜ', 'ゆき', 'はな', 'ほし',
  'つき', 'いし', 'みず', 'もり', 'まち', 'みち', 'いえ', 'にわ', 'とり', 'いぬ',
  'ねこ', 'さかな', 'むし', 'はし', 'しま', 'くに', 'なみ', 'たに', 'はる', 'なつ',
];

const entry3Words = [
  'ひと', 'こども', 'おとな', 'おとこ', 'おんな', 'なまえ', 'こころ', 'からだ', 'みみ', 'くち',
  'はな', 'あし', 'かお', 'こえ', 'うた', 'ことば', 'てがみ', 'きもち', 'いのち', 'ゆめ',
  'しごと', 'あそび', 'まなび', 'ともだち', 'かぞく', 'はは', 'ちち', 'あに', 'あね', 'いもうと',
];

const entry4Words = [
  'ごはん', 'みそ', 'みそしる', 'おちゃ', 'みず', 'さかな', 'にく', 'やさい', 'くだもの', 'りんご',
  'みかん', 'ばなな', 'たまご', 'こめ', 'ぱん', 'しお', 'さとう', 'ちゃわん', 'さら', 'はし',
  'なべ', 'きっさ', 'あさごはん', 'ひるごはん', 'ばんごはん', 'おかし', 'あじ', 'すし', 'そば', 'うどん',
];

const entry5Words = [
  'あか', 'あお', 'しろ', 'くろ', 'みどり', 'きいろ', 'いろ', 'まる', 'しかく', 'せん',
  'てん', 'かたち', 'ひかり', 'かげ', 'おと', 'こえ', 'え', 'しゃしん', 'ほん', 'かみ',
  'つくえ', 'いす', 'へや', 'まど', 'とけい', 'かぎ', 'くつ', 'ふく', 'かばん', 'ぼうし',
];

export const jaContentPack: LanguageContentPack = {
  language: 'ja',
  targetLevelCount: LEXORA_LEVELS_PER_LANGUAGE,
  entries: [
    {
      packLevelNumber: 1,
      words: entry1Words,
      bonusWords: ['こえ', 'こめ', 'あめ', 'かさ', 'かめ', 'まめ', 'みち', 'みせ', 'つき', 'いぬ'],
      locationId: 'jp-kyoto-sakura',
      seed: 'ja-core-kana-1',
      learning: BASE_LEARNING,
      wordQuality: verifiedNouns([...entry1Words, 'こえ', 'こめ', 'あめ', 'かさ', 'かめ', 'まめ', 'みち', 'みせ', 'つき', 'いぬ'], 'Core hiragana nouns for first-session Japanese play.'),
    },
    {
      packLevelNumber: 2,
      words: entry2Words,
      bonusWords: ['やま', 'かわ', 'うみ', 'そら', 'くも', 'はな', 'ほし', 'もり', 'にわ', 'とり'],
      locationId: 'fr-paris-eiffel',
      seed: 'ja-nature-basic-2',
      learning: BASE_LEARNING,
      wordQuality: verifiedNouns([...entry2Words, 'やま', 'かわ', 'うみ', 'そら', 'くも', 'はな', 'ほし', 'もり', 'にわ', 'とり'], 'Beginner nature and place nouns in hiragana.'),
    },
    {
      packLevelNumber: 3,
      words: entry3Words,
      bonusWords: ['ひと', 'こども', 'おとな', 'こころ', 'からだ', 'かお', 'うた', 'ゆめ', 'かぞく', 'はは'],
      locationId: 'eg-giza-pyramids',
      seed: 'ja-people-basic-3',
      learning: {
        ...BASE_LEARNING,
        frequencyBand: 2,
        learnerStage: 'early',
      },
      wordQuality: verifiedNouns([...entry3Words, 'ひと', 'こども', 'おとな', 'こころ', 'からだ', 'かお', 'うた', 'ゆめ', 'かぞく', 'はは'], 'Beginner person, family, and body nouns in hiragana.'),
    },
    {
      packLevelNumber: 4,
      words: entry4Words,
      bonusWords: ['ごはん', 'おちゃ', 'みず', 'さかな', 'にく', 'やさい', 'りんご', 'たまご', 'すし', 'そば'],
      locationId: 'az-baku-old-city',
      seed: 'ja-food-basic-4',
      learning: {
        ...BASE_LEARNING,
        frequencyBand: 2,
        learnerStage: 'early',
      },
      wordQuality: verifiedNouns([...entry4Words, 'ごはん', 'おちゃ', 'みず', 'さかな', 'にく', 'やさい', 'りんご', 'たまご', 'すし', 'そば'], 'Beginner food and kitchen nouns in hiragana.'),
    },
    {
      packLevelNumber: 5,
      words: entry5Words,
      bonusWords: ['あか', 'あお', 'しろ', 'くろ', 'いろ', 'まる', 'ほん', 'かみ', 'いす', 'ふく'],
      locationId: 'it-rome-colosseum',
      seed: 'ja-objects-basic-5',
      learning: {
        ...BASE_LEARNING,
        frequencyBand: 2,
        learnerStage: 'core',
      },
      wordQuality: verifiedNouns([...entry5Words, 'あか', 'あお', 'しろ', 'くろ', 'いろ', 'まる', 'ほん', 'かみ', 'いす', 'ふく'], 'Beginner object, color-name, and shape nouns in hiragana.'),
    },
  ],
};
