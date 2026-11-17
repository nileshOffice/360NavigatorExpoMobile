# 360 Navigator Mobile — UI/UX Audit

> Date: 2026-11-17 · Branch `feature/UpdatedaAssetIsuue` (with the uncommitted working tree)
> Scope: the live code in `src/` and the route files in `app/`. The legacy copies under `app/` are not run and are not audited.
> Method: static code review only. **No files were modified.** Items marked *verify on device* depend on runtime behaviour that can't be confirmed by reading the code.
> Constraint for every fix: keep the existing colours, backgrounds, theme tokens, Tailwind/NativeWind config, brand and typography. Reuse the existing components and `react-native-safe-area-context`. No new UI library.

**Priority:** **P1 – High** (blocks the user, or content/buttons unreachable) · **P2 – Med** (visible defect or friction) · **P3 – Low** (polish).

---

## 0. What is already right (keep as is)

| Area | Where | Why it's good |
|---|---|---|
| Single safe-area container | `src/common/layouts/AppLayout.tsx:24` | One `SafeAreaView` with `top/left/right/bottom` edges wraps the header and every `/main` screen. There's no nesting, and fixed footers (wizard buttons, Submit Asset) already sit above the home indicator and Android navigation bar. |
| Auth safe area | `src/common/layouts/AuthLayout.tsx:13` | Same pattern for Login. |
| Status bar | `app/_layout.tsx:93` | `StatusBar style="dark"` on a light background works for both platforms, including edge-to-edge Android. |
| Toast position | `src/common/components/ui/toast/Toast.tsx:152` | `top: insets.top + 12` clears the notch and Dynamic Island. |
| Camera overlay | `src/common/components/ui/UploadSection/ImageUpload.tsx:292,332` | Header and capture button use the insets. |
| Android back | `Sidebar.tsx:64`, `useHeaderBackHandler` | Back closes the drawer and steps back through the wizards. |
| Touch sizes | `Button` (min 56), `Input` (56), `AppTabs` (min 70), camera buttons (44) | Meet the 44 pt (iOS) and 48 dp (Android) minimums. |
| Android config | `app.json` | Portrait lock, `predictiveBackGestureEnabled:false`, blocked permissions. |

There is **no bottom tab bar** in the app. The only floating action is the "Add New Asset" button in My Assignment (UX-10).

---

## 1. Issues

### P1 – High

#### UX-01 · AppModal becomes invisible but still blocks all touches
- **Screen/component:** `AppModal` → Asset Registry safety-guidelines modal
- **File:** `src/common/components/ui/AppModal/AppModal.tsx:96-114`, `src/main/modules/walkdown/screens/AssetRegistry.tsx:354-358`
- **Problem:** `handleClose` fades the content to opacity 0 and then calls `onClose`, but the parent never sets `visible` to `false`: AssetRegistry's `onClose` dispatches `setSafetyAcknowledged(false)`, which leaves it unchanged. The native `<Modal>` stays mounted, its content is invisible, and it intercepts every touch. `closeOnBackdropPress` defaults to `true`, so this happens on a backdrop tap.
- **iOS impact:** Tapping outside the safety card makes it disappear, and the screen then looks frozen.
- **Android impact:** The same happens, and the hardware back button also triggers it (`onRequestClose={handleClose}`).
- **Recommended fix:** Drive the hide animation only from the `visible` prop. Have `handleClose` just call `onClose()`, and keep the Modal mounted until the out-animation finishes. For the safety modal, pass `closeOnBackdropPress={false}` and make `onRequestClose` a no-op, because the user must tap "I Agree".
- **Priority:** P1

#### UX-02 · Safety modal content can't scroll; the "I Agree" button can be cut off
- **Screen/component:** Asset Registry safety modal (`AppModal`, center)
- **File:** `AppModal.tsx:228-243` (`maxHeight:'85%'`, `overflow:'hidden'`), `AssetRegistry.tsx:360-388`
- **Problem:** The icon, heading, guideline rows (up to 4 lines each) and button are in a non-scrolling view that is clipped at 85 % of the screen height.
- **iOS impact:** On iPhone SE/mini, or with larger Dynamic Type, the button is clipped, so the user can't acknowledge and can't use the module.
- **Android impact:** The same on small (≤ 640 dp tall) devices or with a large font scale.
- **Recommended fix:** Wrap the `AppModal` content area in a `ScrollView` (`flexGrow` content, `bounces={false}`), so long content scrolls while the button stays reachable. No visual change.
- **Priority:** P1

