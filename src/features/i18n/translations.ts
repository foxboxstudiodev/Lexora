export type LanguageCode = 'en' | 'es' | 'ru' | 'tr';

export type Labels = {
  languageName: string;
  title: string;
  subtitle: string;
  level: string;
  levels: string;
  coins: string;
  hint: string;
  hintPrice: string;
  shuffle: string;
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

export const translations: Record<LanguageCode, Labels> = {
  en: {
    languageName: 'English',
    title: 'Word Journey',
    subtitle: 'Connect letters, reveal words, complete the crossword.',
    level: 'Level',
    levels: 'Levels',
    coins: 'Coins',
    hint: 'Hint',
    hintPrice: 'Hint costs',
    shuffle: 'Shuffle',
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
  },
  es: {
    languageName: 'Español',
    title: 'Viaje de Palabras',
    subtitle: 'Une letras, descubre palabras y completa el crucigrama.',
    level: 'Nivel',
    levels: 'Niveles',
    coins: 'Monedas',
    hint: 'Pista',
    hintPrice: 'La pista cuesta',
    shuffle: 'Mezclar',
    found: 'Encontradas',
    words: 'Palabras',
    bonus: 'Palabra extra',
    complete: 'Nivel completo',
    next: 'Siguiente',
    invalid: 'No está en este puzzle',
    alreadyFound: 'Ya encontrada',
    notEnoughCoins: 'No hay monedas suficientes',
    settings: 'Ajustes',
    achievements: 'Logros',
    dailyReward: 'Recompensa diaria',
    claim: 'Recibir',
    claimedToday: 'Recibido hoy',
    streak: 'Racha',
    coinsEarned: 'Monedas ganadas',
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
    levels: 'Уровни',
    coins: 'Монеты',
    hint: 'Подсказка',
    hintPrice: 'Цена подсказки',
    shuffle: 'Смешать',
    found: 'Найдено',
    words: 'Слова',
    bonus: 'Бонусное слово',
    complete: 'Уровень пройден',
    next: 'Дальше',
    invalid: 'Нет в этом уровне',
    alreadyFound: 'Уже найдено',
    notEnoughCoins: 'Не хватает монет',
    settings: 'Настройки',
    achievements: 'Достижения',
    dailyReward: 'Ежедневная награда',
    claim: 'Получить',
    claimedToday: 'Сегодня получено',
    streak: 'Серия',
    coinsEarned: 'Монет заработано',
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
    levels: 'Seviyeler',
    coins: 'Jeton',
    hint: 'İpucu',
    hintPrice: 'İpucu bedeli',
    shuffle: 'Karıştır',
    found: 'Bulunan',
    words: 'Kelimeler',
    bonus: 'Bonus kelime',
    complete: 'Seviye tamamlandı',
    next: 'Sonraki',
    invalid: 'Bu bulmacada yok',
    alreadyFound: 'Zaten bulundu',
    notEnoughCoins: 'Yeterli jeton yok',
    settings: 'Ayarlar',
    achievements: 'Başarılar',
    dailyReward: 'Günlük ödül',
    claim: 'Al',
    claimedToday: 'Bugün alındı',
    streak: 'Seri',
    coinsEarned: 'Kazanılan jeton',
    sound: 'Ses',
    music: 'Müzik',
    vibration: 'Titreşim',
    back: 'Geri',
    on: 'Açık',
    off: 'Kapalı',
  },
};
