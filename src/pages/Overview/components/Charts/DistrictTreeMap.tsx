//@ts-nocheck
import { useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "../../utils/chartConfig";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";

interface DistrictTreeMapProps {
 data: ChartData[];
 onTileClick: (value: string) => void;
 onContextMenu: (params: any) => void;
 selectedValue: string | null;
}

const COLOR_PALETTE = [
 "#2EC7C9", 
 "#B6A2DE", 
 "#5AB1EF", 
 "#FFB980", 
 "#D87A80", 
 "#8D98B3", 
 "#E5CF09", 
 "#97B552", 
 "#95706C", 
 "#DC69AA", 
];

export default function DistrictTreeMap({
 data,
 onTileClick,
 onContextMenu,
 selectedValue,
}: DistrictTreeMapProps) {
 const chartRef = useRef<any>(null);

 const sortedData = [...data].sort((a, b) => b.count - a.count);

 const treeData = sortedData.map((d, idx) => {
 const baseColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
 const tileColor =
 d.district === selectedValue ? CHART_COLORS.powder : baseColor;
 const tileBorderColor =
 d.district === selectedValue ? CHART_COLORS.powder : "#ffffff";

 return {
 name: d.district,
 value: d.count,
 itemStyle: {
 color: tileColor,
 borderColor: tileBorderColor,
 borderWidth: d.district === selectedValue ? 3 : 1,
 borderRadius: 8,
 },
 };
 });

 function fontApplier(): number {
 if (window.innerWidth < 640) return 8;
 else if (window.innerWidth < 768) return 10;
 else if (window.innerWidth < 1024) return 11;
 else if (window.innerWidth < 1280) return 12;
 else return 15;
 }

 const option = {
 tooltip: {
 backgroundColor: "rgba(255, 255, 255, 0.95)",
 borderColor: "#E5E7EB",
 borderWidth: 1,
 textStyle: { color: "#374151" },
 formatter: (params: any) => {
 return `
 <div style="font-weight: 600; margin-bottom: 4px;">
 ${params.name}
 </div>
 <div>Count: ${params.value.toLocaleString()}</div>
 <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">
 💡 Tip: Right-click for detailed analysis
 </div>
 `;
 },
 },
 series: [
 {
 name: "District Distribution",
 type: "treemap",
 roam: true,
 nodeClick: false,
 breadcrumb: { show: false },
 data: treeData,
 leafDepth: 1,
 drillDownIcon: "",
 label: {
 cursor: "pointer",
 show: true,
 position: "inside",
 formatter: "{b}\n{c}",
 color: "white",
 fontWeight: 600,
 fontSize: fontApplier(),
 overflow: "break",
 },
 upperLabel: { show: false },
 itemStyle: {
 gapWidth: 4,
 borderRadius: 10,
 },
 emphasis: {
 itemStyle: {
 shadowBlur: 20,
 shadowColor: `${CHART_COLORS.skyBlue}80`,
 },
 label: {
 fontSize: 14,
 fontWeight: "bold",
 },
 },
 animationDuration: 800,
 animationEasing: "cubicOut",
 },
 ],
 };

 const onEvents = {
 click: (params: any) => {
 if (params.componentType === "series") {
 if (onTileClick) {
 onTileClick(params.name);
 }
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

 useEffect(() => {
 if (chartRef.current) {
 const chartInstance = chartRef.current.getEchartsInstance();
 const dom = chartInstance.getDom();
 const handleContextMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };
 dom.addEventListener("contextmenu", handleContextMenu);
 return () => {
 dom.removeEventListener("contextmenu", handleContextMenu);
 };
 }
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: "390px", width: "100%" }}
 opts={{ renderer: "canvas" }}
 />
 );
}