import type { Href } from "expo-router";

export const APP_ROUTES = {
    main:'/main' as Href,
    assetRegistry: '/main/modules/warkdown/screens/AssetRegistry' as Href,
    assetAssignment:'/main/modules/warkdown/screens/MyAssignment' as Href,
    createNewAsset:'/main/modules/warkdown/screens/CreateNewAsset' as Href,
  
} as const 