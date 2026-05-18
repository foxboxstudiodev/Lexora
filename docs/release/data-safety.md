# Lexora Data Safety Draft

Status: **DRAFT — MUST MATCH FINAL APP BEHAVIOR**

This document tracks the intended Play Console Data Safety answers. It is not final until the production app, monetization stack, and third-party SDKs are finalized.

## Current development-state answer

At the current development stage, Lexora stores gameplay data locally on device and does not implement account login, cloud sync, ads, analytics, or in-app purchases.

## Local gameplay data

Locally stored data includes:

- language selection;
- level progress;
- coins;
- daily reward state;
- settings;
- gameplay statistics;
- hint usage statistics.

This data is stored locally for gameplay continuity.

## Third-party SDK status

Current status:

- Ads SDK: not implemented.
- Analytics SDK: not implemented.
- Crash reporting SDK: not implemented.
- IAP SDK: not implemented.
- Cloud account system: not implemented.

## Required before Play Console submission

Before store submission, update this file after finalizing:

1. Ads / rewarded ads provider.
2. In-app purchase implementation.
3. Analytics/crash reporting decision.
4. Any cloud-save or account feature.
5. Any device identifiers or diagnostics collected by native wrappers.

## Release rule

Play Console Data Safety answers must be generated from the final production behavior, not from assumptions.
