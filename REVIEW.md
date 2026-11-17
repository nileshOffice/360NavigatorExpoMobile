# Code review & Android-first fixes

Scope: the whole repo (about 16k lines). Expo SDK 58, RN 0.88, React 19.3. These versions match the SDK 58 table, so I didn't change any versions.

> **Not run on a device.** Packages could not be installed where this review was done. The checks were: a TypeScript pass that confirmed every internal import resolves and there are no syntax errors, and a manual reading of every file. Run the "Verify" steps at the bottom before merging.

---

## 1. Critical bugs fixed

| # | Where | Problem | Fix |
|---|---|---|---|
| 1 | `app/` folder | Every file in `app/` is a **route** in Expo Router: slices, API files, components, types, and 16 empty files. This caused "missing default export" warnings and junk routes. It also gave URLs like `/main/modules/warkdown/screens/AssetRegistry`. | `app/` now holds **only routes** (11 thin files). All other code moved to `src/` with `@/src/...` imports. `warkdown` was renamed to `walkdown`. New URLs: `/main/asset-registry`, `/main/my-assignment`, `/main/asset-review`, `/main/create-asset`, `/main/update-asset`. |
| 2 | `lib/api/baseQuery.ts` | The token refresh dispatched `auth/updateCurrentUser`, an action that **did not exist**. The new token was never saved, so the retried request used the expired token, and the user was logged out every time the token expired. | Added an `updateCurrentUser` reducer and dispatch it. |
| 3 | `UpdateAssetDetail` → save | It sent an update for **every column the API returned**. Columns the app doesn't support resolved to `""`, so **saving blanked those fields on the server**. It also didn't check failures and always said "updated successfully". | It now sends only the supported fields that **changed**. Failures are collected and shown ("Partially updated: …"), and the form is kept so the user can retry. |
| 4 | `UpdateAssetDetail` → header back | The back effect re-ran on every keystroke after the back arrow had been pressed once. Typing then popped the "Discard changes?" dialog or left the screen. | New `useHeaderBackHandler` handles each press exactly once, only on the focused screen. |
| 5 | `CreateNewAsset` → photos | Device paths (`file://…`) were sent to `insertAssetDocuments`. **The photos were never uploaded.** | Files are uploaded first (`uploadFilesToRootFolder`, same folder `PMO/Asset` as the update flow), then the returned **server paths** are linked. |
| 6 | `UpdateAssetDetail` → photos | Photos already on the server (http URLs) were re-uploaded as files. This fails on Android and would duplicate them. Photo changes were also never detected, because the code compared the list with itself. | Only local photos are uploaded. Changes are compared against the server's photo list. |
| 7 | `CreateNewAsset` → save | If the asset saved but the photo step failed, the user saw "Save failed, try again". Retrying **duplicated the asset**. Double taps could also submit twice. | Save and photo errors are reported separately ("Asset created, photos could not be uploaded"). The buttons show a spinner and ignore taps while saving. |
| 8 | `Login` | When the server reported an existing session, the user was marked **authenticated before confirming**. Pressing *Cancel* still logged them in on the next launch. | Credentials are stored only after *Continue*, or when there is no existing session. |
| 9 | `Login` | If `loadApplicationData` failed at start-up (offline, cold server), the crypto keys were missing. `encryptData` then threw, and the user got a generic error forever. | `ensureCryptoConfigured()` retries the bootstrap call before login and shows a clear "can't reach server" message. |
| 10 | Logout | If the logout API failed (offline or expired session), the user was **stuck**, because the catch only logged the error. Cached sites, modules, drafts and RTK Query data also stayed for the next user. | The app always logs out locally. `resetSessionState()` clears every user-scoped slice and the API cache. |
| 11 | Persistence | The access token, session token and profile were stored in **plain AsyncStorage**. | The `auth` slice now lives in **SecureStore** (Android Keystore / iOS Keychain), split into chunks for the size limit. The old AsyncStorage key is deleted on start-up. |
| 12 | Review screen (`UpdateDeleteAsset`) | Opening a 2nd asset could show the **1st asset's photos**, because they came from persisted state and hydration was skipped. Every row said "Unchanged". | The form (fields and photos) is built in one step for the selected asset each time the screen gains focus. A loading state shows until the data arrives, and the Changed/Unchanged status is calculated. |
| 13 | `MyAssignment` | With zero assets, the empty state **hid the "Add New Asset" button**, so a new walkdown could never get its first asset. | The button is shown in the empty state too. |
| 14 | Lists after save | RTK Query cache: after creating or updating an asset, *My Assignment* still showed the old list. | Cache tags were added, so saves refresh the affected lists. |
| 15 | `Home` | Sites were **appended** to the previous list, so they duplicated on reload. | The list is replaced instead. |
| 16 | `SiteList` | `setCompanySelectedByUser(item)` was called without `dispatch`, so it did nothing. | Removed. *Select* is disabled until a site is picked. |
| 17 | `ActivityAssetInsList`, `AssetRegistry` | `item.id.toString()` in `keyExtractor` crashes when a new asset has `id = null`. | Keys are now null-safe. |
| 18 | `Card` | Passing `style` **replaced** the card's background and elevation (for example on the module cards). | Caller styles are now merged with the card's styles. |
| 19 | Heartbeat | Offline or 5xx `pingServer` errors popped a **blocking "Network Error" alert every 2 minutes**. | Background calls fail silently on network or server errors. Auth errors such as ConcurrentLogin still alert. Pings also stop while the app is in the background. |

