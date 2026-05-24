import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniSemanticGroup = {
  id: string;
  canonical: string;
  words: string[];
};

export type AzerbaijaniDuplicateReport = {
  duplicateGroups: AzerbaijaniSemanticGroup[];
  duplicateWords: string[];
};

const SEMANTIC_GROUPS: AzerbaijaniSemanticGroup[] = [
  { id: 'home', canonical: 'ev', words: ['ev', 'mənzil', 'bina'] },
  { id: 'road', canonical: 'yol', words: ['yol', 'küçə'] },
  { id: 'water', canonical: 'su', words: ['su', 'çay', 'göl', 'dəniz'] },
  { id: 'family-parent', canonical: 'ana', words: ['ana', 'ata'] },
  { id: 'family-sibling', canonical: 'qardaş', words: ['qardaş', 'bacı'] },
  { id: 'settlement', canonical: 'şəhər', words: ['şəhər', 'kənd'] },
  { id: 'school', canonical: 'məktəb', words: ['məktəb', 'şagird', 'müəllim'] },
  { id: 'food-basic', canonical: 'çörək', words: ['çörək', 'yemək', 'lavaş'] },
  { id: 'fruit', canonical: 'alma', words: ['alma', 'armud', 'üzüm', 'nar'] },
];

export function getAzerbaijaniSemanticGroup(word: string): AzerbaijaniSemanticGroup | null {
  const normalized = normalizeAzerbaijaniWord(word);

  return SEMANTIC_GROUPS.find((group) =>
    group.words.some((candidate) => normalizeAzerbaijaniWord(candidate) === normalized),
  ) ?? null;
}

export function removeAzerbaijaniSemanticDuplicates(words: string[]): string[] {
  const usedGroupIds = new Set<string>();
  const output: string[] = [];

  for (const word of words) {
    const group = getAzerbaijaniSemanticGroup(word);

    if (group) {
      if (usedGroupIds.has(group.id)) continue;
      usedGroupIds.add(group.id);
    }

    output.push(word);
  }

  return output;
}

export function getAzerbaijaniSemanticDuplicateReport(words: string[]): AzerbaijaniDuplicateReport {
  const normalizedWords = new Set(words.map(normalizeAzerbaijaniWord));
  const groups = SEMANTIC_GROUPS.filter((group) =>
    group.words.filter((word) => normalizedWords.has(normalizeAzerbaijaniWord(word))).length > 1,
  );

  return {
    duplicateGroups: groups,
    duplicateWords: groups.flatMap((group) =>
      group.words.filter((word) => word !== group.canonical && normalizedWords.has(normalizeAzerbaijaniWord(word))),
    ),
  };
}
