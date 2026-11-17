import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Site, User } from "@/src/auth/auth.types";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isCompanySelectedByUser: boolean;
  isSiteSelectedByUser: Site | null;
  visitFlag: boolean;
  lastVisitedRoute: string | null;
  selectedSite: Site | null;
  sessionExpired: boolean;
  siteSelectionOpen: boolean;
  safetyAcknowledged: boolean;
}

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isCompanySelectedByUser: false,
  isSiteSelectedByUser: null,
  visitFlag: false,
  lastVisitedRoute: null,
  selectedSite: null,
  sessionExpired: false,
  siteSelectionOpen: false,
  safetyAcknowledged: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        currentUser?: User;
        isCompanySelectedByUser?: boolean;
        isSiteSelectedByUser?: Site;
        visitFlag?: boolean;
      }>,
    ) => {
      if (action.payload.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload.currentUser,
        };
      }

      if (action.payload.isCompanySelectedByUser !== undefined) {
        state.isCompanySelectedByUser = action.payload.isCompanySelectedByUser;
      }

      if (action.payload.isSiteSelectedByUser !== undefined) {
        state.isSiteSelectedByUser = action.payload.isSiteSelectedByUser;
      }

      if (action.payload.visitFlag !== undefined) {
        state.visitFlag = action.payload.visitFlag;
      }

      state.isAuthenticated = true;
    },

    /** Merges fields into the current user (used by the token refresh). */
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.currentUser) {
        return;
      }

      state.currentUser = { ...state.currentUser, ...action.payload };
    },

    setCompanySelectedByUser: (state, action: PayloadAction<boolean>) => {
      state.isCompanySelectedByUser = action.payload;
    },

    setSiteSelectedByUser: (state, action: PayloadAction<Site | null>) => {
      state.isSiteSelectedByUser = action.payload;
    },

    setVisitFlag: (state, action: PayloadAction<boolean>) => {
      state.visitFlag = action.payload;
    },

    setLastVisitedRoute: (state, action: PayloadAction<string | null>) => {
      state.lastVisitedRoute = action.payload;
    },

    setSelectedSite: (state, action: PayloadAction<Site | null>) => {
      state.selectedSite = action.payload;
    },

    setSiteSelectionOpen: (state, action: PayloadAction<boolean>) => {
      state.siteSelectionOpen = action.payload;
    },

    setSafetyAcknowledged: (state, action: PayloadAction<boolean>) => {
      state.safetyAcknowledged = action.payload;
    },

    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.sessionExpired = action.payload;
    },

    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.isCompanySelectedByUser = false;
      state.isSiteSelectedByUser = null;
      state.visitFlag = false;
      state.lastVisitedRoute = null;
      state.selectedSite = null;
      state.safetyAcknowledged = false;
      state.sessionExpired = false;
      state.siteSelectionOpen = false;
    },
  },
});

export const {
  setCredentials,
  updateCurrentUser,
  setSessionExpired,
  setCompanySelectedByUser,
  setSiteSelectedByUser,
  setVisitFlag,
  setLastVisitedRoute,
  setSelectedSite,
  setSiteSelectionOpen,
  setSafetyAcknowledged,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
