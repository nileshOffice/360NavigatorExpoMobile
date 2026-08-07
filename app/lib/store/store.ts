import { applicationApi } from "@/app/auth/applicationApi";
import { configureStore } from "@reduxjs/toolkit";
import { api as baseApi } from "../api/baseApi";
import { rootReducer } from "./rootReducer";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(applicationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;