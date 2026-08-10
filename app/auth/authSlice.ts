import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './auth.types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isCompanySelectedByUser: boolean;
  isSiteSelectedByUser: boolean;
  visitFlag: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isCompanySelectedByUser: false,
  isSiteSelectedByUser: false,
  visitFlag: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ currentUser?: User }>
    ) => {
      if (action.payload.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload.currentUser,
        };
      }

      state.isAuthenticated = true;
    },



    setCompanySelectedByUser: (state, action: PayloadAction<boolean>) => {
      state.isCompanySelectedByUser = action.payload;
    },

    setSiteSelectedByUser: (state, action: PayloadAction<boolean>) => {
      state.isSiteSelectedByUser = action.payload;
    },

    setVisitFlag: (state, action: PayloadAction<boolean>) => {
      state.visitFlag = action.payload;
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isCompanySelectedByUser = false;
      state.isSiteSelectedByUser = false;
      state.visitFlag = false;
    },
  }
});

export const {
  setCredentials,
  setCompanySelectedByUser,
  setSiteSelectedByUser,
  setVisitFlag,
  logout,
} = authSlice.actions;
export default authSlice.reducer;