//@ts-nocheck
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";

type EChartsOption = echarts.EChartsOption;

interface DisposeChannelDonutChartProps {
 data: ChartData[];
 onBarClick: (value: string) => void;
 onContextMenu: (params: any) => void;
 selectedValue: string | null;
}

const DisposeChannelCountDonut = ({
 data,
 onBarClick,
 onContextMenu,
 selectedValue,
}: DisposeChannelDonutChartProps) => {

 const option: EChartsOption = {
 tooltip: {
 trigger: "item",
 },

 legend: {
 top: "5%",
 left: "center",
 },

 series: [
 {
 name: "Grievances by Dispose Channel",
 type: "pie",
 radius: ["40%", "70%"], 
 center: ["50%", "50%"],

 itemStyle: {
 borderRadius: 10,
 borderColor: "#fff",
 borderWidth: 2,
 },

 label: {
 show: false,
 position: "center",
 },

 data: data.map((item) => ({
 value: item.count,
 name: item.disposeChnl,
 label: {
 show: true,
 position: 'outside',
 formatter: '{b}: {c}'
 },
 itemStyle: {
 color:
 item.disposeChnl === "Yellow"
 ? "#FFEA00"
 : item.disposeChnl === "Green"
 ? "#50C878"
 : item.disposeChnl === "Red"
 ? "#F54927"
 : "#999999", 
 borderWidth: item.disposeChnl === selectedValue ? 3 : 2,
 borderColor:
 item.disposeChnl === selectedValue
 ? CHART_COLORS.accentHover
 : "#fff",
 },
 })),
 },
 ],

 emphasis: {
 label: {
 show: true,
 fontSize: 30,
 fontWeight: "bold",
 },
 },
 };

 const onEvents = {
 click: (params: any) => {
 if (params.componentType === "series") {
 onBarClick(params.name);
 }
 },

 contextmenu: (params: any) => {
 if (params.componentType === "series") {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 onContextMenu(params);
 }
 },
 };

 return (
 <ReactECharts
 option={option}
 onEvents={onEvents}
 style={{ height: "400px", width: "100%" }}
 opts={{ renderer: "canvas" }}
 />
 );
};

export default DisposeChannelCountDonut;
