//@ts-nocheck
import React, { useState, useRef, useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { echarts } from '../../utils/chartConfig';
import { TrendAnalysisResult } from '../../types';
import { useLazyQuery } from '@apollo/client/react';
import { GET_FORECAST_DATA } from '../../graphql/queries';
import { Modal, Select } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface SubjectTrendlineAnalysisProps {
 increasingTrends: TrendAnalysisResult[];
 decreasingTrends: TrendAnalysisResult[];
 loading: boolean;
 filters: any;
}

const { Option } = Select;

export default function SubjectTrendlineAnalysis({
 increasingTrends,
 decreasingTrends,
 loading,
 filters
}: SubjectTrendlineAnalysisProps) {

 const [trendType, setTrendType] = useState<'increasing' | 'decreasing'>('increasing');
 const [selectedTrend, setSelectedTrend] = useState<TrendAnalysisResult | null>(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [contributorType, setContributorType] = useState<'district' | 'taluka'>('taluka');

 const currentData = trendType === 'increasing' ? increasingTrends : decreasingTrends;
 const chartRef = useRef<any>(null);

 console.log('[SubjectTrendlineAnalysis] Props:', {
 loading,
 increasingCount: increasingTrends.length,
 decreasingCount: decreasingTrends.length,
 trendType,
 currentDataCount: currentData.length
 });

 const [fetchForecast, { loading: forecastLoading }] = useLazyQuery(GET_FORECAST_DATA, {
 fetchPolicy: 'network-only',
 context: { timeout: 30000 }
 });

 const handleChartClick = (params: any) => {
 // ... existing implementation if any, otherwise ignore
 };

 const handleRowClick = (params: any) => {
 const trend = params.data;
 setSelectedTrend(trend);
 setIsModalVisible(true);

 // Fetch forecast specifically for this subject category
 console.log("DEBUG: Fetching forecast for category:", trend.category);
 fetchForecast({
 variables: {
 programTypes: filters.programTypes,
 district: filters.district,
 taluka: filters.taluka,
 departmentName: filters.departmentName,
 disposeChnl: filters.disposeChnl,
 grievanceStatus: filters.grievanceStatus,
 subStatusName: filters.subStatusName,
 subjectCategory: trend.category,
 aiCategory: filters.aiCategory,
 month: filters.month,
 fromDate: filters.fromDate,
 toDate: filters.toDate
 }
 }).then((result) => {
 console.log("DEBUG: Forecast API Result:", result);
 const monthlyTrends = result.data?.dashboardPage2WithForecast?.monthlyTrends || [];
 const forecastItems = monthlyTrends.filter((item: any) => item.isForecast);
 console.log("DEBUG: Extracted forecast items:", forecastItems);

 if (forecastItems.length > 0) {
 setSelectedTrend(prev => {
 if (!prev) return null;
 return {
 ...prev,
 forecastPoints: forecastItems.map((item: any) => item.count),
 forecastPeriods: forecastItems.map((item: any) => item.monthDisplay)
 };
 });
 }
 }).catch(err => {
 console.error("Error fetching subject forecast:", err);
 });
 };

 const getOption = () => {
 const categories = currentData.map(d => d.category);
 const consistencyScores = currentData.map(d => Number(d.consistencyScore.toFixed(2)));
 const avgGrowthRates = currentData.map(d => Number(d.avgGrowthRate.toFixed(2)));

 return {
 toolbox: {
 show: true,
 feature: {
 saveAsImage: { show: true, title: 'Download' },
 dataView: { show: true, readOnly: true, title: 'Data' },
 restore: { show: true, title: 'Reset' }
 },
 right: '4%'
 },
 tooltip: {
 trigger: 'axis',
 valueFormatter: (value: any) => Number(value).toFixed(2)
 },
 legend: {
 data: ['Consistency Score', 'Avg Growth Rate (%)'],
 bottom: 0
 },
 grid: {
 left: '3%',
 right: '4%',
 bottom: '10%',
 top: '10%',
 containLabel: true
 },
 xAxis: {
 type: 'value',
 boundaryGap: [0, 0.01]
 },
 yAxis: {
 type: 'category',
 data: categories,
 axisLabel: {
 width: 150,
 overflow: 'truncate',
 interval: 0
 }
 },
 series: [
 {
 name: 'Consistency Score',
 type: 'bar',
 data: consistencyScores,
 itemStyle: {
 color: trendType === 'increasing' ? '#10B981' : '#EF4444',
 borderRadius: [0, 4, 4, 0]
 },
 label: {
 show: true,
 position: 'right',
 formatter: (p: any) => Number(p.value).toFixed(2)
 }
 },
 {
 name: 'Avg Growth Rate (%)',
 type: 'scatter',
 data: avgGrowthRates,
 symbolSize: 10,
 itemStyle: {
 color: '#3B82F6',
 borderColor: '#fff',
 borderWidth: 2
 },
 label: {
 show: true,
 position: 'top',
 formatter: (p: any) => `${Number(p.value).toFixed(2)}%`,
 color: '#3B82F6',
 fontWeight: 'bold'
 }
 }
 ]
 };
 };

 const formatQuarter = (period: string | number) => {
 return String(period) + " Quarter";
 };

 const getModalChartOption = useMemo(() => {
 if (!selectedTrend) return {};

 const slicedForecastPeriods = selectedTrend.forecastPeriods;
 const slicedForecastPoints = selectedTrend.forecastPoints;
 const allPeriods = [
 ...selectedTrend.periods.map(p => formatQuarter(p)),
 ...slicedForecastPeriods.map(p => formatQuarter(p))
 ];

 const actualData = [
 ...selectedTrend.periodValues.map(v => Number(v.toFixed(2))),
 ...Array(slicedForecastPeriods.length).fill(null)
 ];

 const lastActualValue = Number(selectedTrend.periodValues[selectedTrend.periodValues.length - 1].toFixed(2));

 const forecastData = [
 ...Array(selectedTrend.periods.length - 1).fill(null),
 lastActualValue,
 ...slicedForecastPoints.map(v => Number(v.toFixed(2)))
 ];

 const trendData = [
 ...selectedTrend.trendPoints.map(v => Number(v.toFixed(2))),
 ...Array(slicedForecastPeriods.length).fill(null)
 ];

 const baseColor = trendType === 'increasing' ? '#10B981' : '#EF4444';

 return {
 tooltip: {
 trigger: 'axis',
 valueFormatter: (v: any) => Number(v).toFixed(2)
 },
 legend: {
 data: ['Actual Data', 'Forecast', 'Trending Analysis'],
 bottom: 0
 },
 grid: {
 left: '3%',
 right: '4%',
 bottom: '10%',
 top: '10%',
 containLabel: true
 },
 xAxis: {
 type: 'category',
 boundaryGap: false,
 data: allPeriods,
 axisLabel: {
 rotate: 45,
 color: '#64748B'
 }
 },
 yAxis: {
 type: 'value',
 splitLine: { lineStyle: { type: 'dashed', color: '#E2E8F0' } }
 },
 series: [
 {
 name: 'Actual Data',
 type: 'line',
 smooth: true,
 showSymbol: false,
 data: actualData,
 itemStyle: { color: baseColor },
 lineStyle: { width: 3 }
 },
 {
 name: 'Forecast',
 type: 'line',
 smooth: true,
 symbol: 'circle',
 symbolSize: 6,
 data: forecastData,
 itemStyle: { color: '#8b5cf6' },
 lineStyle: { width: 3, type: 'dashed' },
 label: {
 show: true,
 position: 'top',
 formatter: (p: any) => Number(p.value).toFixed(2)
 }
 },
 {
 name: 'Trending Analysis',
 type: 'line',
 symbol: 'none',
 data: trendData,
 lineStyle: { width: 2, type: 'dotted', color: '#F59E0B' }
 }
 ]
 };
 }, [selectedTrend, trendType]);

 const columnDefs = useMemo<ColDef[]>(() => [
 {
 field: 'category',
 headerName: 'Subject Category',
 flex: 1,
 filter: true,
 sortable: true,
 }
 ], []);

 const defaultColDef = useMemo(() => ({
 resizable: true,
 }), []);

 return (
 <div className="relative bg-white p-1 rounded-2xl shadow-sm transition-transform duration-300 h-full flex flex-col overflow-hidden group">
 <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-5 h-full flex flex-col z-10">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-xl font-bold text-black">Trending Subjects </h3>
 <Select
 defaultValue="increasing"
 style={{ width: 160 }}
 onChange={(v) => setTrendType(v)}
 >
 <Option value="increasing"> Rising Trends</Option>
 <Option value="decreasing"> Falling Trends</Option>
 </Select>
 </div>

 <div className="flex-grow ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
 {loading ? (
 <div className="flex items-center justify-center h-full">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
 </div>
 ) : (
 <AgGridReact
 rowData={currentData}
 columnDefs={columnDefs}
 defaultColDef={defaultColDef}
 onRowClicked={handleRowClick}
 rowSelection="single"
 pagination={true}
 paginationPageSize={10}
 loading={loading}
 />
 )}
 </div>

 <Modal
 title={selectedTrend?.category}
 open={isModalVisible}
 onCancel={() => setIsModalVisible(false)}
 footer={null}
 width={900}
 >
 {selectedTrend && (
 <div className="space-y-8 mt-6">
 <div className={`${trendType === "increasing" ? "bg-green-500/10 p-4 rounded-full" : 'bg-[#FF8A8A]/20 p-4 rounded-full'}`}>
 <div className="text-center">
 <div className="text-sm font-semibold text-black">Avg Growth Rate</div>
 <div className={`${trendType === 'increasing' ? 'text-green-600' : 'text-red-600'} text-3xl font-bold`}>
 {selectedTrend.avgGrowthRate.toFixed(2)}%
 </div>
 </div>
 </div>

 <div className="h-72 bg-white rounded-2xl p-4 shadow-sm relative">
 {forecastLoading && (
 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
 </div>
 )}
 <ReactEChartsCore
 echarts={echarts}
 option={getModalChartOption}
 style={{ height: '100%', width: '100%' }}
 />
 </div>

 <div className="border-t pt-6">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-lg font-bold">Top Contributors</h4>
 <div className="flex gap-2">
 <button
 onClick={() => setContributorType('district')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${contributorType === 'district'
 ? 'bg-blue-500 text-white shadow-sm'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 Districts
 </button>
 <button
 onClick={() => setContributorType('taluka')}
 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${contributorType === 'taluka'
 ? 'bg-blue-500 text-white shadow-sm'
 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
 }`}
 >
 Talukas
 </button>
 </div>
 </div>

 <table className="min-w-full divide-y divide-slate-100">
 <thead>
 <tr>
 <th className="px-6 py-4 text-left">{contributorType === 'district' ? 'District' : 'Taluka'}</th>
 {contributorType === 'taluka' && <th className="px-6 py-4 text-left">District</th>}
 <th className="px-6 py-4 text-right">Count</th>
 <th className="px-6 py-4 text-right">Contribution</th>
 </tr>
 </thead>
 <tbody>
 {contributorType === 'district'
 ? selectedTrend.districtContributors?.map((c, i) => (
 <tr key={i}>
 <td className="px-6 py-4">{c.name}</td>
 <td className="px-6 py-4 text-right">{c.count}</td>
 <td className="px-6 py-4 text-right font-bold">
 {c.percentage.toFixed(2)}%
 </td>
 </tr>
 ))
 : selectedTrend.talukaContributors?.map((c, i) => {

 const match = c.name.match(/^(.+?)\s+\((.+)\)$/);
 const talukaName = match ? match[1] : c.name;
 const districtName = match ? match[2] : '';

 return (
 <tr key={i}>
 <td className="px-6 py-4">{talukaName}</td>
 <td className="px-6 py-4">{districtName}</td>
 <td className="px-6 py-4 text-right">{c.count}</td>
 <td className="px-6 py-4 text-right font-bold">
 {c.percentage.toFixed(2)}%
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </Modal>
 </div>
 </div>
 );
}
