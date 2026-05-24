export const AZERBAIJANI_WORD_PATTERN = /^[A-Za-zÇĞİÖŞÜƏIıçəğıöşüə-]+$/u;

export const APPROVED_AZERBAIJANI_WORDS = new Set([
  'at', 'ata', 'ana', 'nar',
  'ev', 'otaq', 'qapı', 'masa', 'stul', 'kitab', 'dəftər', 'qələm', 'pəncərə', 'divar',
  'döşəmə', 'tavan', 'yataq', 'yorğan', 'yastıq', 'açar', 'şkaf', 'lampa', 'qab', 'stəkan',
  'qaşıq', 'bıçaq', 'çəngəl', 'saat', 'çanta', 'paltar', 'ayaqqabı', 'köynək', 'palto', 'xalça',
  'mənzil', 'mətbəx', 'hamam', 'balkon', 'dəhliz', 'pilləkən', 'qazan', 'tava', 'boşqab',
  'salfet', 'sabun', 'dəsmal', 'güzgü', 'radio', 'telefon', 'kompüter', 'televizor', 'soyuducu', 'soba',
  'su', 'gün', 'ay', 'dağ', 'çay', 'dəniz', 'meşə', 'ağac', 'yarpaq', 'çiçək',
  'torpaq', 'daş', 'qum', 'külək', 'yağış', 'qar', 'bulud', 'hava', 'ulduz', 'od',
  'göl', 'sahil', 'dərə', 'təpə', 'ot', 'bağ', 'meyvə', 'alma', 'armud', 'üzüm',
  'çöl', 'düzənlik', 'bulaq', 'şəlalə', 'göy', 'şimşək', 'ildırım', 'duman', 'buz', 'palçıq',
  'kök', 'budaq', 'toxum', 'gül', 'limon', 'portağal', 'gilas', 'ərik', 'şaftalı',
  'uşaq', 'adam', 'qadın', 'kişi', 'qardaş', 'bacı', 'nənə', 'baba',
  'ailə', 'dost', 'qonşu', 'müəllim', 'şagird', 'həkim', 'sürücü', 'satıcı', 'işçi', 'insan',
  'oğul', 'qız', 'körpə', 'dayı', 'xala', 'əmi', 'bibi', 'yoldaş', 'qonaq', 'usta',
  'tələbə', 'mühəndis', 'polis', 'əsgər', 'rəssam', 'müğənni', 'idmançı', 'hakim', 'vəkil', 'aşpaz',
  'bağban', 'dərzi', 'çoban', 'fermer', 'alim', 'şair', 'yazıçı', 'jurnalist', 'operator', 'müdir',
  'çörək', 'ət', 'süd', 'duz', 'bal', 'yağ', 'pendir', 'yumurta', 'düyü', 'şorba',
  'yemək', 'qənd', 'kartof', 'soğan', 'pomidor', 'xiyar', 'balıq', 'toyuq', 'plov', 'lavaş',
  'dolma', 'kabab', 'dovğa', 'qatıq', 'mürəbbə', 'kompot', 'paxlava', 'şəkər', 'un', 'xəmir',
  'lobya', 'noxud', 'badımcan', 'bibər', 'kələm', 'yerkökü', 'qoz', 'fındıq', 'çiyələk', 'alça',
  'yol', 'məktəb', 'bazar', 'maşın', 'kənd', 'şəhər', 'küçə', 'park', 'metro', 'avtobus',
  'qatar', 'liman', 'dükan', 'apteka', 'xəstəxana', 'ofis', 'iş', 'pul', 'bank',
  'bina', 'körpü', 'meydan', 'muzey', 'teatr', 'kino', 'stadion', 'bağça', 'zavod',
  'dayanacaq', 'universitet', 'kitabxana', 'poçt', 'otel', 'restoran', 'kafe', 'market', 'qaraj', 'məscid',
  'qala', 'saray', 'prospekt', 'rayon', 'qəsəbə', 'məhəllə', 'dairə', 'xəritə', 'bilet', 'səfər',
  'sinif', 'dərs', 'lövhə', 'parta', 'imtahan', 'sual', 'cavab', 'tapşırıq', 'qiymət', 'fənn',
  'tarix', 'riyaziyyat', 'dil', 'ədəbiyyat', 'coğrafiya', 'kimya', 'fizika', 'biologiya', 'laboratoriya', 'zəng', 'tətil', 'məktub',
  'baş', 'göz', 'qulaq', 'burun', 'ağız', 'diş', 'əl', 'ayaq', 'barmaq',
  'saç', 'üz', 'boyun', 'çiyin', 'qol', 'diz', 'ürək', 'qan', 'beyin', 'sümük',
  'dəri', 'sinə', 'bel', 'qarın', 'daban', 'ovuc', 'dırnaq', 'kirpik', 'qaş', 'yanaq',
]);

export const REJECTED_AZERBAIJANI_WORDS = new Set([
  'qip',
  'paq',
  'şıq',
  'loyal',
  'veda',
  'sən',
  'oy',
  'ad',
  'al',
  'ip',
  'ən',
  'ta',
  'ar',
  'ra',
]);

export function normalizeAzerbaijaniWord(value: string): string {
  return value.trim().toLocaleLowerCase('az-AZ').replace(/\s+/g, ' ');
}

export function isBeginnerAzerbaijaniWord(value: string): boolean {
  const normalized = normalizeAzerbaijaniWord(value);
  return normalized.length >= 2
    && AZERBAIJANI_WORD_PATTERN.test(normalized)
    && APPROVED_AZERBAIJANI_WORDS.has(normalized)
    && !REJECTED_AZERBAIJANI_WORDS.has(normalized);
}

export function assertBeginnerAzerbaijaniWord(value: string): void {
  const normalized = normalizeAzerbaijaniWord(value);

  if (!AZERBAIJANI_WORD_PATTERN.test(normalized)) {
    throw new Error(`Azerbaijani word contains unsupported characters: ${value}`);
  }

  if (normalized.length < 2) {
    throw new Error(`Azerbaijani word must contain at least two characters: ${value}`);
  }

  if (!APPROVED_AZERBAIJANI_WORDS.has(normalized) || REJECTED_AZERBAIJANI_WORDS.has(normalized)) {
    throw new Error(`Rejected Azerbaijani word is not allowed: ${value}`);
  }
}