## 2. Android-specific fixes

- **Navigation**: `main/` now uses a native **Stack** instead of `Slot`. This gives proper Android back behaviour and transitions, and screen state is kept when going back. `initialRouteName: "index"` means a restored route always has Home underneath it, so Back doesn't exit the app.
- **Hardware back**: wizards (create/update) go back step by step, and the sidebar closes on Back.
- **Edge-to-edge (Android 15+)**: added the bottom safe-area inset. Before this, the wizard and "Add New Asset" buttons sat **under the system nav bar**. The camera and preview overlays use real insets instead of a hard-coded `pt-14`.
- **Keyboard**: removed the fixed 100 px Android offset in `KeyboardAvoidingWrapper`. It now uses `padding`, which is the correct behaviour under edge-to-edge.
- **Bottom sheets**: the tree and list pickers use `BottomSheetFlatList`, so scrolling doesn't fight the sheet's pan-to-close gesture. I also removed `removeClippedSubviews`, which blanks rows on Android.
- **Read-only "select" fields**: these were tappable only through `onPress` on a non-editable `TextInput`, which doesn't fire reliably on Android. The whole field is now a `Pressable`.
- **Permissions / Play policy**: the gallery picker no longer asks for media permission, because the system photo picker needs none. `READ_MEDIA_*`, storage, `RECORD_AUDIO` and `SYSTEM_ALERT_WINDOW` are **blocked** in `app.json`. Requesting them triggers Google Play's photo/video permission review. The camera has a usage string and audio is off.
- **Dark mode**: the UI is hard-coded light, but `userInterfaceStyle` was `automatic`. On dark-mode phones only some `dark:` classes applied, which gave a mixed UI. It is set to `light` until a dark theme is designed. A `StatusBar style="dark"` was added.
- **Splash screen**: it stays up until the encryption keys load, instead of showing a blank white screen.
- **New Architecture**: removed `UIManager.setLayoutAnimationEnabledExperimental`, which does nothing in RN 0.88 and only logs warnings.
- **`app.json`**: added `android.package` and `ios.bundleIdentifier`, `versionCode` and `buildNumber`, and `allowBackup: false` so tokens aren't backed up. Removed plugins for packages that aren't used.
- **`eas.json`**: added `development` (dev client APK), `preview` (APK) and `production` (AAB) profiles.

## 3. Optimisations and clean-up