#### UX-03 · Create Asset wizard steps don't scroll
- **Screen/component:** Create New Asset (field steps)
- **File:** `src/main/modules/walkdown/screens/CreateNewAsset.tsx:1379` (`<View className="flex-1">{renderCurrentStep()}</View>`)
- **Problem:** Field steps render in a plain `View`. When a step has more fields than fit (section header, several inputs and the photo uploader), the lower fields are clipped behind the footer buttons. Update Asset wraps the same content in a `ScrollView` (`UpdateAssetDetail.tsx:1784`). Only Create's review step scrolls.
- **iOS impact:** On smaller iPhones, lower fields and photos are unreachable.
- **Android impact:** The same; the effect is worse with three-button navigation because there is less height.
- **Recommended fix:** Use the same `ScrollView` block as `UpdateAssetDetail.tsx:1784-1796` (`flex-1`, `keyboardShouldPersistTaps="handled"`, `paddingBottom: 24`). Keep the footer outside the scroll view.
- **Priority:** P1

#### UX-04 · The keyboard covers inputs in the Create and Update wizards
- **Screen/component:** Create New Asset, Update Asset (text and number fields)
- **File:** `CreateNewAsset.tsx:1344-1429`, `UpdateAssetDetail.tsx:1784`
- **Problem:** There is no keyboard handling (no `KeyboardAvoidingView` and no keyboard insets). Fields in the lower half of the form are hidden when the keyboard opens.
- **iOS impact:** The keyboard does not resize the window, so the focused input sits under the keyboard and the user types blind.
- **Android impact:** This depends on whether Android resizes the window for the keyboard under edge-to-edge (`softwareKeyboardLayoutMode` is not set in `app.json`). *Verify on device* with gesture and three-button navigation.
- **Recommended fix:** After UX-03, set `automaticallyAdjustKeyboardInsets` on both wizard `ScrollView`s. This built-in prop makes iOS scroll the focused input into view. On Android, confirm the window resizes for the keyboard; if it doesn't, reuse `KeyboardAvoidingWrapper` with the offset fix from UX-05.
- **Priority:** P1

#### UX-05 · Bottom sheets ignore the bottom safe area (home indicator / navigation bar)
- **Screen/component:** `AppBottomSheet`, used by:
  - the site picker ("Select")
  - the location, class and list pickers ("Continue")
  - the Create/Update confirmations ("Yes / Cancel")
  - Login "already logged in" ("Continue / Cancel")
  - the iOS date picker
- **File:** `src/common/components/ui/bottom_sheet/BottomSheet.tsx:69-81` (`pb-8`, no insets)
- **Problem:** `BottomSheetModal` is drawn from the bottom edge of the screen. Its content uses a fixed 32 px bottom padding and no `topInset`.
- **iOS impact:** Buttons sit right on top of the 34 pt home indicator, so the home swipe gesture can conflict with them. The 87 % sheet can reach under the status bar on short devices.
- **Android impact:** With three-button navigation (48 dp) and edge-to-edge, the last button is partly **behind the navigation bar**.
- **Recommended fix:** In `AppBottomSheet` only, read `useSafeAreaInsets()`. Set content `paddingBottom: insets.bottom + 16`, and pass `topInset={insets.top}` so tall sheets stop below the status bar. Every sheet gets the fix from this one place.
- **Priority:** P1

