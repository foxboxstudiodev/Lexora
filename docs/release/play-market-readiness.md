# Lexora Play Market / Store Readiness Gate

This document is the release checklist for Android / Play Market and future iOS packaging. It is intentionally strict: the project is not store-ready until every release item below is complete.

## Current status

Status: **NOT STORE READY**

The web/PWA build can deploy, but native-store packaging is not complete yet.

## Release documents currently present

The following release documents exist as drafts and must be finalized before publication:

- `docs/release/privacy-policy.md` — draft, not legal final.
- `docs/release/data-safety.md` — draft, must match final app behavior.
- `docs/release/store-listing.md` — draft, not final marketing copy.

## Required before Play Market release

1. Android packaging path selected and implemented: TWA or Capacitor.
2. Android app package name finalized.
3. AAB build generated and tested.
4. Signing key created and backed up securely.
5. App icon PNG assets generated at required Android densities.
6. Maskable icon PNG generated and verified.
7. Splash screen assets generated.
8. Play Store feature graphic generated.
9. Phone screenshots prepared for required device classes.
10. Tablet screenshots prepared or tablet support intentionally disabled.
11. Privacy policy finalized and linked.
12. Data safety answers finalized from real production behavior.
13. Ads / IAP / rewarded ads policy selected and implemented before monetized release.
14. Store listing title, short description, full description, tags, and category finalized.
15. Mobile QA completed on real Android devices.
16. iPhone viewport QA completed before iOS release path.
17. Final release command completed: build, tests, release gates, mobile QA, content QA, policy QA.

## Current known gaps

- PWA manifest currently has SVG icon only.
- PNG icon asset set is not present yet.
- Android native wrapper is not present yet.
- Privacy policy exists only as draft.
- Data safety declaration exists only as draft.
- Store listing exists only as draft.
- Store screenshots are not present yet.
- Monetization implementation is not present yet.
- AAB/signing/release upload flow is not present yet.

## Release rule

Do not publish until `npm run verify:store` passes and real-device QA is complete.
