# Lexora Documentation

This directory contains operational documentation for Lexora development, quality gates and app-store preparation.

## Documents

- [APK Wrapper Flow](./APK_WRAPPER_FLOW.md)

## Current development focus

Lexora is being expanded from a playable PWA word puzzle into a multilingual, store-ready game architecture.

Main engineering tracks:

1. Multilingual level generation.
2. Language-aware word units for Latin, Cyrillic, Devanagari, Han, Kana and Hangul scripts.
3. Crossword intersection generation.
4. Circular swipe wheel generation.
5. PWA readiness.
6. Android APK wrapper readiness.
7. Store submission preparation.

## Core quality commands

```bash
npm run quality
npm run build
npm run verify
```

## Store readiness principle

No store build should be created until the readiness gates pass without blocking errors.
