import { LanguageCode } from '../../i18n/languages';
import { LanguageContentPack } from '../contentPackTypes';
import { enContentPack } from './enContentPack';

export const contentPacks: Partial<Record<LanguageCode, LanguageContentPack>> = {
  en: enContentPack,
};

export function getContentPack(language: LanguageCode): LanguageContentPack | null {
  return contentPacks[language] ?? null;
}

export function getAvailableContentPackLanguages(): LanguageCode[] {
  return Object.keys(contentPacks) as LanguageCode[];
}
