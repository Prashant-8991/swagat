//@ts-nocheck
import React, { useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { dispose, type EChartsOption } from "echarts";
import { echarts } from "../pages/SubjectCategory/utils/chartConfig";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { CHART_COLORS } from "../utils/colorPalette";

type ApiDisposeChannel = {
 count: number;
 disposeChnl: string;
 percentage: number;
};

type GetKPIRoseDataResponse = {
 dashboardPage1: {
 disposeChannels: ApiDisposeChannel[];
 };
};

interface KPIRosePieChartProps {
 onChannelClick: (channel: string) => void;
 onContextMenu: (params: any) => void;
 selectedValue: string | null;
 departmentName?: string | null;
 grievanceStatus?: string | null;
 district?: string | null;
 programTypes?: string[] | null;
 fromDate?: string | null;
 toDate?: string | null;
}

const GET_KPI_ROSE_DATA = gql`
 query DisposeChannels($departmentName: String, $grievanceStatus: String, $district: String, $programTypes: [String!], $fromDate: String, $toDate: String) {
 dashboardPage1(departmentName: $departmentName, grievanceStatus: $grievanceStatus, district: $district, programTypes: $programTypes, fromDate: $fromDate, toDate: $toDate) {
 disposeChannels {
 count
 disposeChnl
 percentage
 }
 }
 }
`;

const KPIRosePieChart: React.FC<KPIRosePieChartProps> = ({
 onChannelClick,
 onContextMenu,
 selectedValue,
 departmentName,
 grievanceStatus,
 district,
 programTypes,
 fromDate,
 toDate,
 onTileClick
}) => {
 const chartRef = useRef<any>(null);
 const { data, loading, error } = useQuery<GetKPIRoseDataResponse>(
 GET_KPI_ROSE_DATA,
 {
 variables: {
 departmentName,
 grievanceStatus,
 district,
 programTypes,
 fromDate,
 toDate
 }
 }
 );

 if (loading) {
 return <div className="p-4">Loading...</div>;
 }

 if (error) {
 return (
 <div className="text-red-500 p-4">
 Error: {error.message || "Something went wrong"}
 </div>
 );
 }

 const rawData = data?.dashboardPage1?.disposeChannels ?? [];

 if (rawData.length === 0) {
 return <div className="p-4">No data available.</div>;
 }

 const getColorForChannel = (channel: string) => {
 switch (channel) {
 case "Yellow":
 return {
 type: "linear" as const,
 x: 0, y: 0, x2: 1, y2: 1,
 colorStops: [
 { offset: 0, color: "#FFEA00" },
 { offset: 1, color: "#FFD700" }
 ]
 };
 case "Green":
 return {
 type: "linear" as const,
 x: 0, y: 0, x2: 1, y2: 1,
 colorStops: [
 { offset: 0, color: "#50C878" },
 { offset: 1, color: "#2E8B57" }
 ]
 };
 case "Red":
 return {
 type: "linear" as const,
 x: 0, y: 0, x2: 1, y2: 1,
 colorStops: [
 { offset: 0, color: "#F54927" },
 { offset: 1, color: "#DC143C" }
 ]
 };
 default:
 return {
 type: "linear" as const,
 x: 0, y: 0, x2: 1, y2: 1,
 colorStops: [
 { offset: 0, color: "#999999" },
 { offset: 1, color: "#666666" }
 ]
 };
 }
 };

 const seriesData = rawData.map((item) => ({
 name: item.disposeChnl,
 value: item.count,
 itemStyle: {
 color: getColorForChannel(item.disposeChnl),
 borderRadius: 8,
 borderWidth: item.disposeChnl === selectedValue ? 3 : 1,
 borderColor: item.disposeChnl === selectedValue ? CHART_COLORS.accentHover : "#fff",
 },
 }))

 const onEvents = {
 click: (params: any) => {
 if (params.componentType === "series") {
 const clickedValue = params.name;

 if (selectedValue === clickedValue) {
 onChannelClick(null);
 } else {
 onChannelClick(clickedValue);
 }
 onChannelClick(params.name);
 }
 },
 contextmenu: (params: any) => {
 if (params.componentType === "series") {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();

 onContextMenu(
 {
 name: params.data.name,
 value: params.data.value,
 event: params.event,
 },
 )
 }
 }
 };

 const option: EChartsOption = {
 tooltip: {
 trigger: "item",
 formatter: "{b}: {c} ({d}%)",
 },
 series: [
 {
 name: "Dispose Channels",
 label: false,
 type: "pie",
 radius: ["30%", "70%"],
 center: ["50%", "50%"],
 roseType: "area",
 itemStyle: {
 borderRadius: 8,
 },
 data: seriesData,
 },
 ],
 };

 return (
 <div className="w-[250px] h-[250px]">
 <ReactECharts
 option={option}
 onEvents={onEvents}
 style={{ height: "100%", width: "100%" }}
 opts={{ renderer: "canvas" }}
 />
 </div>
 );
};

export default KPIRosePieChart;

