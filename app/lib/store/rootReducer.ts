import { applicationApi } from "@/app/auth/applicationApi";
import authReducer from "@/app/auth/authSlice";
import { api as baseApi } from "@/app/lib/api/baseApi";
import assetWalkDownReducer from "@/app/main/modules/warkdown/redux/walkDownSlice/selectedWalkDown";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { persistConfig } from "./persistConfig";

export const rootReducer = combineReducers({
    auth: persistReducer(persistConfig, authReducer),
    assetWolkDown:assetWalkDownReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
});