import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AssetForm, UpdatedAssetForm } from "../../formConfig/assetForm.types";
import {
  initialAssetForm,
  initialUpdatedAssetForm,
} from "../../formConfig/formConfig";

interface AssetFormState {
  saveAssetForm: AssetForm;
  updateAssetForm: UpdatedAssetForm;
}

const initialState: AssetFormState = {
  saveAssetForm: initialAssetForm,
  updateAssetForm: initialUpdatedAssetForm,
};

interface UpdateAssetFieldPayload {
  section: keyof UpdatedAssetForm;
  field: string;
  value: any;
}

const assetFormSlice = createSlice({
  name: "assetForm",
  initialState,

  reducers: {
    // CREATE ASSET
    saveAssetForm: (state, action: PayloadAction<UpdateAssetFieldPayload>) => {
      const { section, field, value } = action.payload;

      (state.saveAssetForm[section] as any)[field] = value;
    },

    // UPDATE EXISTING ASSET
    updateAssetField: (
      state,
      action: PayloadAction<UpdateAssetFieldPayload>,
    ) => {
      const { section, field, value } = action.payload;

      (state.updateAssetForm[section] as any)[field] = value;
    },

    // Load selected asset into update form
    setUpdateAssetForm: (state, action: PayloadAction<UpdatedAssetForm>) => {
      state.updateAssetForm = action.payload;
    },

    // Reset create form
    resetSaveAssetForm: (state) => {
      state.saveAssetForm = initialAssetForm;
    },

    // Reset update form
    resetUpdateAssetForm: (state) => {
      state.updateAssetForm = initialUpdatedAssetForm;
    },

    // Reset both
    resetAssetForm: () => initialState,
  },
});

export const {
  saveAssetForm,
  updateAssetField,
  setUpdateAssetForm,
  resetSaveAssetForm,
  resetUpdateAssetForm,
  resetAssetForm,
} = assetFormSlice.actions;

export default assetFormSlice.reducer;
