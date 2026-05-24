import { lookupAzerbaijaniDictionaryEntry } from './azerbaijaniDictionary';
import { analyzeAzerbaijaniWord } from './azerbaijaniMorphology';
import { normalizeAzerbaijaniWord } from './azerbaijaniWordPolicy';

export type AzerbaijaniMorphologyFeature =
  | 'plural'
  | 'possessive-1sg'
  | 'possessive-2sg'
  | 'possessive-3sg'
  | 'case-dative'
  | 'case-locative'
  | 'case-ablative'
  | 'case-accusative'
  | 'case-genitive';

export type AzerbaijaniAdvancedMorphologyAnalysis = {
  surface: string;
  normalized: string;
  lemma: string;
  lexicalClass: 'noun' | 'unknown';
  features: AzerbaijaniMorphologyFeature[];
  confidence: 'high' | 'medium' | 'low';
};

const SUFFIX_RULES: Array<{ suffixes: string[]; feature: AzerbaijaniMorphologyFeature }> = [
  { suffixes: ['lar', 'lər'], feature: 'plural' },
  { suffixes: ['ım', 'im', 'um', 'üm'], feature: 'possessive-1sg' },
  { suffixes: ['ın', 'in', 'un', 'ün'], feature: 'possessive-2sg' },
  { suffixes: ['ı', 'i', 'u', 'ü', 'sı', 'si', 'su', 'sü'], feature: 'possessive-3sg' },
  { suffixes: ['a', 'ə', 'ya', 'yə'], feature: 'case-dative' },
  { suffixes: ['da', 'də'], feature: 'case-locative' },
  { suffixes: ['dan', 'dən'], feature: 'case-ablative' },
  { suffixes: ['ı', 'i', 'u', 'ü', 'nı', 'ni', 'nu', 'nü'], feature: 'case-accusative' },
  { suffixes: ['ın', 'in', 'un', 'ün', 'nın', 'nin', 'nun', 'nün'], feature: 'case-genitive' },
];

function stripKnownSuffixes(word: string): { lemma: string; features: AzerbaijaniMorphologyFeature[] } {
  let lemma = word;
  const features: AzerbaijaniMorphologyFeature[] = [];

  for (const rule of SUFFIX_RULES) {
    const suffix = rule.suffixes
      .sort((left, right) => right.length - left.length)
      .find((candidate) => lemma.length > candidate.length + 1 && lemma.endsWith(candidate));

    if (!suffix) continue;

    const candidateLemma = lemma.slice(0, -suffix.length);
    if (lookupAzerbaijaniDictionaryEntry(candidateLemma)) {
      lemma = candidateLemma;
      features.push(rule.feature);
    }
  }

  return { lemma, features };
}

export function analyzeAdvancedAzerbaijaniMorphology(surface: string): AzerbaijaniAdvancedMorphologyAnalysis {
  const normalized = normalizeAzerbaijaniWord(surface);
  const direct = lookupAzerbaijaniDictionaryEntry(normalized);

  if (direct) {
    return {
      surface: surface.trim(),
      normalized,
      lemma: direct.lemma,
      lexicalClass: direct.lexicalClass,
      features: [],
      confidence: 'high',
    };
  }

  const stripped = stripKnownSuffixes(normalized);
  const lemmaEntry = lookupAzerbaijaniDictionaryEntry(stripped.lemma);
  const fallback = analyzeAzerbaijaniWord(normalized);

  return {
    surface: surface.trim(),
    normalized,
    lemma: lemmaEntry?.lemma ?? stripped.lemma,
    lexicalClass: lemmaEntry?.lexicalClass ?? fallback.lexicalClass,
    features: stripped.features,
    confidence: lemmaEntry ? 'medium' : 'low',
  };
}

export function getAzerbaijaniLemma(surface: string): string {
  return analyzeAdvancedAzerbaijaniMorphology(surface).lemma;
}
