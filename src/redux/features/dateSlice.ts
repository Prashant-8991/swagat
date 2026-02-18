//@ts-nocheck
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface DateState {
 fromDate: string | null;
 toDate: string | null;
}

const initialState: DateState = {
 fromDate: null,
 toDate: null,
}

export const dateSlice = createSlice({
 name: 'dateFilter',
 initialState,
 reducers: {
 setFromDate: (state, action: PayloadAction<string | null>) => {
 state.fromDate = action.payload;
 },
 setToDate: (state, action: PayloadAction<string | null>) => {
 state.toDate = action.payload;
 },
 setDateRange: (state, action: PayloadAction<{ fromDate: string | null; toDate: string | null }>) => {
 state.fromDate = action.payload.fromDate;
 state.toDate = action.payload.toDate;
 },
 clearDates: (state) => {
 state.fromDate = null;
 state.toDate = null;
 }
 },
})

export const { setFromDate, setToDate, setDateRange, clearDates } = dateSlice.actions

export default dateSlice.reducer;
