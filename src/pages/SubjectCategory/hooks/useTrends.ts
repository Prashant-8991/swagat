//@ts-nocheck
import { useMemo, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { GET_TRENDS_DATA } from '../graphql/queries';
import { FilterState } from '../types';
import { useAppSelector } from '../../../redux/hooks';

export function useTrends(filters: FilterState) {
 const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

 const queryVariables = useMemo(() => ({
 programTypes: filters.programTypes,
 district: filters.district,
 departmentName: filters.departmentName,
 taluka: filters.taluka,
 disposeChnl: filters.disposeChnl,
 grievanceStatus: filters.grievanceStatus,
 subStatusName: filters.subStatusName,
 subjectCategory: filters.subjectCategory,
 aiCategory: filters.aiCategory,
 month: filters.month,
 fromDate,
 toDate
 }), [
 filters.programTypes,
 filters.district,
 filters.departmentName,
 filters.taluka,
 filters.disposeChnl,
 filters.grievanceStatus,
 filters.subStatusName,
 filters.subjectCategory,
 filters.aiCategory,
 filters.month,
 fromDate,
 toDate
 ]);

 const [loadTrends, { data, loading, error }] = useLazyQuery(GET_TRENDS_DATA, {
 fetchPolicy: 'network-only',
 notifyOnNetworkStatusChange: true
 });

 // Auto-load trends after a short delay to not block initial render
 // Pass variables directly to loadTrends() to ensure fresh values
 useEffect(() => {
 const timeoutId = setTimeout(() => {
 loadTrends({ variables: queryVariables });
 }, 300);

 return () => clearTimeout(timeoutId);
 }, [queryVariables, loadTrends]);

 const trends = useMemo(() => {
 if (!data?.dashboardPage2WithForecast) {
 return {
 increasingTrends: [],
 decreasingTrends: []
 };
 }

 return {
 increasingTrends: data.dashboardPage2WithForecast.increasingTrends || [],
 decreasingTrends: data.dashboardPage2WithForecast.decreasingTrends || []
 };
 }, [data]);

 console.log('[useTrends] Hook state:', { loading, hasError: !!error, error });

 return {
 ...trends,
 trendsLoading: loading,
 trendsError: error
 };
}
