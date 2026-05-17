import { LanguageCode } from '../../i18n/languages';
import { LanguageContentPack } from '../contentPackTypes';
import { enContentPack } from './enContentPack';
import { esContentPack } from './esContentPack';
import { expandContentPackToFullTarget } from './fullPackExpander';
import {
  azContentPack,
  deContentPack,
  frContentPack,
  hiContentPack,
  itContentPack,
  jaContentPack,
  koContentPack,
  ptContentPack,
  zhContentPack,
} from './plannedContentPacks';
import { ruContentPack } from './ruContentPack';
import { trContentPack } from './trContentPack';

export const contentPacks: Partial<Record<LanguageCode, LanguageContentPack>> = {
  en: expandContentPackToFullTarget(enContentPack),
  es: expandContentPackToFullTarget(esContentPack),
  ru: expandContentPackToFullTarget(ruContentPack),
  tr: expandContentPackToFullTarget(trContentPack),
  de: expandContentPackToFullTarget(deContentPack),
  pt: expandContentPackToFullTarget(ptContentPack),
  it: expandContentPackToFullTarget(itContentPack),
  fr: expandContentPackToFullTarget(frContentPack),
  az: expandContentPackToFullTarget(azContentPack),
  hi: expandContentPackToFullTarget(hiContentPack),
  zh: expandContentPackToFullTarget(zhContentPack),
  ja: expandContentPackToFullTarget(jaContentPack),
  ko: expandContentPackToFullTarget(koContentPack),
};

export function getContentPack(language: LanguageCode): LanguageContentPack | null {
  return contentPacks[language] ?? null;
}

export function getAvailableContentPackLanguages(): LanguageCode[] {
  return Object.keys(contentPacks) as LanguageCode[];
}
