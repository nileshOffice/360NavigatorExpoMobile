import { applicationApi } from "@/app/auth/applicationApi";
import authReducer from "@/app/auth/authSlice";
import { api as baseApi } from "@/app/lib/api/baseApi";
import { combineReducers } from "@reduxjs/toolkit";

export const rootReducer = combineReducers({
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [applicationApi.reducerPath]: applicationApi.reducer,
})