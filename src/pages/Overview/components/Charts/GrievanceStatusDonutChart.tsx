//@ts-nocheck
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import { ChartData } from '../../types';

type EChartsOption = echarts.EChartsOption;

interface GrievanceStatusDonutChartProps {
 data: ChartData[];
 onBarClick: (value: string) => void;
 onContextMenu: (params: any) => void;
 selectedValue: string | null;
}

const GrievanceStatusDonutChart = ({
 data,
 onBarClick,
 onContextMenu,
 selectedValue
}: GrievanceStatusDonutChartProps) => {
 const option: EChartsOption = {
 color: ["#097969", "#D22B2B"],
 tooltip: {
 trigger: 'item'
 },
 legend: {
 top: '5%',
 left: 'center'
 },
 series: [
 {
 name: 'Grievances by Status',
 type: 'pie',
 radius: ['40%', '70%'],
 center: ['50%', '70%'],
 avoidLabelOverlap: false,
 itemStyle: {
 borderRadius: 10,
 borderColor: '#fff',
 borderWidth: 2
 },
 label: {
 show: true,
 position: 'outside',
 formatter: '{b}: {c}'
 },
 startAngle: 180,
 endAngle: 360,
 data: data.map((item) => ({
 value: item.count,
 name: item.grievanceStatus,
 itemStyle: item.grievanceStatus === "Disposed" ? { color: "#097969" } : { color: "#D22B2B" }
 }))
 }
 ],
 emphasis: {
 label: {
 show: true,
 fontSize: 20,
 fontWeight: 'bold'
 }
 },
 };

 const onEvents = {
 "click": (params) => {
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
 }
 return (
 <>
 <ReactECharts
 option={option}
 onEvents={onEvents}
 style={{ height: '400px', width: '100%' }}
 opts={{ renderer: "canvas" }}
 />
 </>
 );
}

export default GrievanceStatusDonutChart
