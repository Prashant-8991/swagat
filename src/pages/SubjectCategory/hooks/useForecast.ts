//@ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { GET_FORECAST_DATA } from '../graphql/queries';
import { FilterState, MonthlyTrend } from '../types';

export function useForecast(filters: FilterState) {
 const [includeForecast, setIncludeForecast] = useState(false);
 const [forecastLoading, setForecastLoading] = useState(false);
 const [forecastData, setForecastData] = useState<MonthlyTrend[]>([]);
 const forecastLoadingRef = useRef(false);
 const lastRequestRef = useRef<string>('');

 const [loadForecast] = useLazyQuery(
 GET_FORECAST_DATA,
 {
 fetchPolicy: 'network-only',
 context: { timeout: 30000 },
 notifyOnNetworkStatusChange: true,
 onCompleted: (data) => {
 console.log('✅ Forecast query completed', data);

 try {
 if (data?.dashboardPage2WithForecast?.monthlyTrends) {
 const allTrends = data.dashboardPage2WithForecast.monthlyTrends;
 const forecastTrends = allTrends.filter((t: MonthlyTrend) => t.isForecast);
 setForecastData(forecastTrends);
 console.log(`✅ Forecast loaded: ${forecastTrends.length} months`);
 } else {
 console.warn('⚠️ No monthly trends in forecast response');
 setForecastData([]);
 }
 } catch (error) {
 console.error('❌ Error processing forecast data:', error);
 setForecastData([]);
 } finally {
 // Always clear loading state
 forecastLoadingRef.current = false;
 setForecastLoading(false);
 }
 },
 onError: (error) => {
 console.error('❌ Forecast loading error:', error);
 forecastLoadingRef.current = false;
 setForecastLoading(false);
 setForecastData([]);
 }
 }
 );

 useEffect(() => {
 if (filters.month && includeForecast) {
 setIncludeForecast(false);
 setForecastData([]);
 forecastLoadingRef.current = false;
 setForecastLoading(false);
 }
 }, [filters.month, includeForecast]);

 useEffect(() => {

 const requestKey = JSON.stringify({
 includeForecast,
 programTypes: filters.programTypes,
 district: filters.district,
 taluka: filters.taluka,
 departmentName: filters.departmentName,
 disposeChnl: filters.disposeChnl,
 grievanceStatus: filters.grievanceStatus,
 subStatusName: filters.subStatusName,
 subjectCategory: filters.subjectCategory,
 aiCategory: filters.aiCategory,
 month: filters.month
 });

 if (requestKey === lastRequestRef.current || filters.month) {
 return;
 }

 if (!includeForecast) {
 setForecastData([]);
 forecastLoadingRef.current = false;
 setForecastLoading(false);
 return;
 }

 const timeoutId = setTimeout(() => {

 console.log('🔄 Loading forecast data...');
 forecastLoadingRef.current = true;
 setForecastLoading(true);
 lastRequestRef.current = requestKey;

 loadForecast({
 variables: {
 programTypes: filters.programTypes,
 district: filters.district,
 taluka: filters.taluka,
 departmentName: filters.departmentName,
 disposeChnl: filters.disposeChnl,
 grievanceStatus: filters.grievanceStatus,
 subStatusName: filters.subStatusName,
 subjectCategory: filters.subjectCategory,
 aiCategory: filters.aiCategory,
 month: filters.month
 }
 });
 }, 300);

 return () => {
 clearTimeout(timeoutId);
 };
 }, [
 includeForecast,
 filters.programTypes,
 filters.district,
 filters.taluka,
 filters.departmentName,
 filters.disposeChnl,
 filters.grievanceStatus,
 filters.subStatusName,
 filters.subjectCategory,
 filters.aiCategory,
 filters.month,
 loadForecast
 ]);

 return {
 includeForecast,
 setIncludeForecast,
 forecastLoading,
 forecastData
 };
}
