import { getJapaneseWordsForProgression, JAPANESE_KANJI_ONBOARDING_PROFILE } from './japaneseProgression';
import { normalizeJapaneseKana } from './japaneseWordPolicy';

export type JapaneseSemanticGroup = {
  id: string;
  words: string[];
  canonical: string;
};

export type JapaneseDuplicateReport = {
  duplicateGroups: JapaneseSemanticGroup[];
  duplicateWords: string[];
};

const SEMANTIC_GROUPS: JapaneseSemanticGroup[] = [
  { id: 'cat', canonical: 'ねこ', words: ['ねこ', '猫'] },
  { id: 'dog', canonical: 'いぬ', words: ['いぬ', '犬'] },
  { id: 'mountain', canonical: 'やま', words: ['やま', '山'] },
  { id: 'river', canonical: 'かわ', words: ['かわ', '川'] },
  { id: 'water', canonical: 'みず', words: ['みず', '水'] },
  { id: 'person', canonical: 'ひと', words: ['ひと', '人'] },
  { id: 'flower', canonical: 'はな', words: ['はな', '花'] },
  { id: 'sea', canonical: 'うみ', words: ['うみ', '海'] },
  { id: 'book', canonical: 'ほん', words: ['ほん', '本'] },
];

function normalizeSemanticWord(word: string): string {
  return normalizeJapaneseKana(word.trim());
}

export function getJapaneseSemanticGroup(word: string): JapaneseSemanticGroup | null {
  const normalized = normalizeSemanticWord(word);

  return SEMANTIC_GROUPS.find((group) =>
    group.words.some((candidate) => normalizeSemanticWord(candidate) === normalized || candidate === word.trim()),
  ) ?? null;
}

export function removeJapaneseSemanticDuplicates(words: string[]): string[] {
  const usedGroupIds = new Set<string>();
  const output: string[] = [];

  for (const word of words) {
    const group = getJapaneseSemanticGroup(word);

    if (group) {
      if (usedGroupIds.has(group.id)) continue;
      usedGroupIds.add(group.id);
    }

    output.push(word);
  }

  return output;
}

export function getJapaneseSemanticDuplicateReport(words: string[] = getJapaneseWordsForProgression(JAPANESE_KANJI_ONBOARDING_PROFILE)): JapaneseDuplicateReport {
  const groups = SEMANTIC_GROUPS.filter((group) => group.words.filter((word) => words.includes(word)).length > 1);

  return {
    duplicateGroups: groups,
    duplicateWords: groups.flatMap((group) => group.words.filter((word) => word !== group.canonical && words.includes(word))),
  };
}
