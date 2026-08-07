import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}



const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  hydrated: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setCredentials: (state, action: PayloadAction<{user?: User}>) => {
      state.user = action.payload.user || null;
      state.isAuthenticated = true;
    },

     setHydrated: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.hydrated = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  }
});

export const { setCredentials, setHydrated, logout } = authSlice.actions;
export default authSlice.reducer;