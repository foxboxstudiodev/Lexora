import { ACTIVE_LANGUAGES, LanguageCode, TARGET_LEVELS_PER_LANGUAGE } from '../i18n/languages';
import { travelLocations } from '../worlds/travelLocations';
import { getExpansionDifficultyName, getTargetMainWordCountForLevel, getWheelUnitCountForLevel } from './difficultyProgression';
import { Level, PlacedWord } from './types';

const POOLS: Record<Exclude<LanguageCode, 'ru' | 'az' | 'ar'>, string[]> = {
  en: ['A','R','T','S','E','L','N','O','I','D','M','P','C','H','G','B'],
  es: ['A','R','T','E','S','O','L','N','I','D','M','P','C','U','V','B'],
  tr: ['A','R','T','E','L','İ','N','O','U','M','S','Y','K','D','B','G'],
  de: ['A','R','T','E','N','S','L','I','O','D','M','G','H','B','U','K'],
  pt: ['A','R','T','E','S','O','L','N','I','D','M','P','C','U','V','B'],
  it: ['A','R','T','E','I','O','S','L','N','D','M','P','C','U','V','B'],
  fr: ['A','R','T','E','S','O','L','N','I','D','M','P','C','U','V','B'],
  hi: ['क','म','न','र','ल','स','त','प','द','ग','ब','ह','य','व','ज','च'],
  zh: ['山','水','人','火','木','天','月','日','风','云','海','花','城','门','星','光'],
  ja: ['あ','か','さ','た','な','ま','ら','や','は','わ','み','り','こ','そ','に','ひ'],
  ko: ['가','나','다','라','마','사','하','바','소','리','미','도','구','서','우','진'],
};

