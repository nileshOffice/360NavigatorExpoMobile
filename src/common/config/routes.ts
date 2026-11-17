import type { Href } from "expo-router";

/**
 * Every navigable screen in the app. Screens live in `src/` and are exposed
 * through thin route files in `app/` (Expo Router only treats files inside
 * `app/` as routes, so nothing else may live there).
 */
export const APP_ROUTES = {
  auth: "/auth" as Href,
  main: "/main" as Href,
  assetRegistry: "/main/asset-registry" as Href,
  assetAssignment: "/main/my-assignment" as Href,
  createNewAsset: "/main/create-asset" as Href,
  updateAssetDetail: "/main/update-asset" as Href,
  updateDeleteAsset: "/main/asset-review" as Href,
} as const;

/** Routes that are safe to restore on a cold start. */
const RESTORABLE_ROUTES = new Set<string>([
  APP_ROUTES.main as string,
  APP_ROUTES.assetRegistry as string,
  APP_ROUTES.assetAssignment as string,
]);

export const isRestorableRoute = (route: string | null | undefined): route is string =>
  !!route && RESTORABLE_ROUTES.has(route);
