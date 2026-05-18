# Lexora Android Packaging Plan

Status: **DECISION RECORDED — IMPLEMENTATION NOT STARTED**

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

## Required implementation stages

1. Add Capacitor dependencies.
2. Create Capacitor config.
3. Add Android project.
4. Configure package name.
5. Configure app name and icons.
6. Configure splash screen.
7. Build web assets.
8. Sync web assets to Android.
9. Generate debug APK for device QA.
10. Generate release AAB.
11. Configure signing.
12. Test install on real Android devices.
13. Complete Play Console internal testing.
14. Only then move toward production release.

## Package name draft

Draft package name:

```text
com.foxboxstudio.lexora
```

This must be finalized before creating release signing and Play Console listing.

## Commands to be introduced later

The project should later add scripts similar to:

```text
npm run android:init
npm run android:sync
npm run android:open
npm run android:build:debug
npm run android:build:release
```

These commands are not active yet.

## Release rule

Do not publish to Play Market until Capacitor Android build, signing, icons, screenshots, privacy policy, data safety, and real-device QA are complete.
