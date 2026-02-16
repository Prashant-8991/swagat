//@ts-nocheck
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface GlobalSearchStateInterface {
 query: string;
}

const initialState: GlobalSearchStateInterface = {
 query: '',
}

export const gSearchSlice = createSlice({
 name: 'gSearch',
 initialState,
 reducers: {
 setSearchQuery: (state, action: PayloadAction<GlobalSearchStateInterface>) => {
 state.query = action.payload.query;
 },
 clearSearchQuery: (state) => {
 state.query = '';
 }
 },
})

// Action creators are generated for each case reducer function
export const { setSearchQuery, clearSearchQuery } = gSearchSlice.actions

export default gSearchSlice.reducer