#### UX-06 · My Assignment: the screen doesn't scroll, and the floating "Add New Asset" button covers the content
- **Screen/component:** My Assignment
- **File:** `src/main/modules/walkdown/screens/MyAssignment.tsx:198-308`
- **Problem:** The heading, three accordion headers (`h-20` each) and an expanded list (`max-h-80` = 320 px) are stacked in a non-scrolling view. The "Add New Asset" button is absolutely positioned (`absolute bottom-2`) on top of them, and there is no bottom padding reserved for it.
- **iOS impact:** On iPhone SE/mini (about 520 pt usable), the button hides the bottom of the expanded list and the "Completed" accordion header.
- **Android impact:** The same on 360×640 dp devices.
- **Recommended fix:** Lay the screen out as a column: content in a `flex-1` area (accordions scroll), then the button as a normal footer (`py-3`, as in the wizards). If the floating style is preferred, keep it but add bottom padding equal to the button height (≈ 56 + 24) to the content.
- **Priority:** P1

### P2 – Med

#### UX-07 · `KeyboardAvoidingWrapper` uses offset 0 under the header and safe area
- **Screen/component:** Login (and any future screen that uses the wrapper)
- **File:** `src/common/components/ui/KeyboardAvoidingWrapper.tsx:20-27`
- **Problem:** `keyboardVerticalOffset={0}`. `KeyboardAvoidingView` measures its position relative to its parent, so content above it isn't accounted for. That content is the top inset plus padding (Login), or the top inset, the 56 pt header and padding (`/main` screens). The padding added for the keyboard comes out short by that amount.
- **iOS impact:** On small iPhones, the Login button and the bottom of the password field stay under the keyboard until the user scrolls.
- **Android impact:** Smaller, because Android can also resize the window. *Verify on device.*
- **Recommended fix:** Add an optional `keyboardVerticalOffset` prop (default: `insets.top`). Login passes `insets.top + 20`; `/main` screens would pass `insets.top + 56 + 12`.
- **Priority:** P2

#### UX-08 · The bottom-sheet title block takes half the sheet's height
- **Screen/component:** `AppBottomSheet` (every sheet)
- **File:** `BottomSheet.tsx:82` (`<View className="mb-5 flex-1">`)
- **Problem:** The title/description wrapper is always rendered with `flex-1`, even when there is no title.
  - Content that also uses `flex-1` (the site list, pickers) gets only about half of the sheet.
  - Content without `flex-1` (confirmations) is pushed down, leaving a large empty gap above it.
  - Home's `View className="flex-1 h-150"` (`Home.tsx:311`) uses a fixed 600 px height inside a 75 % sheet, which conflicts with this.
- **iOS / Android impact:** The same on both: lists are cramped, sheets look unbalanced, and on small screens content overflows.
- **Recommended fix:** Render the header block only when `title` or `description` is set, and remove its `flex-1` (keep `mb-5`). In Home, drop `h-150` and keep `flex-1`.
- **Priority:** P2

#### UX-09 · Android back doesn't close bottom sheets
- **Screen/component:** `AppBottomSheet`
- **File:** `BottomSheet.tsx` (no `BackHandler`)
- **Problem:** `@gorhom/bottom-sheet` modals don't listen to the hardware back button. Back reaches the screen instead: inside the wizards, `useHeaderBackHandler` steps the wizard back while the picker sheet stays open on top.
- **iOS impact:** None.
- **Android impact:** Back seems to do the wrong thing, and sheets can be left open over a different step.
- **Recommended fix:** While `visible`, register a `BackHandler` listener that dismisses the sheet and returns `true`. This is the same pattern as `Sidebar.tsx:64`. Skip it when the sheet must not be dismissed (the forced site selection).
- **Priority:** P2

#### UX-10 · The keyboard covers footer buttons in sheets that have a search field
- **Screen/component:** Site picker, Asset list picker, Location/Class tree picker
- **File:** `SiteList.tsx:88`, `AssetSelectionDrawer.tsx:199`, `AppTreeView.tsx:735`, `SearchInput.tsx:28`, `BottomSheet.tsx:69`
- **Problem:** These search fields are plain `TextInput`s inside a `BottomSheetModal`, and the sheet has no keyboard settings (`keyboardBehavior`, `keyboardBlurBehavior`, `android_keyboardInputMode`).
- **iOS impact:** While searching, the keyboard hides the bottom of the list and the "Select" / "Continue" button, and the user has to close the keyboard first.
- **Android impact:** The same, or the sheet jumps unpredictably. *Verify on device.*
- **Recommended fix:**
  - On `AppBottomSheet`, set `keyboardBehavior="interactive"`, `keyboardBlurBehavior="restore"` and `android_keyboardInputMode="adjustResize"`.
  - Give `SearchInput` an option to render `BottomSheetTextInput`, which is already in the installed `@gorhom/bottom-sheet`, when it is used inside a sheet.
