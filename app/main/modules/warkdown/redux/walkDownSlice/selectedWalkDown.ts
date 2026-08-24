import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WalkDownTab = 'inProgress' | 'completed'

export interface AssetWalkDownActivity {
    id: number | string;
    title?: string;
    description?: string;
    assetCount?: number;
    activityDate?: string;
    statusId: number | null;
    [key: string]: any;
}

interface AssetWalkDownState {
    selectedTab:WalkDownTab;
    selectedActivity:AssetWalkDownActivity | null;
}

const initialState:AssetWalkDownState = {
    selectedTab:'inProgress',
    selectedActivity:null,
}

const assetWalkDownSlice = createSlice ({
    name:'assetWalkDown',
    initialState,

   
    reducers: {
        
        /*  this method or reducer use for changing tab */

        setSelectedTab: (
            state,
            action: PayloadAction<WalkDownTab>,) => {
            state.selectedTab = action.payload;
        },

        /* selecte a perticular wolkdown which is mostly use for redirect to walkdowndetail */

       setSelectActivity:(
        state,
        action:PayloadAction<AssetWalkDownActivity>,) => {
            state.selectedActivity = action.payload;
        },

        /* CLEAR SELECTED TAB */

       clearSelectedActivity:state => {
        state.selectedActivity  = null
       },

       /* Reset screen state */

       resetAssetWalkDownState:state => {
         state.selectedTab = 'inProgress',
         state.selectedActivity= null
       },
    }
})

export const {setSelectedTab, setSelectActivity, clearSelectedActivity, resetAssetWalkDownState} = assetWalkDownSlice.actions

export default assetWalkDownSlice.reducer;