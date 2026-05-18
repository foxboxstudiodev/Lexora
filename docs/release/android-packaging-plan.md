# Lexora Android Packaging Plan

Status: **CAPACITOR BASELINE CONFIGURED — ANDROID PROJECT NOT GENERATED**

## Decision

Lexora will use **Capacitor** as the primary Android packaging path.

## Why Capacitor

Capacitor is the better primary path for Lexora because the product plan includes:

- Play Market release as an Android app;
- future ads;
- rewarded ads;
- future in-app purchases;
- native build/signing flow;
- possible native integrations later.

TWA remains acceptable for a simple PWA wrapper, but it is not the primary path for Lexora because monetization and native-store polish are planned.

## Current implementation state

Completed:

1. Capacitor path selected.
2. `capacitor.config.json` added.
3. App ID baseline set to `com.foxboxstudio.lexora`.
4. Web directory set to `dist`.
5. Android workflow scripts added to `package.json`.

Pending:

1. Add Capacitor dependencies.
2. Generate Android project folder.
3. Configure Android icons/splash.
4. Configure signing.
5. Build debug APK.
6. Build release AAB.
7. Test on real Android devices.
8. Complete Play Console internal testing.

## Required implementation stages

1. Add Capacitor dependencies.
2. Run `npm run android:init`.
3. Configure package name.
4. Configure app name and icons.
5. Configure splash screen.
6. Build web assets.
7. Sync web assets to Android.
8. Generate debug APK for device QA.
9. Generate release AAB.
10. Configure signing.
11. Test install on real Android devices.
12. Complete Play Console internal testing.
13. Only then move toward production release.

## Package name draft

Draft package name:

```text
com.foxboxstudio.lexora
```

This must be finalized before creating release signing and Play Console listing.

## Active scripts

```text
npm run android:init
npm run android:sync
npm run android:open
npm run android:copy
```

These scripts require Capacitor dependencies to be installed before use.

## Release rule

Do not publish to Play Market until Capacitor Android build, signing, icons, screenshots, privacy policy, data safety, and real-device QA are complete.
