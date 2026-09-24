import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AssetForm } from "../../formConfig/assetForm.types";
import { initialAssetForm } from "../../formConfig/formConfig";


interface AssetFormState extends AssetForm {}

const initialState: AssetFormState = initialAssetForm;

interface UpdateAssetFieldPayload {
    section: keyof AssetForm;
    field: string;
    value: any;
}


const assetFormSlice = createSlice({
    name: 'assetForm',
    initialState: initialAssetForm,

    reducers: {
        updateAssetField: (
            state,
            action: PayloadAction<UpdateAssetFieldPayload>
        ) => {
            const { section, field, value } = action.payload;

            (state[section] as any)[field] = value;
        },

        resetAssetForm: () => initialAssetForm,
    },
});



export const {
    updateAssetField,
    resetAssetForm,
} = assetFormSlice.actions;

export default assetFormSlice.reducer;