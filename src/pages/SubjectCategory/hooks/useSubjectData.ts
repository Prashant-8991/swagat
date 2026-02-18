//@ts-nocheck
import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_DATA } from '../graphql/queries';
import { FilterState, DashboardData } from '../types';
import { useAppSelector } from '../../../redux/hooks';

export function useSubjectData(filters: FilterState) {
 const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

 const programTypesJson = JSON.stringify(filters.programTypes || []);

 // Create stable query variables with stringified array to ensure proper memoization
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
 programTypesJson,
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

 // Optimized query with network-only on filter changes to skip stale cache
 const { data, error, loading } = useQuery(GET_DASHBOARD_DATA, {
 variables: queryVariables,
 fetchPolicy: 'network-only',
 nextFetchPolicy: 'cache-first',
 notifyOnNetworkStatusChange: false,
 // Skip expensive operations on rapid filter changes
 context: {
 debounceKey: JSON.stringify(queryVariables),
 debounceTimeout: 150
 }
 });

 // Memoize dashboard data
 const dashboardData: DashboardData | null = useMemo(() => {
 if (!data?.dashboardPage2WithForecast) {
 return null;
 }

 return {
 districts: data.dashboardPage2WithForecast.districts || [],
 talukas: data.dashboardPage2WithForecast.talukas || [],
 subjects: data.dashboardPage2WithForecast.subjectCategories || [],
 departments: data.dashboardPage2WithForecast.departments || [],
 aiCategories: data.dashboardPage2WithForecast.aiCategories || [],
 monthlyTrends: data.dashboardPage2WithForecast.monthlyTrends || [],
 forecastAvailable: data.dashboardPage2WithForecast.forecastAvailable || false
 };
 }, [data]);

 // Use subjects from main query instead of separate fetch
 const allSubjects = useMemo(() => {
 return dashboardData?.subjects || null;
 }, [dashboardData?.subjects]);

 return {
 dashboardData,
 allSubjects,
 loading,
 error,
 forecastAvailable: dashboardData?.forecastAvailable || false
 };
}
