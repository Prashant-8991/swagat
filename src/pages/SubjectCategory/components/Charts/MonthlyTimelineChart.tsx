//@ts-nocheck
import React, { useRef, memo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { echarts } from '../../utils/chartConfig';
import { MonthlyTrend } from '../../types';
import { convertMonthToFilter } from '../../utils/dateHelpers';
import { CHART_COLORS } from '../../../../utils/colorPalette';

interface MonthlyTimelineChartProps {
 historical: MonthlyTrend[];
 forecast: MonthlyTrend[];
 forecastLoading: boolean;
 onMonthClick: (monthDisplay: string) => void;
 onContextMenu: (params: any) => void;
 selectedMonth: string | null;
 chartRef?: React.RefObject<any>;
}

const MonthlyTimelineChart = memo(function MonthlyTimelineChart({
 historical,
 forecast,
 forecastLoading,
 onMonthClick,
 onContextMenu,
 selectedMonth,
 chartRef
}: MonthlyTimelineChartProps) {
 const internalChartRef = useRef<any>(null);
 const actualChartRef = chartRef || internalChartRef;

 const allMonths = [
 ...historical.map((d: MonthlyTrend) => d.monthDisplay),
 ...forecast.map((d: MonthlyTrend) => d.monthDisplay)
 ];

 const legendData = ['Historical'];
 if (forecast.length > 0) {
 legendData.push('Forecast', '95% Confidence');
 }

 const option = {
 tooltip: {
 trigger: 'axis',
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#000000',
 borderWidth: 1,
 textStyle: { color: '#475569' },
 formatter: (params: any) => {
 let html = `<div style="padding: 8px;">`;
 html += `<div style="font-weight: 600; margin-bottom: 6px; font-size: 14px;">${params[0].name}</div>`;

 params.forEach((param: any) => {
 const allData = [...historical, ...forecast];
 const dataItem = allData[param.dataIndex];

 if (dataItem && param.value != null) {
 html += `<div style="margin-bottom: 4px;">
 <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${param.color}; margin-right: 5px;"></span>
 <strong>${param.seriesName}</strong>: ${param.value?.toLocaleString() || 0}
 </div>`;

 if (dataItem.forecastLower && dataItem.forecastUpper) {
 html += `<div style="color: #64748b; font-size: 11px; margin-left: 15px;">
 95% CI: ${dataItem.forecastLower.toLocaleString()} - ${dataItem.forecastUpper.toLocaleString()}
 </div>`;
 }
 }
 });

 html += `<div style="color: #94a3b8; font-size: 11px; margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0;">Right-click to drill through</div>`;
 html += `</div>`;
 return html;
 },
 },
 legend: {
 data: legendData,
 bottom: 10,
 textStyle: { color: '#64748b', fontSize: 12 }
 },
 grid: {
 left: '3%',
 right: '4%',
 bottom: '15%',
 top: '15%', 
 containLabel: true
 },
 xAxis: {
 type: 'category',
 data: allMonths,
 axisLabel: {
 rotate: 45,
 fontSize: 11,
 color: (value: string) => {
 const monthFilter = convertMonthToFilter(value);
 return monthFilter === selectedMonth ? '#3B82F6' : '#64748b';
 },
 fontWeight: (value: string) => {
 const monthFilter = convertMonthToFilter(value);
 return monthFilter === selectedMonth ? 'bold' : 'normal';
 }
 },
 axisLine: { lineStyle: { color: '#e2e8f0' } },
 axisPointer: {
 label: {
 formatter: (params: any) => {
 return params.value;
 }
 }
 }
 },
 yAxis: {
 type: 'value',
 axisLabel: {
 fontSize: 11,
 color: '#64748b',
 formatter: (value: number) => value.toLocaleString()
 },
 splitLine: {
 lineStyle: {
 color: 'rgba(226, 232, 240, 0.5)',
 type: 'dashed'
 }
 }
 },
 series: [
 
 {
 name: 'Historical',
 type: 'line',
 data: historical.map((d: MonthlyTrend) => d.count),
 symbol: 'circle',
 symbolSize: 8,
 itemStyle: {
 color: CHART_COLORS.historical
 },
 lineStyle: {
 width: 3,
 color: CHART_COLORS.historical
 },
 emphasis: {
 itemStyle: {
 borderColor: CHART_COLORS.historical,
 borderWidth: 3
 }
 }
 },
 ...(forecast.length > 0
 ? [
 {
 name: 'Forecast',
 type: 'line',
 data: [
 ...new Array(historical.length).fill(null),
 ...forecast.map((d: MonthlyTrend) => d.count)
 ],
 symbol: 'diamond',
 symbolSize: 8,
 itemStyle: {
 color: CHART_COLORS.forecast
 },
 lineStyle: {
 width: 3,
 type: 'dashed',
 color: CHART_COLORS.forecast
 },
 emphasis: {
 itemStyle: {
 borderColor: CHART_COLORS.forecast,
 borderWidth: 3
 }
 }
 },
 {
 name: '95% Confidence Lower',
 type: 'line',
 data: [
 ...new Array(historical.length).fill(null),
 ...forecast.map((d: MonthlyTrend) => d.forecastLower)
 ],
 lineStyle: { opacity: 0 },
 areaStyle: {
 color: `${CHART_COLORS.forecast}33`
 },
 stack: 'confidence-band',
 symbol: 'none',
 showSymbol: false
 }
 ]
 : [])
 ]
 };

 const onEvents = {
 click: (params: any) => {
 if (params.componentType === 'series' && params.name) {
 onMonthClick(params.name);
 }
 },
 contextmenu: (params: any) => {
 if (params.componentType === 'series' && params.name) {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 onContextMenu(params);
 }
 }
 };

 return (
 <ReactEChartsCore
 ref={actualChartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '100%', width: '100%', cursor: 'pointer' }}
 notMerge={true}
 lazyUpdate={true}
 />
 );
});

export default MonthlyTimelineChart;