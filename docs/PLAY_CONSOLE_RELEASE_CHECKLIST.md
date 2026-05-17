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

## Required before Play Console upload

```text
1. Confirm production URL opens on Android Chrome.
2. Confirm PWA install prompt works.
3. Confirm service worker registers.
4. Confirm all 13 languages open.
5. Confirm at least one level starts in each language.
6. Confirm wheel input works on touch.
7. Confirm wrong word release clears selection.
8. Confirm correct word fills crossword.
9. Confirm progress saves after refresh.
10. Generate Android AAB.
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
