import { applicationApi } from "@/app/auth/applicationApi";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { api as baseApi } from "../api/baseApi";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(baseApi.middleware)
      .concat(applicationApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;