- **Priority:** P2

#### UX-11 · Number fields open the text keyboard
- **Screen/component:** Create / Update wizards, number fields (`flag === 2`)
- **File:** `CreateNewAsset.tsx:622-635` (`type="text"`), and the equivalent block in `UpdateAssetDetail.tsx`
- **Problem:** `AssetFormField` supports `type="number"` (it sets `keyboardType="numeric"`), but the number branch passes `type="text"`.
- **iOS / Android impact:** The full keyboard opens for numeric values, which is slower and lets letters be entered.
- **Recommended fix:** Pass `type="number"` in the `flag === 2` branch on both screens.
- **Priority:** P2

#### UX-12 · Asset rows in My Assignment overflow horizontally
- **Screen/component:** `ActivityAssetInsList` (the asset rows inside My Assignment)
- **File:** `src/main/modules/walkdown/components/ActivityAssetInsList.tsx:54-104`
- **Problem:**
  - Values such as manufacturer, model and serial number sit in `flex-row` views with no `flex-1`, `shrink` or `numberOfLines`, so long values run past the card edge.
  - `ga--2` is not a valid class, so the intended gap is missing.
  - Location uses `w-[75%]` of an auto-width row.
  - Rows give no press feedback.
- **iOS / Android impact:** Text is clipped or overflows on narrow phones and with large fonts, and the rows don't feel tappable.
- **Recommended fix:**
  - Give the value text `className="flex-1"` (or `shrink`) with `numberOfLines={1}`.
  - Replace `ga--2` with `gap-1`.
  - Remove the percentage width from Location.
  - Add pressed feedback (`android_ripple` / pressed opacity, as `Card` does).
- **Priority:** P2

#### UX-13 · Header menu and back buttons are below the minimum touch size
- **Screen/component:** App header
- **File:** `src/common/components/app_components/Header.tsx:69-99` (`h-10 w-10`, no `hitSlop`)
- **Problem:** The tap area is 40 × 40.
- **iOS impact:** Below the 44 pt guideline, which is easy to miss near the Dynamic Island area.
- **Android impact:** Below the 48 dp guideline.
- **Recommended fix:** Add `hitSlop={8}` to both `Pressable`s. The visible size doesn't change.
- **Priority:** P2

#### UX-14 · Sidebar: small close button, a dead "My Profile" row, and no close animation
- **Screen/component:** Sidebar (drawer)
- **File:** `src/common/components/ui/Sidebar.tsx:141-143, 193-203, 212-235`
- **Problem:**
  - The close button is 36 × 36 with no `hitSlop`.
  - "My Profile" calls `onProfilePress`, which is never passed in, so tapping it does nothing.
  - `if (!visible) return null` unmounts the drawer immediately, so the slide-out animation never runs.
  - The rows have no `accessibilityRole` or labels.
- **iOS / Android impact:** Missed taps, a row that appears broken, and an abrupt close. Screen readers can't announce the menu items.
- **Recommended fix:**
  - Add `hitSlop={8}` to the close button.
  - Hide or disable "My Profile" until it is wired up.
  - Keep the drawer mounted until the close animation finishes (unmount in the `withTiming` callback).
  - Add `accessibilityRole="button"` and labels.
- **Priority:** P2

#### UX-15 · Selected site isn't highlighted in the site picker
- **Screen/component:** Site picker (`SiteList`) / `Card`
- **File:** `src/main/modules/common/SiteList.tsx:110`, `src/common/components/ui/Card/Card.tsx:18,52`
- **Problem:** `Card` always applies an inline `backgroundColor: "#FFFFFF"` through `style`, and inline style overrides the className. The `bg-primary-light` that SiteList adds for the selected site never shows, so the only cue is a faint border.
- **iOS / Android impact:** Users can't easily see which site they picked before tapping "Select".
- **Recommended fix:** Let a caller's `bg-*` class take effect. Either move the default white into `BASE_CLASSES` as `bg-card` (`--color-card` is `#FFFFFF`, so it looks the same), or have SiteList pass the selected background through `style`. This uses the existing tokens and changes no colours.
- **Priority:** P2

