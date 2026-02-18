//@ts-nocheck
import { configureStore } from '@reduxjs/toolkit';
import drillthroughReducer from './features/drillthroughSlice';
import dateFilterReducer from './features/dateSlice';
import gSwagatReducer from './features/globalfilters';
import gSearchReducer from './features/globalsearch';

export const store = configureStore({
 devTools: true,
 reducer: {
 drillthrough: drillthroughReducer,
 dateFilter: dateFilterReducer,
 gSwagat: gSwagatReducer,
 gSearch: gSearchReducer
 },
 middleware: (getDefaultMiddleware) =>
 getDefaultMiddleware({
 serializableCheck: {
 ignoredActions: ['drillthrough/fetchData/fulfilled', 'drillthrough/fetchData/pending'],
 ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
 ignoredPaths: ['drillthrough.data'],
 },
 }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;