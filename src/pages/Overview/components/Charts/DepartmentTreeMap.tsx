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
    "#7EAEC4", "#9BBB9E", "#F0B89A", "#8FA3B0", "#89C4B0",
    "#D4A953", "#E89B8B", "#A0B88C", "#C78D6B", "#E8B4B8",
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
        const baseColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        let tileColor = isSelected ? CHART_COLORS.primaryHover : baseColor;
        const borderColor = isSelected ? CHART_COLORS.primaryHover : "#ffffff";

        return {
            name: d.departmentName,
            value: d.count,
            itemStyle: {
                color: tileColor,
                borderColor: borderColor,
                borderWidth: isSelected ? 3 : 1,
                borderRadius: 12,
                gapWidth: 2,
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
            backgroundColor: "rgba(255,255,255,0.95)",
            borderColor: "rgba(0, 0, 0, 0.06)",
            borderWidth: 1,
            borderRadius: 12,
            textStyle: { color: "#374151", fontFamily: "Inter, sans-serif" },
            formatter: (params: any) => {
                return `
 <div style="font-weight:600; margin-bottom:4px; font-size: 13px;">
 ${params.name}
 </div>
 <div style="font-size: 12px;">Count: <strong>${params.value?.toLocaleString?.() ?? 0}</strong></div>
 <div style="font-size:11px; color:#98A2B3; margin-top:6px;">
 Click to cross filter
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
                        const short = name.length > 18 ? name.substring(0, 18) + "..." : name;
                        return `${short}\n${params.value?.toLocaleString?.() ?? 0}`;
                    },
                    color: "#ffffff",
                    fontSize: fontApplier(),
                    fontWeight: 600,
                    lineHeight: 16,
                    fontFamily: "Inter, sans-serif",
                },
                itemStyle: {
                    borderWidth: 1,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 12,
                        shadowColor: `rgba(126, 174, 196, 0.4)`,
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
            return () => dom.removeEventListener("contextmenu", handleContextMenu);
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