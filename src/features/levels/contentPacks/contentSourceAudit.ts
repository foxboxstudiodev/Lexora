import { LanguageCode } from '../../i18n/languages';
import { getAvailableContentPackLanguages, getContentPack } from './contentPackRegistry';

export type ContentSourceAudit = {
  language: LanguageCode;
  totalEntries: number;
  manualEntries: number;
  seedExpandedEntries: number;
  unspecifiedEntries: number;
};

export function auditContentPackSources(): ContentSourceAudit[] {
  return getAvailableContentPackLanguages().map((language) => {
    const pack = getContentPack(language);
    const entries = pack?.entries ?? [];
    const manualEntries = entries.filter((entry) => entry.sourceKind === 'manual').length;
    const seedExpandedEntries = entries.filter((entry) => entry.sourceKind === 'seed-expanded').length;
    const unspecifiedEntries = entries.filter((entry) => entry.sourceKind === undefined).length;

    return {
      language,
      totalEntries: entries.length,
      manualEntries,
      seedExpandedEntries,
      unspecifiedEntries,
    };
  });
}

export function hasSeedExpandedContent(): boolean {
  return auditContentPackSources().some((item) => item.seedExpandedEntries > 0 || item.unspecifiedEntries > 0);
}
