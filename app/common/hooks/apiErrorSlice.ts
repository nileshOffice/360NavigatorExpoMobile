import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ApiAlert {
  title: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
  confirmText?: string;
  action?: "logout" | "none";
}

interface ApiErrorState {
  alert: ApiAlert | null;
}

const initialState: ApiErrorState = {
  alert: null,
};

const apiErrorSlice = createSlice({
  name: "apiError",
  initialState,
  reducers: {
    showApiAlert: (state, action: PayloadAction<ApiAlert>) => {
      state.alert = action.payload;
    },

    clearApiAlert: (state) => {
      state.alert = null;
    },
  },
});

export const { showApiAlert, clearApiAlert } = apiErrorSlice.actions;

export default apiErrorSlice.reducer;
