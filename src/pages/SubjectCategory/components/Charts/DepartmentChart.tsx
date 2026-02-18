//@ts-nocheck
import ReactECharts from 'echarts-for-react';
import { EChartsOption, EChartsEvents } from 'echarts';
import React from 'react';

interface DepartmentChartProps {
 data: {
 departmentName?: string; 
 taluka?: string; 
 count: number;
 percentage?: number;
 }[];
 onDepartmentClick: (name: string) => void; 
 onContextMenu: (params: any) => void; 
 selectedDepartment: string | null; 
}

const DepartmentChart = (
 {
 data,
 onDepartmentClick,
 onContextMenu,
 selectedDepartment
 }: DepartmentChartProps
) => {
 
 const nameKey = data.length > 0 && data[0].hasOwnProperty('departmentName') ? 'departmentName' : 'taluka';

 const sortedData = [...data].sort((a, b) => b.count - a.count);
 
 const COLOR_PALETTE = [
 '#2EC7C9',
 '#B6A2DE',
 '#5AB1EF',
 '#FFB980',
 '#D87A80',
 '#8D98B3',
 '#E5CF09',
 '#97B552',
 '#95706C',
 '#DC69AA',
 '#FF6B6B',
 '#4ECDC4',
 '#45B7D1',
 '#FFA07A',
 '#98D8C8'
 ];
 
 const dataForPie = sortedData.map((item, index) => {
 const name = item[nameKey];
 const baseColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
 return {
 value: item.count,
 name: name,
 itemStyle: {
 color: baseColor,
 borderColor: '#fff',
 borderWidth: 2,
 shadowBlur: name === selectedDepartment ? 15 : 0,
 shadowOffsetX: 0,
 shadowColor: name === selectedDepartment ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
 },
 };
 });
 
 const options: EChartsOption = {
 title: {
 text: 'Grievances by Department',
 left: 'center',
 show: false,
 },
 tooltip: {
 trigger: 'item',
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#E5E7EB',
 borderWidth: 1,
 textStyle: { color: '#374151' },
 formatter: '{b}<br/>{c} ({d}%)' 
 },
 color: COLOR_PALETTE,
 series: [
 {
 name: 'Grievance Count',
 type: 'pie', 
 radius: ['40%', '70%'], 
 center: ['65%', '50%'], 
 data: dataForPie,
 label: {
 show: true,
 position: 'outside',
 formatter: '{b}: {d}%',
 color: '#374151',
 fontSize: 12,
 },
 emphasis: {
 itemStyle: {
 shadowBlur: 20,
 shadowColor: 'rgba(94, 177, 239, 0.8)',
 shadowOffsetX: 0,
 },
 label: {
 fontSize: 13,
 fontWeight: 'bold'
 }
 },
 animationDuration: 800,
 animationEasing: 'cubicOut'
 }
 ]
 };

 const onEvents: EChartsEvents = {
 click: (params: any) => {
 if (params.componentType === 'series' && params.name) {
 onDepartmentClick(params.name);
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
 <ReactECharts
 option={options}
 onEvents={onEvents}
 style={{ height: '100%' }}
 />
 )
}

export default DepartmentChart;