#### UX-16 · Toasts appear underneath open bottom sheets and modals
- **Screen/component:** `ToastProvider` / root providers
- **File:** `app/_layout.tsx:91-92`, `ToastProvider.tsx:119`
- **Problem:** `BottomSheetModalProvider` wraps `ToastProvider`, and sheets render in that provider's host *after* its children, so above the toast. Native `<Modal>`s (`AppModal`, camera, photo preview) also always cover the toast.
- **iOS / Android impact:** A success or error toast raised while a sheet or modal is open (for example from a picker or confirmation sheet) is hidden behind it or the backdrop. *Verify on device.*
- **Recommended fix:** Render the toast host above the sheet host, for example by swapping the order so `ToastProvider` wraps `BottomSheetModalProvider`. Close confirmation sheets before showing result toasts, as Update Asset already does.
- **Priority:** P2

#### UX-17 · iOS date-picker sheet: double dimming and too little height
- **Screen/component:** `AppDatePicker` (iOS)
- **File:** `src/common/components/ui/AppDatePicker.tsx:217-276`
- **Problem:**
  - Inside the sheet there is an extra `bg-black/40` wrapper and a second rounded white card, on top of the sheet's own backdrop and background.
  - The sheet snap point is 35 %, while the content needs a 56 pt header, a 180 pt spinner and padding, about 280 pt.
- **iOS impact:** A dark band appears inside the sheet, and on iPhone SE/mini (35 % ≈ 233 pt) the spinner is clipped.
- **Android impact:** None (Android uses the native dialog).
- **Recommended fix:** Remove the inner `bg-black/40` wrapper and the duplicate rounded card, and render the header and spinner directly in the sheet. Use the `medium` size, or a dynamic size, for this sheet.
- **Priority:** P2

#### UX-18 · Tablets: layouts stretch to the full width
- **Screen/component:** All screens (Login, wizards, lists)
- **File:** `app.json` (`ios.supportsTablet: true`), `AppLayout.tsx:30`, `AuthLayout.tsx:13`
- **Problem:** The iPad build is enabled, but there is no maximum content width. Inputs, cards and buttons span the whole width, up to 1,024 pt.
- **iOS impact:** On iPad the app looks stretched and is hard to scan.
- **Android impact:** The same on Android tablets and foldables.
- **Recommended fix:** In `AppLayout` and `AuthLayout`, wrap the content in a centred container (`w-full max-w-2xl self-center`). If tablets are out of scope, set `supportsTablet: false` instead.
- **Priority:** P2 for iPad, P3 otherwise

### P3 – Low

#### UX-19 · Login "Next" key doesn't move to the next field
- **Screen/component:** Login
- **File:** `src/auth/screens/Login.tsx:175-217`
- **Problem:** `returnKeyType="next"` is set, but there are no refs or `onSubmitEditing` handlers to focus the next input.
- **iOS / Android impact:** Pressing "Next" just closes the keyboard, so the user has to tap each field.
- **Recommended fix:** Use refs (`Input` already forwards one) and `onSubmitEditing={() => nextRef.current?.focus()}`, plus `submitBehavior="submit"` on the first two fields.
- **Priority:** P3

#### UX-20 · My Assignment summary row: fixed-width pill and an overlapping illustration
- **Screen/component:** My Assignment
- **File:** `MyAssignment.tsx:202` (`w-[35%]`), `MyAssignment.tsx:209-215` (`absolute -right-3 -top-5`, `zIndex 999`)
- **Problem:** The "Total Asset" pill has a percentage width, so the text wraps or clips on narrow screens or with large fonts. The decorative SVG sits above the heading and can cover it on 320–360 wide screens.
- **iOS / Android impact:** Cramped or overlapping header on small devices.
- **Recommended fix:** Use `self-start` instead of a percentage width, and lower the illustration's z-order (or hide it below a minimum width). `pointerEvents="none"` already prevents it from blocking taps.
- **Priority:** P3

