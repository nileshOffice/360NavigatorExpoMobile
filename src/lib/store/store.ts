import { applicationApi } from "@/src/auth/applicationApi";
import { api as baseApi } from "@/src/lib/api/baseApi";
import { rootReducer } from "@/src/lib/store/rootReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      // RTK Query keeps request args (FormData with files) and large API
      // payloads under `api`; deep-checking them is slow and not useful.
      immutableCheck: { ignoredPaths: ["api"] },
    })
      .concat(baseApi.middleware)
      .concat(applicationApi.middleware),
});

export const persistor = persistStore(store);

// One-time clean-up: older builds stored the auth slice (incl. tokens) in
// plain AsyncStorage under this key. It now lives in SecureStore.
AsyncStorage.removeItem("persist:auth").catch(() => {});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