const AZ_FALLBACK_LEVELS: Array<{ letters: string[]; mainWords: PlacedWord[]; bonusWords: string[] }> = [
  { letters: ['A', 'T', 'A', 'N'], mainWords: [{ word: 'AT', row: 0, col: 0, direction: 'down' }, { word: 'ATA', row: 0, col: 0, direction: 'across' }], bonusWords: ['ANA'] },
  { letters: ['E', 'V', 'Ə', 'L'], mainWords: [{ word: 'EV', row: 0, col: 0, direction: 'across' }, { word: 'ƏL', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['Ə', 'T', 'Ə', 'L'], mainWords: [{ word: 'ƏT', row: 0, col: 0, direction: 'across' }, { word: 'ƏL', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['D', 'A', 'Ş', 'İ', 'L'], mainWords: [{ word: 'DAŞ', row: 0, col: 0, direction: 'across' }, { word: 'DİL', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['B', 'A', 'L', 'Ğ'], mainWords: [{ word: 'BAL', row: 0, col: 0, direction: 'across' }, { word: 'BAĞ', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['N', 'A', 'R', 'A'], mainWords: [{ word: 'NAR', row: 0, col: 0, direction: 'across' }, { word: 'ANA', row: 0, col: 1, direction: 'down' }], bonusWords: [] },
  { letters: ['A', 'Y', 'A', 'Q'], mainWords: [{ word: 'AY', row: 0, col: 0, direction: 'down' }, { word: 'AYAQ', row: 0, col: 0, direction: 'across' }], bonusWords: [] },
  { letters: ['G', 'Ü', 'N', 'Ö', 'L'], mainWords: [{ word: 'GÜN', row: 0, col: 0, direction: 'across' }, { word: 'GÖL', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['Ç', 'A', 'Y', 'Ö', 'L'], mainWords: [{ word: 'ÇAY', row: 0, col: 0, direction: 'across' }, { word: 'ÇÖL', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['S', 'A', 'A', 'T', 'U'], mainWords: [{ word: 'SAAT', row: 0, col: 0, direction: 'across' }, { word: 'SU', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
];

const AR_FALLBACK_LEVELS: Array<{ letters: string[]; mainWords: PlacedWord[]; bonusWords: string[] }> = [
  { letters: ['ب', 'ا', 'ب', 'ت'], mainWords: [{ word: 'باب', row: 0, col: 0, direction: 'across' }, { word: 'بت', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
  { letters: ['د', 'ا', 'ر', 'ن'], mainWords: [{ word: 'دار', row: 0, col: 0, direction: 'across' }, { word: 'نار', row: 0, col: 1, direction: 'down' }], bonusWords: [] },
  { letters: ['ك', 'ت', 'ب', 'ا'], mainWords: [{ word: 'كتاب', row: 0, col: 0, direction: 'across' }, { word: 'كتب', row: 0, col: 0, direction: 'down' }], bonusWords: [] },
];

const spin = <T,>(items: T[], n: number): T[] => {
  const i = ((n % items.length) + items.length) % items.length;
  return [...items.slice(i), ...items.slice(0, i)];
};

function difficulty(id: number): Level['difficulty'] {
  const band = getExpansionDifficultyName(id);
  if (band === 'easy' || band === 'light-medium') return 'easy';
  if (band === 'medium') return 'normal';
  return 'hard';
}

function wheel(language: Exclude<LanguageCode, 'ru' | 'az' | 'ar'>, id: number): string[] {
  return spin(POOLS[language], (id - 1) * 3 + Math.floor((id - 1) / 20)).slice(0, getWheelUnitCountForLevel(id));
}

function makeWord(units: string[], id: number, index: number): string {
  const max = Math.min(units.length, 6);
  const len = 2 + ((id + index) % Math.max(1, max - 1));
  const start = (id + index * 2) % units.length;
  return Array.from({ length: len }, (_, offset) => units[(start + offset) % units.length]).join('');
}

function mainWords(units: string[], id: number): PlacedWord[] {
  const total = getTargetMainWordCountForLevel(id);
  const used = new Set<string>();
  let row = 0;
  let col = 0;
  return Array.from({ length: total }, (_, index) => {
    let word = makeWord(units, id + used.size, index);
    let guard = 0;
    while (used.has(word) && guard < 40) {
      guard += 1;
      word = makeWord(spin(units, guard), id + guard, index + guard);
    }
    used.add(word);
    const direction: PlacedWord['direction'] = index % 2 === 0 ? 'across' : 'down';
    const placed = { word, row, col, direction };
    if (direction === 'across') col += Math.max(1, word.length - 1);
    else row += Math.max(1, word.length - 1);
    return placed;
  });
}

function bonusWords(units: string[], mains: PlacedWord[], id: number): string[] {
  const blocked = new Set(mains.map((item) => item.word));
  const bonus: string[] = [];
  for (let i = 0; bonus.length < 8 && i < units.length * 4; i += 1) {
    const word = [units[(id + i) % units.length], units[(id + i + 2) % units.length]].join('');
    if (!blocked.has(word) && !bonus.includes(word)) bonus.push(word);
  }
  return bonus;
}

function generatedLevel(language: Exclude<LanguageCode, 'ru' | 'az' | 'ar'>, id: number): Level {
  const letters = wheel(language, id);
  const mains = mainWords(letters, id);
  return {
    id,
    language,
    letters,
    mainWords: mains,
    bonusWords: bonusWords(letters, mains, id),
    difficulty: difficulty(id),
    themeId: 'dawn-garden',
    locationId: travelLocations[(id - 1) % travelLocations.length].id,
    rewardCoins: 10 + Math.floor(id / 25) + Math.max(0, mains.length - 2) * 2,
  };
}

function azFallbackLevel(id: number): Level {
  const source = AZ_FALLBACK_LEVELS[(id - 1) % AZ_FALLBACK_LEVELS.length];
  return {
    id,
    language: 'az',
    letters: [...source.letters],
    mainWords: source.mainWords.map((word) => ({ ...word })),
    bonusWords: [...source.bonusWords],
    difficulty: difficulty(id),
    themeId: 'dawn-garden',
    locationId: travelLocations[(id - 1) % travelLocations.length].id,
    rewardCoins: 10 + Math.floor(id / 25) + Math.max(0, source.mainWords.length - 2) * 2,
  };
}

function level(language: Exclude<LanguageCode, 'ru'>, id: number): Level {
  if (language === 'az') return azFallbackLevel(id);
  return generatedLevel(language as Exclude<LanguageCode, 'ru' | 'az' | 'ar'>, id);
}

export function buildGeneratedNonRussianLevels(): Level[] {
  return ACTIVE_LANGUAGES
    .filter((language): language is Exclude<LanguageCode, 'ru'> => language !== 'ru')
    .flatMap((language) => Array.from({ length: TARGET_LEVELS_PER_LANGUAGE }, (_, index) => level(language, index + 1)));
}
