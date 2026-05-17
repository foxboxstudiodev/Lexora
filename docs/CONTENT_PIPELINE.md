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

Every playable level uses a selectable wheel. The wheel size is the exact number of letters / language units the player can touch and connect.

```text
minimum selectable units: 4
maximum selectable units: 10
```

## Repeating 20-level difficulty blocks

Each language has 300 levels split into 15 blocks of 20 levels. Every 20-level block restarts from easy and grows to hard again.

```text
1-20
21-40
41-60
61-80
81-100
101-120
121-140
141-160
161-180
181-200
201-220
221-240
241-260
261-280
281-300
```

Inside every block, the exact wheel-size pattern is:

```text
1  -> 4 units
2  -> 4 units
3  -> 5 units
4  -> 5 units
5  -> 5 units
6  -> 5 units
7  -> 6 units
8  -> 6 units
9  -> 6 units
10 -> 6 units
11 -> 7 units
12 -> 7 units
13 -> 7 units
14 -> 7 units
15 -> 8 units
16 -> 8 units
17 -> 8 units
18 -> 9 units
19 -> 9 units
20 -> 10 units
```

Examples:

```text
Level 1   = 4 units
Level 20  = 10 units
Level 21  = 4 units
Level 40  = 10 units
Level 41  = 4 units
Level 60  = 10 units
Level 281 = 4 units
Level 300 = 10 units
```

This applies to letters, characters and language-specific units.

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
-> getStarterLevels
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
src/features/levels/difficultyProgression.ts
src/features/levels/unitWheelLetterGenerator.ts
src/features/levels/unitCrosswordGenerator.ts
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
exact wheel size by 20-level block
word buildability from wheel units
bonus words filtered if they cannot be built
crossword placement with real intersections
no side-by-side word collisions without crossings
no end-to-end word collisions
known travel location
valid reward
```

## Next content upgrade path

The full 3900-level runtime coverage is generated. The next quality phase is to replace seed-expanded entries with deeper curated dictionaries per language while preserving the same 300-level contract per language and the repeating 20-level wheel progression.
