import { LanguageCode } from './languages';

export type WordSegmentationMode = 'letters' | 'graphemes' | 'characters' | 'syllable-blocks';
export type AccentPolicy = 'preserve' | 'strip-for-matching' | 'not-applicable';

export type LanguageWordProfile = {
  language: LanguageCode;
  segmentationMode: WordSegmentationMode;
  accentPolicy: AccentPolicy;
  minWordUnits: number;
  maxEarlyWordUnits: number;
  fillerUnits: string[];
};

export const languageWordProfiles: Record<LanguageCode, LanguageWordProfile> = {
  en: { language: 'en', segmentationMode: 'letters', accentPolicy: 'not-applicable', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'E', 'R', 'S', 'T', 'L', 'N'] },
  es: { language: 'es', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'E', 'O', 'S', 'R', 'N', 'L'] },
  ru: { language: 'ru', segmentationMode: 'letters', accentPolicy: 'not-applicable', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['А', 'Е', 'О', 'Р', 'С', 'Т', 'Н'] },
  tr: { language: 'tr', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'E', 'İ', 'R', 'L', 'N', 'K'] },
  de: { language: 'de', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'E', 'N', 'R', 'S', 'T', 'L'] },
  pt: { language: 'pt', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'E', 'O', 'S', 'R', 'N', 'L'] },
  it: { language: 'it', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'E', 'I', 'O', 'R', 'S', 'T'] },
  fr: { language: 'fr', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['E', 'A', 'S', 'R', 'T', 'N', 'L'] },
  az: { language: 'az', segmentationMode: 'letters', accentPolicy: 'preserve', minWordUnits: 3, maxEarlyWordUnits: 5, fillerUnits: ['A', 'Ə', 'İ', 'R', 'L', 'N', 'S'] },
  hi: { language: 'hi', segmentationMode: 'graphemes', accentPolicy: 'not-applicable', minWordUnits: 2, maxEarlyWordUnits: 4, fillerUnits: ['क', 'म', 'न', 'र', 'ल', 'स', 'ा'] },
  zh: { language: 'zh', segmentationMode: 'characters', accentPolicy: 'not-applicable', minWordUnits: 2, maxEarlyWordUnits: 4, fillerUnits: ['山', '水', '人', '火', '木', '天', '月'] },
  ja: { language: 'ja', segmentationMode: 'characters', accentPolicy: 'not-applicable', minWordUnits: 2, maxEarlyWordUnits: 4, fillerUnits: ['あ', 'か', 'さ', 'た', 'な', 'ま', 'ら'] },
  ko: { language: 'ko', segmentationMode: 'syllable-blocks', accentPolicy: 'not-applicable', minWordUnits: 2, maxEarlyWordUnits: 4, fillerUnits: ['가', '나', '다', '라', '마', '사', '하'] },
  ar: { language: 'ar', segmentationMode: 'letters', accentPolicy: 'not-applicable', minWordUnits: 2, maxEarlyWordUnits: 5, fillerUnits: ['ا', 'ل', 'م', 'ن', 'ر', 'ب', 'ت'] },
};

export function getLanguageWordProfile(language: LanguageCode): LanguageWordProfile {
  return languageWordProfiles[language];
}