#### UX-21 · Submit Asset screen: uneven action buttons and a conflicting status-pill width
- **Screen/component:** Submit Asset (`UpdateDeleteAsset`)
- **File:** `src/main/modules/walkdown/components/UpdateDeleteAsset.tsx:454, 514-556`
- **Problem:** With Delete commented out, "Update Assets" is the only button in a `justify-around` row, so it is auto-width and centred, while "Submit Asset" below is full width. The status pill also combines `w-[22%]` with `flex-1`.
- **iOS / Android impact:** Two primary actions with inconsistent widths look unpolished.
- **Recommended fix:** Give "Update Assets" `fullWidth` (or `flex-1`) while it is the only button in the row. Use either `w-[22%]` or `flex-1` on the pill, not both.
- **Priority:** P3

#### UX-22 · Header shadow is applied to a view with no background
- **Screen/component:** App header
- **File:** `Header.tsx:60, 131-144`
- **Problem:** `elevation` and the shadow props are set on a view that has no background colour.
- **iOS impact:** iOS draws a faint shadow around the icon and title glyphs instead of under the bar.
- **Android impact:** Elevation without a background casts no shadow, so the header looks flat.
- **Recommended fix:** Give the header view the **same** background it shows now (`colors.background`, `#F8FAFC`). The appearance stays the same and the shadow renders correctly.
- **Priority:** P3

#### UX-23 · Image upload: missing accessibility labels and edge cases
- **Screen/component:** `ImageUpload` (camera, preview, thumbnails)
- **File:** `src/common/components/ui/UploadSection/ImageUpload.tsx:294-340, 369, 432, 525`
- **Problem:**
  - Icon-only buttons (back, flip camera, capture, close preview, remove photo) have no `accessibilityRole` or `accessibilityLabel`.
  - The preview hint uses `bottom-10` without the bottom inset.
  - The Android full-screen `Modal` may add the status-bar inset twice. *Verify on device.*
- **iOS / Android impact:** Screen readers announce unlabeled buttons. The hint is close to the home indicator or navigation bar.
- **Recommended fix:**
  - Add roles and labels ("Close camera", "Switch camera", "Take photo", "Remove photo").
  - Change the hint to `bottom: insets.bottom + 24`.
  - Check the camera header padding on an Android device.
- **Priority:** P3

#### UX-24 · Large font sizes clip text in fixed-height elements
- **Screen/component:** `Input`, the My Assignment accordion headers, pills
- **File:** `Input.tsx:62, 85` (`h-14` and `h-12`), `MyAssignment.tsx:237` (`h-20`), `MyAssignment.tsx:202`
- **Problem:** Fixed heights don't grow with the system font size.
- **iOS / Android impact:** At accessibility font sizes, text inside these elements is clipped vertically.
- **Recommended fix:** Use `min-h-*` instead of `h-*` on these containers (the default look is the same). Test with the largest font scale.
- **Priority:** P3

#### UX-25 · Bottom variant of `AppModal` ignores the bottom inset (not used yet)
- **Screen/component:** `AppModal` with `position="bottom"`
- **File:** `AppModal.tsx:245-262, 296-299`
- **Problem:** The bottom variant sits at `bottom: 0` with 20 px padding and no inset. `navigationBarTranslucent` isn't set, while `statusBarTranslucent` is.
- **iOS / Android impact:** None today, because only the center variant is used. Any future bottom modal would overlap the home indicator or navigation bar.
- **Recommended fix:** Add `paddingBottom: insets.bottom + 20` for the bottom variant, and set `navigationBarTranslucent` so Android matches the status-bar behaviour.
- **Priority:** P3

---

## 2. Summary

