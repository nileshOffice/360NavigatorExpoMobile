import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersistConfig } from "redux-persist";
import { secureStorage } from "./secureStorage";

// Auth state contains access/session tokens -> encrypted device storage.
export const persistConfig: PersistConfig<any> = {
  key: "auth.secure",
  storage: secureStorage,
  // Writes to the Keystore are slower than AsyncStorage; batch them.
  throttle: 500,
  whitelist: [
    "currentUser",
    "isAuthenticated",
    "isCompanySelectedByUser",
    "isSiteSelectedByUser",
    "visitFlag",
    "lastVisitedRoute",
    "selectedSite",
    "safetyAcknowledged",
  ],
};

export const assetFormPersistConfig: PersistConfig<any> = {
  key: "assetForm",
  storage: AsyncStorage,
  // Every keystroke in the asset wizard updates this slice.
  throttle: 500,
};

export const assetWalkDownPersistConfig: PersistConfig<any> = {
  key: "assetWalkDown",
  storage: AsyncStorage,
  whitelist: ["selectedTab", "selectedActivity"],
};

export const selectedAssetDataPersistConfig: PersistConfig<any> = {
  key: "selectedAssetData",
  storage: AsyncStorage,
};
