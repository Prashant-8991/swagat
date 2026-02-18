//@ts-nocheck
import { useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "../../utils/chartConfig";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";

interface DesignationTreeMapProps {
 data: ChartData[];
 onBack: () => void;
 onContextMenu?: (params: any) => void;
}

const COLOR_PALETTE = [
 "#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE",
 "#3BA272", "#FC8452", "#9A60B4", "#EA7CCC", "#A7A7A7"
];

export default function DesignationTreeMap({
 data,
 onBack,
 onContextMenu,
}: DesignationTreeMapProps) {
 const chartRef = useRef<any>(null);

 const sortedData = [...data].sort((a, b) => b.count - a.count);

 const treeData = sortedData.map((d, idx) => {
 const baseColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
 return {
 name: d.forwardedToDesignation,
 value: d.count,
 itemStyle: {
 color: baseColor,
 borderColor: "#ffffff",
 borderWidth: 1,
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
 `;
 },
 },
 series: [
 {
 name: "Designation Distribution",
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
 itemStyle: {
 gapWidth: 4,
 borderRadius: 10,
 },
 emphasis: {
 itemStyle: {
 shadowBlur: 20,
 shadowColor: `${CHART_COLORS.primary}80`,
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

 return (
 <div className="relative">
 <button
 onClick={onBack}
 className="absolute top-2 left-2 z-10 px-3 py-1 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
 >
 ← Back to Departments
 </button>
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={{
 contextmenu: (params: any) => {
 if (params.componentType === 'series' && onContextMenu) {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 onContextMenu(params);
 }
 }
 }}
 style={{ height: "420px", width: "100%" }}
 opts={{ renderer: "canvas" }}
 />
 </div>
 );
}
