//@ts-nocheck
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface GlobalFilterInterface {
 programTypes: string[];
 subStatuses: string[];
 disposeChannels: string[];
 departments: string[];
 districts: string[];
 talukas: string[];
 grievanceStatuses: string[];
}

const initialState: GlobalFilterInterface = {
 programTypes: [],
 subStatuses: [],
 disposeChannels: [],
 departments: [],
 districts: [],
 talukas: [],
 grievanceStatuses: [],
}

export const gSwagatSlice = createSlice({
 name: 'gSwagat',
 initialState,
 reducers: {
 setgSwagatData: (state, action: PayloadAction<GlobalFilterInterface>) => {
 state.programTypes = action.payload.programTypes;
 state.subStatuses = action.payload.subStatuses;
 state.disposeChannels = action.payload.disposeChannels;
 state.departments = action.payload.departments;
 state.districts = action.payload.districts;
 state.talukas = action.payload.talukas;
 state.grievanceStatuses = action.payload.grievanceStatuses;
 },
 },
})

export const { setgSwagatData } = gSwagatSlice.actions
export default gSwagatSlice.reducer
