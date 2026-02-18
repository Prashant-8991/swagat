//@ts-nocheck
import { useEffect, useRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { echarts } from '../../utils/chartConfig';
import { ChartData } from '../../types';
import { CHART_COLORS } from '../../../../utils/colorPalette';

interface GrievanceStatusBarChartProps {
 data: ChartData[];
 onBarClick: (value: string) => void;
 onContextMenu: (params: any) => void;
 selectedValue: string | null;
}

export default function GrievanceStatusBarChart({
 data,
 onBarClick,
 onContextMenu,
 selectedValue
}: GrievanceStatusBarChartProps) {
 const chartRef = useRef<any>(null);

 const option = {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' },
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#E5E7EB',
 borderWidth: 1,
 textStyle: { color: '#374151' },
 formatter: (params: any) => {
 const param = params[0];
 return `
 <div style="font-weight: 600; margin-bottom: 4px;">${param.name}</div>
 <div>Count: ${param.value.toLocaleString()}</div>
 <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">💡 Tip: Right-click for detailed analysis</div>
 `;
 }
 },
 grid: {
 left: '3%',
 right: '4%',
 bottom: '15%',
 top: '5%',
 containLabel: true
 },
 dataZoom: [
 {
 type: 'slider',
 show: false,
 xAxisIndex: [0],
 start: 0,
 end: data.length > 8 ? (8 / data.length) * 100 : 100,
 bottom: '5%',
 height: 20,
 borderColor: '#E5E7EB',
 fillerColor: `${CHART_COLORS.accent}40`,
 handleStyle: {
 color: CHART_COLORS.accent,
 borderColor: CHART_COLORS.accentHover
 },
 moveHandleSize: 8,
 textStyle: {
 color: '#6B7280',
 fontSize: 10
 }
 },
 {
 type: 'inside',
 xAxisIndex: [0],
 start: 0,
 end: data.length > 8 ? (8 / data.length) * 100 : 100
 }
 ],
 xAxis: {
 type: 'category',
 data: data.map((d) => d.grievanceStatus),
 axisLabel: {
 rotate: 45,
 fontSize: 11,
 color: '#6B7280',
 interval: 0
 },
 axisLine: { lineStyle: { color: '#E5E7EB' } }
 },
 yAxis: {
 type: 'value',
 axisLabel: {
 fontSize: 11,
 color: '#6B7280',
 formatter: (value: number) => value.toLocaleString()
 },
 splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } }
 },
 series: [
 {
 type: 'bar',
 data: data.map((d) => ({
 value: d.count,
 itemStyle: {
 color: d.grievanceStatus === selectedValue
 ? CHART_COLORS.accentHover
 : CHART_COLORS.accent,
 borderRadius: [8, 8, 0, 0],
 borderWidth: d.grievanceStatus === selectedValue ? 3 : 0,
 borderColor: CHART_COLORS.accentHover
 }
 })),
 emphasis: {
 itemStyle: {
 color: CHART_COLORS.accentHover,
 shadowBlur: 10,
 shadowColor: `${CHART_COLORS.accent}80`
 }
 },
 barWidth: '60%'
 }
 ]
 };

 const onEvents = {
 click: (params: any) => {
 if (params.componentType === 'series') {
 onBarClick(params.name);
 }
 },
 contextmenu: (params: any) => {
 if (params.componentType === 'series') {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 onContextMenu(params);
 }
 }
 };

 useEffect(() => {
 if (chartRef.current) {
 const chartInstance = chartRef.current.getEchartsInstance();
 const dom = chartInstance.getDom();
 const handleContextMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };
 dom.addEventListener('contextmenu', handleContextMenu);
 return () => {
 dom.removeEventListener('contextmenu', handleContextMenu);
 };
 }
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '400px', width: '100%' }}
 opts={{ renderer: 'canvas' }}
 />
 );
}