- Removed all `debugger;` statements (6) and the `console.log`s that printed full API responses, tokens and form data. Dev logs now show only URL and status.
- Removed the dead `apiLoader/*` actions (2 extra Redux dispatches on every request, with no reducer).
- Persist writes are throttled (500 ms). Before, every keystroke in the wizard wrote to storage.
- `MyAssignment`: the list split uses `useMemo` instead of state plus an effect (one less render pass).
- `AppTreeView`: expanded nodes use a `Set` for O(1) lookups instead of `Array.includes` per row. **Search now auto-expands matches**; before, matches inside collapsed parents were invisible.
- `Card` elevation went from 10 to 3, which is cheaper in long lists and looks closer to the iOS shadow.
- `Toast` no longer reads the private `Animated.__getValue()` during render, and it is positioned with safe-area insets.
- `Button`: fixed the title using the wrong size key, removed the empty wrapper when there are no children, and `leftIcon`/`rightIcon` now render.
- iOS date picker: **Cancel now really cancels**. Before, changes applied while the wheel was scrolling.
- Header, sidebar, upload: `Dimensions.get` was replaced with `useWindowDimensions`. Icon-family map is now built once.
- Upload helper: it now gets a valid extension from the file name, then the URI, then the MIME type, because Android often returns `fileName: null`. Photo quality is 0.7 (about 1–2 MB). iOS returns JPEG instead of HEIC.
- Removed unused dependencies: `axios`, `expo-haptics`, `expo-symbols`, `expo-web-browser`, `expo-image`, `@react-navigation/bottom-tabs`, `@react-navigation/elements` and `json-server`. `@types/crypto-js` moved to dev deps. Removed the dead `reset-project` script.
- Deleted dead code: 16 empty files, the dummy `drawerData` and `locationDummyData`, `SessionExpiredDialog`/handler (`sessionExpired` was never set to true), and the duplicate `appConfig`.

## 4. Please confirm (not changed, or changed with an assumption)

1. **Package name `com.assetanalytix.navigator360`**: it cannot be changed after the first Play Store upload. Edit `app.json` if you want a different one.
2. **Photo folder for new assets**: uses `PMO/Asset`, `objectId "0"` and `fileFlag "I"`, copied from the existing update flow. Confirm the create flow uses the same values on the backend.
3. **Site change (`Home.handleSiteSubmit`)**: `id23` sends the *current* (old) `siteId`, as the original code did. If the backend expects the **new** site, change it to `selectedSite.id`.
4. **Delete Asset / Submit Asset** on the review screen have no API behind them. They are now **disabled** instead of being dead buttons.
5. **Existing installs** will need to sign in once, because auth moved to SecureStore.
6. `visitFlag` (`companyCode === "RELWEB"`) is now set on every login path, not only the "start new session" path. Nothing reads it yet.

## 5. Known remaining items (not blocking Android)

- `CreateNewAsset.tsx` (≈1.6k lines) and `UpdateAssetDetail.tsx` (≈2.2k lines) are ~70 % duplicated. They should share a `useAssetWizard` hook and a `<AssetFieldRenderer>` component. I didn't do that here, to keep this change reviewable.
- Many `any` types in API responses. Typing `currentUser` and the module and site DTOs would catch real bugs.
- `CalculateAssetEcr` is a placeholder screen.
- Search inputs inside bottom sheets use the plain `TextInput`. If the keyboard covers them on small phones, switch to `BottomSheetTextInput`.
- Consider `react-native-keyboard-controller` for the most reliable keyboard handling under edge-to-edge.
- Strip `console.error` in release builds (for example with `babel-plugin-transform-remove-console`).

## 6. iOS checklist (next phase)

- [ ] `npx expo run:ios`. SDK 58 needs Xcode 26.4+ and iOS 16.4+, and is built for iOS 27 (scene life cycle).
- [ ] Confirm the `bundleIdentifier`, signing team and App Store Connect app.
- [ ] Export compliance: the app does its own AES payload encryption. Answer `ITSAppUsesNonExemptEncryption` deliberately; it is not set yet.
- [ ] Wizard screens have `gestureEnabled: false`, so swipe-back can't skip steps. Check that this feels right.
- [ ] Test HEIC photos from the library. They should arrive as JPEG via `preferredAssetRepresentationMode: Compatible`.
- [ ] Check the date-picker bottom sheet layout. It has a dark overlay *inside* the sheet that should probably be removed.
- [ ] `KeyboardAvoidingView` on the login screen on small iPhones.
- [ ] SecureStore keychain behaviour after reinstall. Keychain items survive app deletion on iOS, unlike Android.

## Verify (run these first)

```bash
npm install
npx expo install expo-dev-client
npx expo install --check
npm run doctor
npm run typecheck
npm run lint
npm run android
```

Smoke test on a device: login (including the "already logged in" → Cancel and → Continue paths) → site pick → Asset Registry → My Assignment → **create an asset with a camera photo and a gallery photo** → confirm it appears in the list → open it → update one field and add one photo → check the server has the other fields unchanged → Android back on every screen → logout while offline.