| Priority | Issues |
|---|---|
| **P1 – High** (6) | UX-01 invisible blocking modal · UX-02 safety modal can't scroll · UX-03 Create steps don't scroll · UX-04 keyboard covers wizard inputs · UX-05 sheets ignore the bottom safe area · UX-06 My Assignment overflow and floating button |
| **P2 – Med** (12) | UX-07 KAV offset · UX-08 sheet title `flex-1` · UX-09 Android back in sheets · UX-10 keyboard in sheet search · UX-11 numeric keyboard · UX-12 asset row overflow · UX-13 header tap size · UX-14 Sidebar · UX-15 site highlight · UX-16 toast under sheets · UX-17 iOS date sheet · UX-18 tablets |
| **P3 – Low** (7) | UX-19 Login Next key · UX-20 assignment summary row · UX-21 submit buttons · UX-22 header shadow · UX-23 image upload accessibility · UX-24 font scaling · UX-25 bottom AppModal |

Files touched by the fixes:
- **Shared components (10):** `AppModal`, `BottomSheet`, `KeyboardAvoidingWrapper`, `Header`, `Sidebar`, `Card`, `SearchInput`, `AppDatePicker`, `Input`, `ImageUpload`.
- **Screens and feature components (9):** `AssetRegistry`, `CreateNewAsset`, `UpdateAssetDetail`, `MyAssignment`, `ActivityAssetInsList`, `UpdateDeleteAsset`, `Login`, `Home`, `SiteList`.
- **Optional:** `app/_layout.tsx` (provider order, UX-16) and `app.json` (UX-18).

There are no new files and no new packages.

---

## 3. Implementation plan (one item per approval)

Each step is a small, separate change: I describe it, you approve it, I make it, then I run `npm run typecheck` and `npm run lint` and report back. No colours, tokens or theme files change.

**Step 1 — Unblock users (P1)**
1. **UX-01 + UX-02** `AppModal`: fix the close flow and make the content scrollable. Set `closeOnBackdropPress={false}` on the safety modal.
2. **UX-03** Create Asset: wrap the step content in the same `ScrollView` that Update Asset uses.
3. **UX-06** My Assignment: make the Add button a normal footer (or reserve space for it) so content isn't covered.

**Step 2 — Bottom sheets (one shared component, fixes every sheet)**
4. **UX-05** Bottom padding from the safe area and `topInset`.
5. **UX-08** Remove the title `flex-1` and Home's `h-150`.
6. **UX-09** Android back closes the sheet.
7. **UX-10** Keyboard settings on the sheet and `BottomSheetTextInput` support in `SearchInput`.
8. **UX-17** Clean up the iOS date-picker sheet.

**Step 3 — Keyboard and input**
9. **UX-04** `automaticallyAdjustKeyboardInsets` on both wizard `ScrollView`s, then check Android keyboard resizing on a device.
10. **UX-07** Offset prop for `KeyboardAvoidingWrapper` (Login).
11. **UX-11** Numeric keyboard for number fields (Create and Update).
12. **UX-19** Login "Next" key moves to the next field.

**Step 4 — Touch targets and accessibility**
13. **UX-13** `hitSlop` on the header buttons.
14. **UX-14** Sidebar tap size, Profile row, close animation and roles.
15. **UX-23** Image-upload labels and the bottom inset for the hint.

**Step 5 — Layout polish**
16. **UX-12** Asset row overflow and the invalid gap class.
17. **UX-15** Selected-site highlight (`Card` background through a class).
18. **UX-20, UX-21** My Assignment summary row and the Submit Asset buttons.
19. **UX-22** Header background equal to the current colour, so the shadow renders.
20. **UX-16** Toast above sheets (provider order).

**Step 6 — Responsive (optional; needs a product decision)**
21. **UX-18** Maximum content width on tablets, or turn off `supportsTablet`.
22. **UX-24, UX-25** `min-h` for font scaling and insets for the bottom `AppModal`.

**Device test matrix after each step**

| Device | What it covers |
|---|---|
| iPhone SE / mini | Small height, home button or short notch |
| iPhone 15/16 Pro | Dynamic Island, home indicator |
| iPad | Only if UX-18 is in scope |
| Android, gesture navigation | Edge-to-edge, thin gesture bar |
| Android, three-button navigation | 48 dp navigation bar (most important for UX-05) |
| Android small (360 × 640 dp) | Overflow (UX-03, UX-06, UX-12) |
| Both platforms at the largest font scale | UX-02, UX-24 |

---

*Waiting for approval before any file is modified.*
