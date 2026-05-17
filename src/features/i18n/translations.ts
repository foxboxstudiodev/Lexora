import type { ActiveLanguageCode } from './languages';

export type LanguageCode = ActiveLanguageCode;

export type Labels = {
  languageName: string;
  title: string;
  subtitle: string;
  play: string;
  level: string;
  levels: string;
  explore: string;
  coins: string;
  hint: string;
  hintPrice: string;
  shuffle: string;
  submit: string;
  clear: string;
  found: string;
  words: string;
  bonus: string;
  complete: string;
  next: string;
  invalid: string;
  alreadyFound: string;
  notEnoughCoins: string;
  settings: string;
  achievements: string;
  dailyReward: string;
  install: string;
  claim: string;
  claimedToday: string;
  streak: string;
  coinsEarned: string;
  sound: string;
  music: string;
  vibration: string;
  back: string;
  on: string;
  off: string;
};

const en: Labels = {
  languageName: 'English',
  title: 'Word Journey',
  subtitle: 'Connect letters, reveal words, complete the crossword.',
  play: 'Play',
  level: 'Level',
  levels: 'Levels',
  explore: 'Explore',
  coins: 'Coins',
  hint: 'Hint',
  hintPrice: 'Hint costs',
  shuffle: 'Shuffle',
  submit: 'Submit',
  clear: 'Clear',
  found: 'Found',
  words: 'Words',
  bonus: 'Bonus word',
  complete: 'Level complete',
  next: 'Next level',
  invalid: 'Not in this puzzle',
  alreadyFound: 'Already found',
  notEnoughCoins: 'Not enough coins',
  settings: 'Settings',
  achievements: 'Achievements',
  dailyReward: 'Daily reward',
  install: 'Install',
  claim: 'Claim',
  claimedToday: 'Claimed today',
  streak: 'Streak',
  coinsEarned: 'Coins earned',
  sound: 'Sound',
  music: 'Music',
  vibration: 'Vibration',
  back: 'Back',
  on: 'On',
  off: 'Off',
};

function withLanguageName(languageName: string, overrides: Partial<Labels> = {}): Labels {
  return { ...en, languageName, ...overrides };
}

export const translations: Record<LanguageCode, Labels> = {
  en,
  es: withLanguageName('Español', {
    title: 'Viaje de Palabras', subtitle: 'Une letras, descubre palabras y completa el crucigrama.', play: 'Jugar', level: 'Nivel', levels: 'Niveles', coins: 'Monedas', hint: 'Pista', shuffle: 'Mezclar', clear: 'Borrar', found: 'Encontradas', words: 'Palabras', complete: 'Nivel completo', next: 'Siguiente', settings: 'Ajustes', back: 'Atrás', on: 'Sí', off: 'No',
  }),
  ru: withLanguageName('Русский', {
    title: 'Путешествие слов', subtitle: 'Соединяй буквы, открывай слова и проходи кроссворд.', play: 'Играть', level: 'Уровень', levels: 'Уровни', coins: 'Монеты', hint: 'Подсказка', shuffle: 'Смешать', clear: 'Очистить', found: 'Найдено', words: 'Слова', complete: 'Уровень пройден', next: 'Дальше', settings: 'Настройки', back: 'Назад', on: 'Вкл', off: 'Выкл',
  }),
  tr: withLanguageName('Türkçe', {
    title: 'Kelime Yolculuğu', subtitle: 'Harfleri birleştir, kelimeleri aç ve bulmacayı tamamla.', play: 'Oyna', level: 'Seviye', levels: 'Seviyeler', coins: 'Jeton', hint: 'İpucu', shuffle: 'Karıştır', clear: 'Temizle', found: 'Bulunan', words: 'Kelimeler', complete: 'Seviye tamamlandı', next: 'Sonraki', settings: 'Ayarlar', back: 'Geri', on: 'Açık', off: 'Kapalı',
  }),
  de: withLanguageName('Deutsch', { title: 'Wortreise', play: 'Spielen', level: 'Level', levels: 'Level', coins: 'Münzen', hint: 'Hinweis', next: 'Weiter', back: 'Zurück' }),
  pt: withLanguageName('Português', { title: 'Jornada de Palavras', play: 'Jogar', level: 'Nível', levels: 'Níveis', coins: 'Moedas', hint: 'Dica', next: 'Próximo', back: 'Voltar' }),
  it: withLanguageName('Italiano', { title: 'Viaggio di Parole', play: 'Gioca', level: 'Livello', levels: 'Livelli', coins: 'Monete', hint: 'Aiuto', next: 'Avanti', back: 'Indietro' }),
  fr: withLanguageName('Français', { title: 'Voyage des Mots', play: 'Jouer', level: 'Niveau', levels: 'Niveaux', coins: 'Pièces', hint: 'Indice', next: 'Suivant', back: 'Retour' }),
  az: withLanguageName('Azərbaycanca', { title: 'Söz Səyahəti', play: 'Oyna', level: 'Səviyyə', levels: 'Səviyyələr', coins: 'Pul', hint: 'İpucu', next: 'Növbəti', back: 'Geri' }),
  hi: withLanguageName('हिन्दी', { title: 'शब्द यात्रा', play: 'खेलें', level: 'स्तर', levels: 'स्तर', coins: 'सिक्के', hint: 'संकेत', next: 'अगला', back: 'वापस' }),
  zh: withLanguageName('中文', { title: '文字之旅', play: '开始', level: '关卡', levels: '关卡', coins: '金币', hint: '提示', next: '下一关', back: '返回' }),
  ja: withLanguageName('日本語', { title: 'ことばの旅', play: 'プレイ', level: 'レベル', levels: 'レベル', coins: 'コイン', hint: 'ヒント', next: '次へ', back: '戻る' }),
  ko: withLanguageName('한국어', { title: '단어 여행', play: '시작', level: '레벨', levels: '레벨', coins: '코인', hint: '힌트', next: '다음', back: '뒤로' }),
};
