import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_PAGE1 } from '../graphql/queries';
import { FilterState, DashboardData } from '../types';
import { useAppSelector } from '../../../redux/hooks';

export function useOverviewData(filters: FilterState) {
 const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

 const { data, loading, error } = useQuery<DashboardData>(GET_DASHBOARD_PAGE1, {
 variables: {
 ...filters,
 fromDate,
 toDate
 },
 fetchPolicy: 'cache-and-network'
 });

 const dashboardData = data?.dashboardPage1;

 return {
 dashboardData,
 loading,
 error
 };
}
