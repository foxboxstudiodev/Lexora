# Lexora Quality Checks

Before merging or releasing changes, run:

```bash
npm install
npm test
npm run build
```

## What is checked

### Tests

`npm test` runs Vitest checks for:

- generated level integrity
- economy logic
- daily reward logic
- core word engine logic

### Build

`npm run build` runs:

- TypeScript type-checking with `tsc --noEmit`
- Vite production build

## CI

GitHub Actions runs the same quality gates on every push and pull request to `main`.

## Level expansion rule

When adding new word seeds, always run tests. Invalid words, duplicate words, impossible words, and broken grids should fail before release.
