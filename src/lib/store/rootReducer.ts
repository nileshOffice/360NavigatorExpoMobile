import { applicationApi } from "@/src/auth/applicationApi";
import authReducer from "@/src/auth/authSlice";
import apiErrorReducer from "@/src/common/hooks/apiErrorSlice";
import headerReducer from "@/src/common/hooks/headerSlice";
import moduleReducer from "@/src/common/redux/homeSlice/moduleSlice";

import { api as baseApi } from "@/src/lib/api/baseApi";

import assetFormReducer from "@/src/main/modules/walkdown/redux/walkDownSlice/assetFormSlice";
import selectedAssetDataReducer from "@/src/main/modules/walkdown/redux/walkDownSlice/selectedAssetData";
import assetWalkDownReducer from "@/src/main/modules/walkdown/redux/walkDownSlice/selectedWalkDown";

import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

import {
  assetFormPersistConfig,
  assetWalkDownPersistConfig,
  persistConfig,
  selectedAssetDataPersistConfig,
} from "@/src/lib/store/persistConfig";

export const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),

  apiError: apiErrorReducer,

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
