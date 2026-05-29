# Lexora iOS Release Checklist

This checklist is the required iOS release contract for App Store submission.

## Native project

- `@capacitor/ios` is installed.
- `npm run ios:init` has created the native `ios/` project.
- `npm run ios:sync` completes successfully after production build.
- The app opens in Xcode with `npm run ios:open`.

## App identity

- Bundle identifier is final and consistent across Xcode, Apple Developer, and App Store Connect.
- App display name is `Lexora`.
- Version and build number are incremented before each TestFlight/App Store upload.
- Signing team and provisioning profile are configured.

## Store policy

- Privacy policy exists and matches shipped data collection behavior.
- App Store listing text exists.
- Data-safety/privacy declarations are reviewed for iOS.
- Third-party dictionary/license attribution is included where required.

## Assets

- iOS app icon is final, non-placeholder, and exported from the source brand asset.
- iPhone screenshots exist for required App Store sizes.
- iPad screenshots exist if iPad is supported.
- Splash screen and launch screen are production quality.

## Release gates

The following command must pass before App Store submission:

```bash
npm run verify:ios-store
```

The full final gate must also pass:

```bash
npm run verify:final
```
