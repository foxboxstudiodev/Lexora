# Lexora APK Wrapper Flow

This document defines the controlled APK preparation flow for Lexora.

## Current baseline

Lexora is a Vite/React PWA prepared for Android wrapping through a Trusted Web Activity baseline.

Current Android wrapper metadata:

```text
App name: Lexora
Package name: com.foxboxstudio.lexora
Version name: 0.1.0
Version code: 1
Wrapper strategy: TWA
Start URL: https://foxboxstudiodev.github.io/Lexora/
Orientation: portrait
Min SDK: 23
Target SDK: 35
```

## Required quality gates before APK generation

Run:

```bash
npm run quality
npm run build
```

The quality gate covers:

- language registry and word units;
- level generation and validation;
- runtime game engine;
- hints and economy;
- progress/save state;
- achievements, daily rewards and settings;
- PWA manifest and service worker readiness;
- Android wrapper readiness.

## APK readiness model

The APK readiness layer lives in:

```text
src/features/appWrapper/
```

Important files:

```text
androidWrapperConfig.ts
androidWrapperValidator.ts
apkReadinessReport.ts
apkReadinessSummary.ts
apkBuildChecklist.ts
```

The readiness result is split into three states:

```text
ready   - wrapper generation can proceed
warning - internal testing can proceed, but warnings must be fixed before store submission
blocked - APK generation must not proceed
```

## Required APK preparation checklist

1. Pass PWA readiness gate.
2. Validate Android wrapper config.
3. Generate Android wrapper project.
4. Test on a real Android phone.
5. Prepare signing key.
6. Upload to Play Console internal testing.

## Recommended wrapper strategy

Use Trusted Web Activity first because Lexora is already a PWA and is served from a stable HTTPS URL.

TWA advantages:

- smaller native layer;
- direct use of deployed PWA;
- easier updates for web content;
- Play Store compatible when configured correctly.

Capacitor can be used later if Lexora needs deeper native APIs.

## Release discipline

Every Play Store build must increase:

```text
versionCode
```

Example:

```text
0.1.0 (1) -> 0.1.1 (2)
```

Do not reuse an already uploaded versionCode.

## Device testing requirements

Before store submission, verify on a real Android device:

- app opens from launcher;
- start URL loads correctly;
- service worker/offline fallback works;
- touch swipe letter selection works;
- level completion works;
- save/progress persists after closing app;
- back navigation does not trap the user;
- portrait orientation is stable;
- install icon appears correctly.

## Play Console path

Use this order:

1. Internal testing
2. Closed testing if needed
3. Production release

Never publish directly to production without internal testing.
