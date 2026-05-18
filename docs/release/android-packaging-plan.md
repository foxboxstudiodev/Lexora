# Lexora Android Packaging Plan

Status: **CAPACITOR DEPENDENCIES CONFIGURED — ANDROID PROJECT NOT GENERATED**

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
2. Capacitor dependencies added.
3. `capacitor.config.json` added.
4. App ID baseline set to `com.foxboxstudio.lexora`.
5. Web directory set to `dist`.
6. Android workflow scripts added to `package.json`.
7. Capacitor setup gate added.

Pending:

1. Generate Android project folder.
2. Configure Android icons/splash.
3. Configure signing.
4. Build debug APK.
5. Build release AAB.
6. Test on real Android devices.
7. Complete Play Console internal testing.

## Required implementation stages

1. Run `npm run android:init`.
2. Configure package name.
3. Configure app name and icons.
4. Configure splash screen.
5. Build web assets.
6. Sync web assets to Android.
7. Generate debug APK for device QA.
8. Generate release AAB.
9. Configure signing.
10. Test install on real Android devices.
11. Complete Play Console internal testing.
12. Only then move toward production release.

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

## Release rule

Do not publish to Play Market until Capacitor Android build, signing, icons, screenshots, privacy policy, data safety, and real-device QA are complete.
