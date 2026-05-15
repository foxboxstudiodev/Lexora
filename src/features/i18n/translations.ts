export type LanguageCode = 'en' | 'es' | 'ru' | 'tr';

export type Labels = {
  languageName: string;
  title: string;
  subtitle: string;
  level: string;
  coins: string;
  hint: string;
  hintPrice: string;
  shuffle: string;
  found: string;
  bonus: string;
  complete: string;
  next: string;
  invalid: string;
  alreadyFound: string;
  notEnoughCoins: string;
  settings: string;
  sound: string;
  music: string;
  vibration: string;
  back: string;
  on: string;
  off: string;
};

export const translations: Record<LanguageCode, Labels> = {
  en: {
    languageName: 'English',
    title: 'Word Journey',
    subtitle: 'Connect letters, reveal words, complete the crossword.',
    level: 'Level',
    coins: 'Coins',
    hint: 'Hint',
    hintPrice: 'Hint costs',
    shuffle: 'Shuffle',
    found: 'Found',
    bonus: 'Bonus word',
    complete: 'Level complete',
    next: 'Next level',
    invalid: 'Not in this puzzle',
    alreadyFound: 'Already found',
    notEnoughCoins: 'Not enough coins',
    settings: 'Settings',
    sound: 'Sound',
    music: 'Music',
    vibration: 'Vibration',
    back: 'Back',
    on: 'On',
    off: 'Off',
  },
  es: {
    languageName: 'Español',
    title: 'Viaje de Palabras',
    subtitle: 'Une letras, descubre palabras y completa el crucigrama.',
    level: 'Nivel',
    coins: 'Monedas',
    hint: 'Pista',
    hintPrice: 'La pista cuesta',
    shuffle: 'Mezclar',
    found: 'Encontradas',
    bonus: 'Palabra extra',
    complete: 'Nivel completo',
    next: 'Siguiente',
    invalid: 'No está en este puzzle',
    alreadyFound: 'Ya encontrada',
    notEnoughCoins: 'No hay monedas suficientes',
    settings: 'Ajustes',
    sound: 'Sonido',
    music: 'Música',
    vibration: 'Vibración',
    back: 'Atrás',
    on: 'Sí',
    off: 'No',
  },
  ru: {
    languageName: 'Русский',
    title: 'Путешествие слов',
    subtitle: 'Соединяй буквы, открывай слова и проходи кроссворд.',
    level: 'Уровень',
    coins: 'Монеты',
    hint: 'Подсказка',
    hintPrice: 'Цена подсказки',
    shuffle: 'Смешать',
    found: 'Найдено',
    bonus: 'Бонусное слово',
    complete: 'Уровень пройден',
    next: 'Дальше',
    invalid: 'Нет в этом уровне',
    alreadyFound: 'Уже найдено',
    notEnoughCoins: 'Не хватает монет',
    settings: 'Настройки',
    sound: 'Звук',
    music: 'Музыка',
    vibration: 'Вибрация',
    back: 'Назад',
    on: 'Вкл',
    off: 'Выкл',
  },
  tr: {
    languageName: 'Türkçe',
    title: 'Kelime Yolculuğu',
    subtitle: 'Harfleri birleştir, kelimeleri aç ve bulmacayı tamamla.',
    level: 'Seviye',
    coins: 'Jeton',
    hint: 'İpucu',
    hintPrice: 'İpucu bedeli',
    shuffle: 'Karıştır',
    found: 'Bulunan',
    bonus: 'Bonus kelime',
    complete: 'Seviye tamamlandı',
    next: 'Sonraki',
    invalid: 'Bu bulmacada yok',
    alreadyFound: 'Zaten bulundu',
    notEnoughCoins: 'Yeterli jeton yok',
    settings: 'Ayarlar',
    sound: 'Ses',
    music: 'Müzik',
    vibration: 'Titreşim',
    back: 'Geri',
    on: 'Açık',
    off: 'Kapalı',
  },
};
