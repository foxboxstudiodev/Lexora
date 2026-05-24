import { LanguageContentPack, WordQualityMetadata } from '../contentPackTypes';

function verifiedAzerbaijaniNouns(words: string[], note: string): WordQualityMetadata[] {
  return Array.from(new Set(words)).map((word) => ({
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
  'mənzil', 'mətbəx', 'hamam', 'balkon', 'qonaq otağı', 'dəhliz', 'pilləkən', 'qazan', 'tava', 'boşqab',
  'salfet', 'sabun', 'dəsmal', 'güzgü', 'radio', 'telefon', 'kompüter', 'televizor', 'soyuducu', 'sobа',
];

const natureWords = [
  'su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'yarpaq', 'çiçək',
  'torpaq', 'daş', 'qum', 'külək', 'yağış', 'qar', 'bulud', 'hava', 'ulduz', 'od',
  'göl', 'sahil', 'dərə', 'təpə', 'ot', 'bağ', 'meyvə', 'alma', 'armud', 'üzüm',
  'çöl', 'düzənlik', 'bulaq', 'şəlalə', 'göy', 'şimşək', 'ildırım', 'duman', 'buz', 'palçıq',
  'kök', 'budaq', 'toxum', 'gül', 'nar', 'limon', 'portağal', 'gilas', 'ərik', 'şaftalı',
];

const familyWords = [
  'ana', 'ata', 'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'nənə', 'baba',
  'ailə', 'dost', 'qonşu', 'müəllim', 'şagird', 'həkim', 'sürücü', 'satıcı', 'işçi', 'insan',
  'oğul', 'qız', 'körpə', 'dayı', 'xala', 'əmi', 'bibi', 'yoldaş', 'qonaq', 'usta',
  'tələbə', 'mühəndis', 'polis', 'əsgər', 'rəssam', 'müğənni', 'idmançı', 'hakim', 'vəkil', 'aşpaz',
  'bağban', 'dərzi', 'çoban', 'fermer', 'alim', 'şair', 'yazıçı', 'jurnalist', 'operator', 'müdir',
];

const foodWords = [
  'çörək', 'ət', 'süd', 'duz', 'bal', 'yağ', 'pendir', 'yumurta', 'düyü', 'şorba',
  'yemək', 'su', 'çay', 'qənd', 'alma', 'armud', 'üzüm', 'nar', 'limon', 'kartof',
  'soğan', 'pomidor', 'xiyar', 'balıq', 'toyuq', 'plov', 'lavaş', 'qab', 'stəkan', 'qaşıq',
  'dolma', 'kabab', 'dovğa', 'qatıq', 'mürəbbə', 'kompot', 'paxlava', 'şəkər', 'un', 'xəmir',
  'lobya', 'noxud', 'badımcan', 'bibər', 'kələm', 'yerkökü', 'qoz', 'fındıq', 'çiyələk', 'alça',
];

const cityWords = [
  'yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'avtobus',
  'qatar', 'liman', 'hava limanı', 'dükan', 'apteka', 'xəstəxana', 'ofis', 'iş', 'pul', 'bank',
  'ev', 'bina', 'körpü', 'meydan', 'muzey', 'teatr', 'kino', 'stadion', 'bağça', 'zavod',
  'dayanacaq', 'universitet', 'kitabxana', 'poçt', 'otel', 'restoran', 'kafe', 'market', 'qaraj', 'məscid',
  'qala', 'saray', 'prospekt', 'rayon', 'qəsəbə', 'məhəllə', 'dairə', 'xəritə', 'bilet', 'səfər',
];

const schoolWords = [
  'məktəb', 'sinif', 'dərs', 'kitab', 'dəftər', 'qələm', 'lövhə', 'parta', 'müəllim', 'şagird',
  'tələbə', 'imtahan', 'sual', 'cavab', 'tapşırıq', 'qiymət', 'fənn', 'tarix', 'riyaziyyat', 'dil',
  'ədəbiyyat', 'coğrafiya', 'kimya', 'fizika', 'biologiya', 'laboratoriya', 'idman', 'zəng', 'tətil', 'məktub',
];

const bodyWords = [
  'baş', 'göz', 'qulaq', 'burun', 'ağız', 'diş', 'dil', 'əl', 'ayaq', 'barmaq',
  'saç', 'üz', 'boyun', 'çiyin', 'qol', 'diz', 'ürək', 'qan', 'beyin', 'sümük',
  'dəri', 'sinə', 'bel', 'qarın', 'daban', 'ovuc', 'dırnaq', 'kirpik', 'qaş', 'yanaq',
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
    {
      packLevelNumber: 6,
      words: schoolWords,
      bonusWords: ['məktəb', 'sinif', 'dərs', 'kitab', 'dəftər', 'qələm', 'lövhə', 'müəllim', 'şagird', 'imtahan'],
      locationId: 'fr-paris-eiffel',
      seed: 'az-school-core-6',
      learning: { frequencyBand: 3, learnerStage: 'core' },
      wordQuality: verifiedAzerbaijaniNouns([...schoolWords, 'məktəb', 'sinif', 'dərs', 'kitab', 'dəftər', 'qələm', 'lövhə', 'müəllim', 'şagird', 'imtahan'], 'Azerbaijani school and learning nouns.'),
    },
    {
      packLevelNumber: 7,
      words: bodyWords,
      bonusWords: ['baş', 'göz', 'qulaq', 'burun', 'ağız', 'diş', 'dil', 'əl', 'ayaq', 'barmaq'],
      locationId: 'az-baku-old-city',
      seed: 'az-body-core-7',
      learning: { frequencyBand: 3, learnerStage: 'core' },
      wordQuality: verifiedAzerbaijaniNouns([...bodyWords, 'baş', 'göz', 'qulaq', 'burun', 'ağız', 'diş', 'dil', 'əl', 'ayaq', 'barmaq'], 'Azerbaijani body and health nouns.'),
    },
  ],
};
