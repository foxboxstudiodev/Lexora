import { ACTIVE_LANGUAGES } from '../i18n/languages';
import { LanguageCode, translations } from '../i18n/translations';

export type LanguageSelectorItem = {
  code: LanguageCode;
  label: string;
};

export function getLanguageSelectorItems(): LanguageSelectorItem[] {
  return ACTIVE_LANGUAGES.map((code) => ({
    code,
    label: translations[code].languageName,
  }));
}

export function getLanguageSelectorColumnCount(itemCount = ACTIVE_LANGUAGES.length): number {
  if (itemCount <= 4) return itemCount;
  if (itemCount <= 8) return 4;
  return 5;
}
