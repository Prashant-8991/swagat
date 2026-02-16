//@ts-nocheck
import { useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "../../utils/chartConfig";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";

interface DepartmentTreeMapProps {
 data: ChartData[];
 onTileClick: (value: string | null) => void;
 onContextMenu: (params: any) => void;
 selectedValue: string | null;
}

const COLOR_PALETTE = [
 "#5470C6",
 "#91CC75",
 "#FAC858",
 "#EE6666",
 "#73C0DE",
 "#3BA272",
 "#FC8452",
 "#9A60B4",
 "#EA7CCC",
 "#A7A7A7",

];

export default function DepartmentTreeMap({
 data,
 onTileClick,
 onContextMenu,
 selectedValue,
}: DepartmentTreeMapProps) {
 const chartRef = useRef<any>(null);

 const sortedData = [...data].sort((a, b) => b.count - a.count);

 const treeData = sortedData.map((d, idx) => {
 const isSelected = d.departmentName === selectedValue;
 const hasSelection = selectedValue !== null;

 const baseColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];


 let tileColor;
 if (isSelected) {

 tileColor = CHART_COLORS.primaryHover;
 } else if (hasSelection) {
 } else {

 tileColor = baseColor;
 }

 const borderColor = isSelected ? CHART_COLORS.primaryHover : "#ffffff";

 return {
 name: d.departmentName,
 value: d.count,
 itemStyle: {
 color: tileColor,
 borderColor: borderColor,

 borderWidth: isSelected ? 3 : 1,
 borderRadius: 10,
 gapWidth: 2,
 },
 };
 });
 function fontApplier(): number {
 if (window.innerWidth < 640) {
 return 8;
 } else if (window.innerWidth < 768 && window.innerWidth > 640) {
 return 10;
 } else if (window.innerWidth < 1024 && window.innerWidth > 768) {
 return 11;
 } else if (window.innerWidth < 1280 && window.innerWidth > 1024) {
 return 12;
 } else if (window.innerWidth > 1280) {
 return 15;
 }
 }

 const option = {
 tooltip: {
 backgroundColor: "rgba(255,255,255,0.95)",
 borderColor: "#E5E7EB",
 borderWidth: 1,
 textStyle: { color: "#374151" },
 formatter: (params: any) => {
 return `
 <div style="font-weight:600; margin-bottom:4px;">
 ${params.name}
 </div>
 <div>Count: ${params.value?.toLocaleString?.() ?? 0}</div>
 <div style="font-size:11px; color:#6B7280; margin-top:4px;">
 💡 Click to cross filter
 </div>
 `;
 }
 },

 series: [
 {
 name: "Departments",
 type: "treemap",
 roam: true,
 nodeClick: false,
 breadcrumb: { show: false },
 data: treeData,
 label: {
 show: true,
 formatter: (params: any) => {
 const name = params.name || "";
 const short =
 name.length > 18
 ? name.substring(0, 18) + "…"
 : name;

 return `${short}\n${params.value?.toLocaleString?.() ?? 0}`;
 },
 color: "#ffffff",
 fontSize: fontApplier(),
 fontWeight: 600,
 lineHeight: 16,
 },
 itemStyle: {
 borderWidth: 1,
 },
 emphasis: {
 itemStyle: {
 shadowBlur: 12,
 shadowColor: `${CHART_COLORS.primary}99`,
 },
 label: {
 fontSize: 14,
 fontWeight: "bold",
 },
 },
 animationDuration: 700,
 animationEasing: "cubicOut",
 },
 ],
 };

 const onEvents = {
 click: (params: any) => {
 if (params.componentType === "series") {
 const clickedValue = params.name;
 if (selectedValue === clickedValue) {
 onTileClick(null);
 } else {
 onTileClick(clickedValue);
 }
 }
 },
 contextmenu: (params: any) => {
 if (params.componentType === "series") {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();

 onContextMenu({
 ...params,
 name: params.name,
 });
 }
 },
 };
 useEffect(() => {
 if (chartRef.current) {
 const dom = chartRef.current.getEchartsInstance().getDom();

 const handleContextMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };

 dom.addEventListener("contextmenu", handleContextMenu);
 return () =>
 dom.removeEventListener("contextmenu", handleContextMenu);
 }
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: "400px", width: "100%" }}
 opts={{ renderer: "canvas" }}
 />
 );
}