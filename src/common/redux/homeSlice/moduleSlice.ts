import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModuleState {
  moduleList: any[];
  moduleSiteId: number | null;
  moduleLoaded: boolean;
}

const initialState: ModuleState = {
  moduleList: [],
  moduleSiteId: null,
  moduleLoaded: false,
};

const moduleSlice = createSlice({
  name: 'module',
  initialState,
  reducers: {
    setModuleList: (
      state,
      action: PayloadAction<{
        moduleList: any[];
        siteId: number;
      }>
    ) => {
      state.moduleList = action.payload.moduleList;
      state.moduleSiteId = action.payload.siteId;
      state.moduleLoaded = true;
    },

    clearModuleList: (state) => {
      state.moduleList = [];
      state.moduleSiteId = null;
      state.moduleLoaded = false;
    },
  },
});

export const {
  setModuleList,
  clearModuleList,
} = moduleSlice.actions;

export default moduleSlice.reducer;