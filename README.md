# 360 Navigator Mobile

Expo SDK 58 (React Native 0.88, New Architecture) app for 360 Performance
Navigator walkdowns. **Android is the first target; iOS follows.**

## Requirements

- Node.js **22.13+** (SDK 58 minimum)
- Android Studio + an emulator or a device (Android 7+), or an EAS account
- Expo Go for SDK 58 may not be in the stores yet, so use a **development build**.

## First-time setup

```bash
npm install                      # refreshes package-lock.json (unused deps were removed)
npx expo install expo-dev-client # needed for the "development" build profile
npx expo install --check         # aligns every Expo package with SDK 58
npm run doctor                   # expo-doctor
npm run typecheck
```

## Run on Android

Local build (needs Android Studio / SDK):

```bash
npm run android        # expo run:android -> builds and installs a dev build
npm start              # afterwards, just start Metro
```

Cloud build with EAS:

```bash
npm i -g eas-cli && eas login
npm run build:android:dev       # dev client APK (install once, then `npm start`)
npm run build:android:preview   # release-mode APK for testers
npm run build:android:prod      # signed AAB for Google Play
```

Release builds have **R8 minification enabled by default** in SDK 58. Smoke test
a `preview` build before submitting.

## Project layout

```
app/                     Expo Router routes ONLY (thin files that re-export screens)
  _layout.tsx            providers, splash, crypto bootstrap, heartbeat
  index.tsx              auth redirect
  auth/                  login route group
  main/                  signed-in Stack: index, asset-registry, my-assignment,
                         asset-review, create-asset, update-asset
src/
  auth/                  login, session helpers, auth slice & API
  common/                UI kit, header, layouts, hooks, API error handling
  lib/                   RTK Query base (encryption + token refresh), store, crypto
  main/modules/walkdown/ walkdown screens, API, form config, slices
  theme/colors.ts        raw colour values (keep in sync with global.css)
```

Routes are defined in `src/common/config/routes.ts` (`APP_ROUTES`).

## Before iOS

See `REVIEW.md` → "iOS checklist".
