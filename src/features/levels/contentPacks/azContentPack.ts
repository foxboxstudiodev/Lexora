import { LanguageContentPack, WordQualityMetadata } from '../contentPackTypes';

function verifiedAzerbaijaniNouns(words: string[], note: string): WordQualityMetadata[] {
  return words.map((word) => ({
    word,
    lexicalClass: 'noun',
    quality: 'verified-real-word',
    source: 'manual-azerbaijani-core-pack',
    note,
    learning: {
      frequencyBand: 1,
      learnerStage: 'starter',
    },
  }));
}

const homeWords = [
  'ev', 'otaq', 'qapı', 'masa', 'stul', 'kitab', 'dəftər', 'qələm', 'pəncərə', 'divar',
  'döşəmə', 'tavan', 'yataq', 'yorğan', 'yastıq', 'açar', 'şkaf', 'lampa', 'qab', 'stəkan',
  'qaşıq', 'bıçaq', 'çəngəl', 'saat', 'çanta', 'paltar', 'ayaqqabı', 'köynək', 'palto', 'xalça',
];

const natureWords = [
  'su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'yarpaq', 'çiçək',
  'torpaq', 'daş', 'qum', 'külək', 'yağış', 'qar', 'bulud', 'hava', 'ulduz', 'od',
  'göl', 'sahil', 'dərə', 'təpə', 'ot', 'bağ', 'meyvə', 'alma', 'armud', 'üzüm',
];

const familyWords = [
  'ana', 'ata', 'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'nənə', 'baba',
  'ailə', 'dost', 'qonşu', 'müəllim', 'şagird', 'həkim', 'sürücü', 'satıcı', 'işçi', 'insan',
  'oğul', 'qız', 'körpə', 'dayı', 'xala', 'əmi', 'bibi', 'yoldaş', 'qonaq', 'usta',
];

const foodWords = [
  'çörək', 'ət', 'süd', 'duz', 'bal', 'yağ', 'pendir', 'yumurta', 'düyü', 'şorba',
  'yemək', 'su', 'çay', 'qənd', 'alma', 'armud', 'üzüm', 'nar', 'limon', 'kartof',
  'soğan', 'pomidor', 'xiyar', 'balıq', 'toyuq', 'plov', 'lavaş', 'qab', 'stəkan', 'qaşıq',
];

const cityWords = [
  'yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'avtobus',
  'qatar', 'liman', 'hava limanı', 'dükan', 'apteka', 'xəstəxana', 'ofis', 'iş', 'pul', 'bank',
  'ev', 'bina', 'körpü', 'meydan', 'muzey', 'teatr', 'kino', 'stadion', 'bağça', 'zavod',
];

export const azContentPack: LanguageContentPack = {
  language: 'az',
  targetLevelCount: 300,
  entries: [
    {
      packLevelNumber: 1,
      words: homeWords,
      bonusWords: ['ev', 'otaq', 'qapı', 'masa', 'stul', 'kitab', 'açar', 'qab', 'saat', 'çanta'],
      locationId: 'az-baku-old-city',
      seed: 'az-home-core-1',
      learning: { frequencyBand: 1, learnerStage: 'starter' },
      wordQuality: verifiedAzerbaijaniNouns([...homeWords, 'ev', 'otaq', 'qapı', 'masa', 'stul', 'kitab', 'açar', 'qab', 'saat', 'çanta'], 'Beginner Azerbaijani home and object nouns.'),
    },
    {
      packLevelNumber: 2,
      words: natureWords,
      bonusWords: ['su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'çiçək', 'hava'],
      locationId: 'jp-kyoto-sakura',
      seed: 'az-nature-core-2',
      learning: { frequencyBand: 1, learnerStage: 'starter' },
      wordQuality: verifiedAzerbaijaniNouns([...natureWords, 'su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'çiçək', 'hava'], 'Beginner Azerbaijani nature nouns.'),
    },
    {
      packLevelNumber: 3,
      words: familyWords,
      bonusWords: ['ana', 'ata', 'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'ailə', 'dost'],
      locationId: 'fr-paris-eiffel',
      seed: 'az-family-core-3',
      learning: { frequencyBand: 2, learnerStage: 'early' },
      wordQuality: verifiedAzerbaijaniNouns([...familyWords, 'ana', 'ata', 'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'ailə', 'dost'], 'Beginner Azerbaijani family and person nouns.'),
    },
    {
      packLevelNumber: 4,
      words: foodWords,
      bonusWords: ['çörək', 'ət', 'süd', 'duz', 'bal', 'pendir', 'yumurta', 'alma', 'balıq', 'plov'],
      locationId: 'it-rome-colosseum',
      seed: 'az-food-core-4',
      learning: { frequencyBand: 2, learnerStage: 'early' },
      wordQuality: verifiedAzerbaijaniNouns([...foodWords, 'çörək', 'ət', 'süd', 'duz', 'bal', 'pendir', 'yumurta', 'alma', 'balıq', 'plov'], 'Beginner Azerbaijani food nouns.'),
    },
    {
      packLevelNumber: 5,
      words: cityWords,
      bonusWords: ['yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'bank'],
      locationId: 'eg-giza-pyramids',
      seed: 'az-city-core-5',
      learning: { frequencyBand: 2, learnerStage: 'core' },
      wordQuality: verifiedAzerbaijaniNouns([...cityWords, 'yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'bank'], 'Beginner Azerbaijani city and daily-life nouns.'),
    },
  ],
};
