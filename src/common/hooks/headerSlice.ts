import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type HeaderState = {
  title: string;
  showBack: boolean;
  showMenu: boolean;
  showLogo: boolean;
  backAction: "goBack" | "main" | "none" | "custom";
  backPressed: number;
};

const initialState: HeaderState = {
  title: "",
  showBack: false,
  showMenu: false,
  showLogo: false,
  backAction: "none",
  backPressed: 0,
};

const headerSlice = createSlice({
  name: "header",
  initialState,

  reducers: {
    setHeader: (state, action: PayloadAction<Partial<HeaderState>>) => {
      Object.assign(state, action.payload);
    },

    pressHeaderBack: (state) => {
      state.backPressed += 1;
    },

    resetHeader: () => initialState,
  },
});

export const { setHeader, pressHeaderBack, resetHeader } = headerSlice.actions;

export default headerSlice.reducer;
