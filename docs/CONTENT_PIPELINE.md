# Lexora Content Pipeline

Lexora uses a controlled content pipeline for full-scale multilingual level creation.

## Target

```text
13 languages x 300 levels = 3900 levels
```

## Playable languages

All target languages are playable:

```text
en
es
ru
tr
de
pt
it
fr
az
hi
zh
ja
ko
```

## Current coverage

```text
Total target: 3900
Current generated runtime coverage: 3900
Current missing: 0
```

## Wheel rule

Every playable level must use this wheel size rule:

```text
minimum selectable units: 5
maximum selectable units: 10
```

This applies to letters, characters and language-specific units.

Examples:

```text
English: letters
Russian: Cyrillic letters
Hindi: grapheme-like units
Chinese: Han characters
Japanese: kana/characters
Korean: syllable blocks
```

## Source pack flow

```text
LanguageContentPack
-> expandContentPackToFullTarget
-> validateContentPack
-> buildExpansionLevelsFromContentPack
-> expansionLevelsToRuntimeLevels
-> starterLevels
```

## Important files

```text
src/features/levels/contentPackTypes.ts
src/features/levels/contentPackValidator.ts
src/features/levels/contentPackBuilder.ts
src/features/levels/contentPackCoverage.ts
src/features/levels/contentPacks/contentPackRegistry.ts
src/features/levels/contentPacks/fullPackExpander.ts
src/features/levels/contentPacks/runtimeContentLevels.ts
```

## Source packs

```text
src/features/levels/contentPacks/enContentPack.ts
src/features/levels/contentPacks/esContentPack.ts
src/features/levels/contentPacks/ruContentPack.ts
src/features/levels/contentPacks/trContentPack.ts
src/features/levels/contentPacks/plannedContentPacks.ts
```

The file name `plannedContentPacks.ts` is historical; the languages inside it are now active/playable.

## Quality requirements

Each content pack entry must have:

```text
packLevelNumber
words
optional bonusWords
locationId
optional seed
```

Every generated level must pass:

```text
wheel 5-10 units
word buildability
crossword placement
shared intersections
no direct ordered primary word except rare cases
known travel location
valid reward
```

## Next content upgrade path

The full 3900-level runtime coverage is generated. The next quality phase is to replace seed-expanded entries with deeper curated dictionaries per language while preserving the same 300-level contract per language.
