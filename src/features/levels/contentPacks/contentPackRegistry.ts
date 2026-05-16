import { LanguageCode } from '../../i18n/languages';
import { LanguageContentPack } from '../contentPackTypes';
import { enContentPack } from './enContentPack';
import { esContentPack } from './esContentPack';
import { ruContentPack } from './ruContentPack';
import { trContentPack } from './trContentPack';

export const contentPacks: Partial<Record<LanguageCode, LanguageContentPack>> = {
  en: enContentPack,
  es: esContentPack,
  ru: ruContentPack,
  tr: trContentPack,
};

export function getContentPack(language: LanguageCode): LanguageContentPack | null {
  return contentPacks[language] ?? null;
}

export function getAvailableContentPackLanguages(): LanguageCode[] {
  return Object.keys(contentPacks) as LanguageCode[];
}
