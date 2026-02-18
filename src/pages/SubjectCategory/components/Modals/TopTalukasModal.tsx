// @ts-nocheck
import React, { useMemo } from 'react';
import { useSubjectData } from '../../hooks/useSubjectData';
import LoadingSpinner from '../UI/LoadingSpinner';
import ReactECharts from 'echarts-for-react';
import { FilterState } from '../../types';

interface TopTalukasModalProps {
 department: string;
 onClose: () => void;
 baseFilters: FilterState;
}

export default function TopTalukasModal({ department, onClose, baseFilters }: TopTalukasModalProps) {
 const filters = useMemo(() => ({
 ...baseFilters,
 department: department
 }), [baseFilters, department]);

 const { dashboardData, loading } = useSubjectData(filters, false);

 const chartOption = useMemo(() => {
 if (!dashboardData?.talukas) return {};

 const sortedData = [...dashboardData.talukas]
 .sort((a, b) => b.count - a.count)
 .slice(0, 10); // Top 10

 return {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' }
 },
 grid: {
 left: '3%',
 right: '4%',
 bottom: '3%',
 containLabel: true
 },
 xAxis: {
 type: 'value',
 boundaryGap: [0, 0.01]
 },
 yAxis: {
 type: 'category',
 data: sortedData.map(item => item.taluka).reverse(),
 axisLabel: {
 width: 100,
 overflow: 'truncate'
 }
 },
 series: [
 {
 name: 'Grievances',
 type: 'bar',
 data: sortedData.map(item => item.count).reverse(),
 itemStyle: { color: '#6366f1' },
 label: {
 show: true,
 position: 'right'
 }
 }
 ]
 };
 }, [dashboardData]);

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
 Top Talukas for {department}
 </h2>
 <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <div className="flex-1 p-6 overflow-auto min-h-[400px]">
 {loading ? (
 <div className="flex items-center justify-center h-[400px]">
 <LoadingSpinner />
 </div>
 ) : dashboardData?.talukas?.length > 0 ? (
 <ReactECharts option={chartOption} style={{ height: '400px' }} />
 ) : (
 <div className="flex items-center justify-center h-[400px] text-gray-500">
 No data available
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
