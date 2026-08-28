import { applicationApi } from "@/app/auth/applicationApi";
import authReducer from "@/app/auth/authSlice";
import moduleReducer from "@/app/common/redux/homeSlice/moduleSlice";
import { api as baseApi } from "@/app/lib/api/baseApi";

import assetWalkDownReducer from "@/app/main/modules/warkdown/redux/walkDownSlice/selectedWalkDown";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { assetWalkDownPersistConfig, persistConfig, } from "./persistConfig";

export const rootReducer = combineReducers({
    auth: persistReducer(
        persistConfig,
        authReducer
    ),
    allModules: moduleReducer,
    assetWalkDown: persistReducer( assetWalkDownPersistConfig,assetWalkDownReducer),
    [baseApi.reducerPath]: baseApi.reducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
});