# Lexora Level Generation

Lexora levels are generated from curated multilingual word seeds.

## Source of truth

The source of truth is:

- `src/features/levels/wordBanks.ts`

Each seed contains:

- language
- available letters
- main words
- bonus words
- theme id

## Factory

The factory is:

- `src/features/levels/levelFactory.ts`

It converts word seeds into complete `Level` objects by assigning:

- per-language level id
- placed crossword words
- difficulty
- reward coins

## Loader

The active level pack is:

- `src/features/levels/levelPacks.ts`

It calls `createLevelsFromSeeds(wordSeeds)`.

## Validation

Loaded levels are validated by:

- `src/features/levels/levelValidator.ts`

Validation checks:

- words can be built from letters
- no duplicate words
- no main/bonus overlap
- positive reward
- valid grid
- no conflicting letters in the same cell

## Expansion rule

To add more levels, add more curated `WordSeed` entries. Do not manually write full `Level` objects unless there is a special reason.

## Quality rule

Only real, clean, common words should be used. Do not add invented words, abbreviations, profanity, or dictionary garbage.
