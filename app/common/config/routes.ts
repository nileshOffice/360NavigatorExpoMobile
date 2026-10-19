import type { Href } from "expo-router";

export const APP_ROUTES = {
  main: "/main" as Href,
  assetRegistry: "/main/modules/warkdown/screens/AssetRegistry" as Href,
  assetAssignment: "/main/modules/warkdown/screens/MyAssignment" as Href,
  createNewAsset: "/main/modules/warkdown/screens/CreateNewAsset" as Href,
  updateAssetDetail: "/main/modules/warkdown/screens/UpdateAssetDetail" as Href,
  updateDeleteAsset:
    "/main/modules/warkdown/components/UpdateDeleteAsset" as Href,
} as const;
