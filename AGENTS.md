# Agent notes

- Expo SDK **58** / React Native **0.88** / React 19.3. Use the versioned docs:
  https://docs.expo.dev/versions/v58.0.0/
- Only route files live in `app/`. Everything else (screens, components,
  slices, API, utils) lives in `src/` and is imported with `@/src/...`.
- Screens set the shared header with `useScreenHeader(...)` (focus-aware).
  Multi-step screens use `useHeaderBackHandler(handleBack)` so the header arrow
  and the Android back button step through the wizard.
- Run `npm run typecheck` and `npm run lint` before committing.
