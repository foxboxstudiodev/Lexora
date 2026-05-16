# Lexora Cross-Platform Wrapper Flow

This document defines the cross-platform wrapper preparation flow for Lexora.

Lexora currently targets:

```text
Android: Trusted Web Activity baseline
iOS: Capacitor/WebView baseline
```

## Core readiness gate

The unified wrapper readiness gate lives in:

```text
src/features/appWrapper/appWrapperReadinessGate.ts
```

It combines:

```text
PWA readiness
Android wrapper readiness
iOS wrapper readiness
cross-platform readiness summary
```

The gate outputs:

```text
canProceedAndroid
canProceedIos
canProceedAnyPlatform
summary.status
formatted report
```

## Status meanings

```text
ready   - Android and iOS wrapper paths are ready
partial - only one platform is ready
blocked - no platform should proceed
```

## Android path

Primary Android strategy:

```text
TWA
```

Android config:

```text
src/features/appWrapper/androidWrapperConfig.ts
```

Android readiness files:

```text
androidWrapperValidator.ts
apkReadinessReport.ts
apkReadinessSummary.ts
apkBuildChecklist.ts
```

Before Android wrapper generation:

```text
npm run quality
npm run build
```

Required Android checks:

```text
packageName
versionName
versionCode
startUrl
allowedOrigins
minSdkVersion
targetSdkVersion
PWA readiness
```

## iOS path

Primary iOS strategy:

```text
Capacitor
```

iOS config:

```text
src/features/appWrapper/iosWrapperConfig.ts
```

iOS readiness files:

```text
iosWrapperValidator.ts
iosReadinessReport.ts
iosReadinessSummary.ts
```

Required iOS checks:

```text
bundleId
versionName
buildNumber
startUrl
allowedOrigins
minimumIosVersion
PWA readiness
```

## Recommended execution order

1. Pass `npm run quality`.
2. Pass `npm run build`.
3. Generate Android wrapper first.
4. Test Android on a real phone.
5. Prepare Android signing.
6. Upload Android internal test build.
7. Generate iOS wrapper after Android path is stable.
8. Test iOS on a real iPhone.
9. Prepare App Store assets and submission metadata.

## Release discipline

Android:

```text
versionCode must increase for every uploaded Play Console build.
```

iOS:

```text
buildNumber must increase for every uploaded App Store Connect build.
```

## Real device test matrix

Before any store upload, test:

```text
fresh install
launcher open
first level play
letter swipe
hint usage
bonus word reward
level completion
save after app close
offline fallback
orientation stability
back navigation
install icon
```

## Current priority

Android wrapper path is the first store path. iOS remains prepared but secondary until the Android path is validated on a physical device.
