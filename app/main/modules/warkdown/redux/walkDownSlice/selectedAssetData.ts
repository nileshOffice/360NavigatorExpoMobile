import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AssetColumn } from "../../api/walkdownApi.types";

const initialState: AssetColumn = {
  aXColunmName: "",
  aXColunmNameData: null,
  assetnum: "",
  category: null,
  colorIndicator: null,
  colunmName: "",
  colunmNameData: null,
  displayColnumName: "",
  displayOrder: null,
  flag: null,
  id: null,
  isMandatory: null,
  note: null,
  suggested: null,
  suggestedname: null,
};

const selectedAssetDataSlice = createSlice({
  name: "selectedAssetData",

  initialState,

  reducers: {
    setSelectedAssetData: (state, action: PayloadAction<AssetColumn>) => {
      return action.payload;
    },

    clearSelectedAssetData: () => initialState,
  },
});

export const { setSelectedAssetData, clearSelectedAssetData } =
  selectedAssetDataSlice.actions;

export default selectedAssetDataSlice.reducer;
