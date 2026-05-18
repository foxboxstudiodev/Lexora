import type { ActiveLanguageCode } from './languages';

export type LanguageCode = ActiveLanguageCode;

export type Labels = {
  languageName: string;
  title: string;
  subtitle: string;
  play: string;
  level: string;
  levels: string;
  languages: string;
  explore: string;
  coins: string;
  hint: string;
  hintLetter: string;
  hintStart: string;
  hintWord: string;
  hintPrice: string;
  hintsUsed: string;
  shuffle: string;
  submit: string;
  clear: string;
  found: string;
  words: string;
  bonus: string;
  complete: string;
  next: string;
  invalid: string;
  tooShort: string;
  notInPuzzle: string;
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
  languages: 'Languages',
  explore: 'Explore',
  coins: 'Coins',
  hint: 'Hint',
  hintLetter: 'Letter',
  hintStart: 'Start',
  hintWord: 'Word',
  hintPrice: 'Hint costs',
  hintsUsed: 'Hints used',
  shuffle: 'Shuffle',
  submit: 'Submit',
  clear: 'Clear',
  found: 'Found',
  words: 'Words',
  bonus: 'Bonus word',
  complete: 'Level complete',
  next: 'Next level',
  invalid: 'Not in this puzzle',
  tooShort: 'Too short',
  notInPuzzle: 'Not in this puzzle',
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
    title: 'Viaje de Palabras', subtitle: 'Une letras, descubre palabras y completa el crucigrama.', play: 'Jugar', level: 'Nivel', levels: 'Niveles', languages: 'Idiomas', coins: 'Monedas', hint: 'Pista', hintLetter: 'Letra', hintStart: 'Inicio', hintWord: 'Palabra', hintsUsed: 'Pistas usadas', shuffle: 'Mezclar', clear: 'Borrar', found: 'Encontradas', words: 'Palabras', complete: 'Nivel completo', next: 'Siguiente', invalid: 'No está en este puzzle', tooShort: 'Demasiado corto', notInPuzzle: 'No está en este puzzle', alreadyFound: 'Ya encontrada', notEnoughCoins: 'No hay monedas suficientes', settings: 'Ajustes', back: 'Atrás', on: 'Sí', off: 'No',
  }),
  ru: withLanguageName('Русский', {
    title: 'Путешествие слов', subtitle: 'Соединяй буквы, открывай слова и проходи кроссворд.', play: 'Играть', level: 'Уровень', levels: 'Уровни', languages: 'Языки', coins: 'Монеты', hint: 'Подсказка', hintLetter: 'Буква', hintStart: 'Начало', hintWord: 'Слово', hintsUsed: 'Подсказок', shuffle: 'Смешать', clear: 'Очистить', found: 'Найдено', words: 'Слова', complete: 'Уровень пройден', next: 'Дальше', invalid: 'Этого слова нет в уровне', tooShort: 'Слишком коротко', notInPuzzle: 'Этого слова нет в уровне', alreadyFound: 'Уже найдено', notEnoughCoins: 'Недостаточно монет', settings: 'Настройки', back: 'Назад', on: 'Вкл', off: 'Выкл',
  }),
  tr: withLanguageName('Türkçe', {
    title: 'Kelime Yolculuğu', subtitle: 'Harfleri birleştir, kelimeleri aç ve bulmacayı tamamla.', play: 'Oyna', level: 'Seviye', levels: 'Seviyeler', languages: 'Diller', coins: 'Jeton', hint: 'İpucu', hintLetter: 'Harf', hintStart: 'Başlangıç', hintWord: 'Kelime', hintsUsed: 'Kullanılan ipucu', shuffle: 'Karıştır', clear: 'Temizle', found: 'Bulunan', words: 'Kelimeler', complete: 'Seviye tamamlandı', next: 'Sonraki', invalid: 'Bu bulmacada yok', tooShort: 'Çok kısa', notInPuzzle: 'Bu bulmacada yok', alreadyFound: 'Zaten bulundu', notEnoughCoins: 'Yeterli jeton yok', settings: 'Ayarlar', back: 'Geri', on: 'Açık', off: 'Kapalı',
  }),
  de: withLanguageName('Deutsch', { title: 'Wortreise', play: 'Spielen', level: 'Level', levels: 'Level', languages: 'Sprachen', coins: 'Münzen', hint: 'Hinweis', hintLetter: 'Buchstabe', hintStart: 'Anfang', hintWord: 'Wort', hintsUsed: 'Hinweise', invalid: 'Nicht in diesem Rätsel', tooShort: 'Zu kurz', notInPuzzle: 'Nicht in diesem Rätsel', alreadyFound: 'Schon gefunden', notEnoughCoins: 'Nicht genug Münzen', next: 'Weiter', back: 'Zurück' }),
  pt: withLanguageName('Português', { title: 'Jornada de Palavras', play: 'Jogar', level: 'Nível', levels: 'Níveis', languages: 'Idiomas', coins: 'Moedas', hint: 'Dica', hintLetter: 'Letra', hintStart: 'Início', hintWord: 'Palavra', hintsUsed: 'Dicas usadas', invalid: 'Não está neste puzzle', tooShort: 'Curto demais', notInPuzzle: 'Não está neste puzzle', alreadyFound: 'Já encontrada', notEnoughCoins: 'Moedas insuficientes', next: 'Próximo', back: 'Voltar' }),
  it: withLanguageName('Italiano', { title: 'Viaggio di Parole', play: 'Gioca', level: 'Livello', levels: 'Livelli', languages: 'Lingue', coins: 'Monete', hint: 'Aiuto', hintLetter: 'Lettera', hintStart: 'Inizio', hintWord: 'Parola', hintsUsed: 'Aiuti usati', invalid: 'Non è in questo puzzle', tooShort: 'Troppo corto', notInPuzzle: 'Non è in questo puzzle', alreadyFound: 'Già trovata', notEnoughCoins: 'Monete insufficienti', next: 'Avanti', back: 'Indietro' }),
  fr: withLanguageName('Français', { title: 'Voyage des Mots', play: 'Jouer', level: 'Niveau', levels: 'Niveaux', languages: 'Langues', coins: 'Pièces', hint: 'Indice', hintLetter: 'Lettre', hintStart: 'Début', hintWord: 'Mot', hintsUsed: 'Indices utilisés', invalid: 'Absent de cette grille', tooShort: 'Trop court', notInPuzzle: 'Absent de cette grille', alreadyFound: 'Déjà trouvé', notEnoughCoins: 'Pas assez de pièces', next: 'Suivant', back: 'Retour' }),
  az: withLanguageName('Azərbaycanca', { title: 'Söz Səyahəti', play: 'Oyna', level: 'Səviyyə', levels: 'Səviyyələr', languages: 'Dillər', coins: 'Pul', hint: 'İpucu', hintLetter: 'Hərf', hintStart: 'Başlanğıc', hintWord: 'Söz', hintsUsed: 'İpucu sayı', invalid: 'Bu tapmacada yoxdur', tooShort: 'Çox qısadır', notInPuzzle: 'Bu tapmacada yoxdur', alreadyFound: 'Artıq tapılıb', notEnoughCoins: 'Pul kifayət deyil', next: 'Növbəti', back: 'Geri' }),
  hi: withLanguageName('हिन्दी', { title: 'शब्द यात्रा', play: 'खेलें', level: 'स्तर', levels: 'स्तर', languages: 'भाषाएँ', coins: 'सिक्के', hint: 'संकेत', hintLetter: 'अक्षर', hintStart: 'शुरुआत', hintWord: 'शब्द', hintsUsed: 'संकेत उपयोग', invalid: 'इस पहेली में नहीं है', tooShort: 'बहुत छोटा', notInPuzzle: 'इस पहेली में नहीं है', alreadyFound: 'पहले ही मिला', notEnoughCoins: 'पर्याप्त सिक्के नहीं', next: 'अगला', back: 'वापस' }),
  zh: withLanguageName('中文', { title: '文字之旅', play: '开始', level: '关卡', levels: '关卡', languages: '语言', coins: '金币', hint: '提示', hintLetter: '字', hintStart: '开头', hintWord: '词', hintsUsed: '已用提示', invalid: '不在本关中', tooShort: '太短', notInPuzzle: '不在本关中', alreadyFound: '已经找到', notEnoughCoins: '金币不足', next: '下一关', back: '返回' }),
  ja: withLanguageName('日本語', { title: 'ことばの旅', play: 'プレイ', level: 'レベル', levels: 'レベル', languages: '言語', coins: 'コイン', hint: 'ヒント', hintLetter: '文字', hintStart: '始め', hintWord: '単語', hintsUsed: '使用ヒント', invalid: 'このパズルにありません', tooShort: '短すぎます', notInPuzzle: 'このパズルにありません', alreadyFound: 'すでに発見済み', notEnoughCoins: 'コインが足りません', next: '次へ', back: '戻る' }),
  ko: withLanguageName('한국어', { title: '단어 여행', play: '시작', level: '레벨', levels: '레벨', languages: '언어', coins: '코인', hint: '힌트', hintLetter: '글자', hintStart: '시작', hintWord: '단어', hintsUsed: '사용한 힌트', invalid: '이 퍼즐에 없습니다', tooShort: '너무 짧음', notInPuzzle: '이 퍼즐에 없습니다', alreadyFound: '이미 찾음', notEnoughCoins: '코인이 부족합니다', next: '다음', back: '뒤로' }),
};