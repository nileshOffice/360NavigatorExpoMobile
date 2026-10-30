import { applicationApi } from "@/app/auth/applicationApi";
import authReducer from "@/app/auth/authSlice";
import headerReducer from "@/app/common/hooks/headerSlice";
import moduleReducer from "@/app/common/redux/homeSlice/moduleSlice";

import { api as baseApi } from "@/app/lib/api/baseApi";

import assetFormReducer from "@/app/main/modules/warkdown/redux/walkDownSlice/assetFormSlice";
import selectedAssetDataReducer from "@/app/main/modules/warkdown/redux/walkDownSlice/selectedAssetData";
import assetWalkDownReducer from "@/app/main/modules/warkdown/redux/walkDownSlice/selectedWalkDown";

import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

import {
  assetFormPersistConfig,
  assetWalkDownPersistConfig,
  persistConfig,
  selectedAssetDataPersistConfig,
} from "./persistConfig";

export const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),

  assetForm: persistReducer(assetFormPersistConfig, assetFormReducer),

  allModules: moduleReducer,

  header: headerReducer,

  assetWalkDown: persistReducer(
    assetWalkDownPersistConfig,
    assetWalkDownReducer,
  ),

  selectedAssetData: persistReducer(
    selectedAssetDataPersistConfig,
    selectedAssetDataReducer,
  ),

  [baseApi.reducerPath]: baseApi.reducer,

  [applicationApi.reducerPath]: applicationApi.reducer,
});
