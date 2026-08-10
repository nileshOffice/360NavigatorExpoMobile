import { applicationApi } from "@/app/auth/applicationApi";
import authReducer from "@/app/auth/authSlice";
import { api as baseApi } from "@/app/lib/api/baseApi";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { persistConfig } from "./persistConfig";

export const rootReducer = combineReducers({
    auth: persistReducer(persistConfig, authReducer),
    [baseApi.reducerPath]: baseApi.reducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
});