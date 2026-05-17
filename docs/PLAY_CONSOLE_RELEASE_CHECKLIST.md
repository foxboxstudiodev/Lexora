# Lexora Play Console Release Checklist

## Current web deploy

```text
Vercel build: green
Production URL: https://lexora.vercel.app/
```

## Android package baseline

```text
App name: Lexora
Package name: com.foxboxstudio.lexora
Version name: 0.1.0
Version code: 1
Orientation: portrait
Recommended wrapper: TWA first, Capacitor second
Start URL: https://lexora.vercel.app/
```

## Mandatory verification before Play Console upload

```bash
npm install
npm run build:vercel
npm run verify:levels
```

## Required gameplay checks before AAB upload

```text
1. Confirm production URL opens on Android Chrome.
2. Confirm PWA install prompt works.
3. Confirm service worker registers.
4. Confirm all 13 languages open.
5. Confirm every language has 300 levels.
6. Confirm the 20-level wheel pattern repeats in every language.
7. Confirm level 1 / 21 / 41 / 281 use 4 selectable wheel units.
8. Confirm level 20 / 40 / 60 / 300 use 10 selectable wheel units.
9. Confirm wheel background allows vertical page scroll.
10. Confirm only letter buttons start swipe selection.
11. Confirm wrong word release clears selection.
12. Confirm correct word fills crossword.
13. Confirm every visible crossword word can be built from the wheel.
14. Confirm crossword words are cleanly intersected, not cramped into a word soup.
15. Confirm Hindi, Chinese, Japanese and Korean grid cells render by language units.
16. Confirm hints reveal correct language-unit cells.
17. Confirm progress saves after refresh.
18. Generate Android AAB.
```

## Exact wheel progression per 20-level block

```text
1  -> 4 selectable units
2  -> 4 selectable units
3  -> 5 selectable units
4  -> 5 selectable units
5  -> 5 selectable units
6  -> 5 selectable units
7  -> 6 selectable units
8  -> 6 selectable units
9  -> 6 selectable units
10 -> 6 selectable units
11 -> 7 selectable units
12 -> 7 selectable units
13 -> 7 selectable units
14 -> 7 selectable units
15 -> 8 selectable units
16 -> 8 selectable units
17 -> 8 selectable units
18 -> 9 selectable units
19 -> 9 selectable units
20 -> 10 selectable units
```

## Store listing assets

```text
App icon: 512x512 PNG
Feature graphic: 1024x500 PNG
Phone screenshots: minimum 2, recommended 8
Short description: up to 80 characters
Full description: up to 4000 characters
Privacy policy URL
Data safety answers
Content rating questionnaire
```

## Release track recommendation

```text
Internal testing first
Closed testing second
Production only after device QA
```
