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

// Warm professional palette — no indigo/purple/neon
const COLOR_PALETTE = [
    "#7EAEC4", // warm blue
    "#9BBB9E", // sage
    "#F0B89A", // peach
    "#8FA3B0", // slate
    "#89C4B0", // mint
    "#D4A953", // amber
    "#E89B8B", // coral
    "#A0B88C", // olive
    "#C78D6B", // copper  
    "#E8B4B8", // blush
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
                borderRadius: 10,
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
            borderColor: "rgba(0, 0, 0, 0.06)",
            borderWidth: 1,
            borderRadius: 12,
            textStyle: { color: "#374151", fontFamily: "Inter, sans-serif" },
            formatter: (params: any) => {
                return `
 <div style="font-weight: 600; margin-bottom: 4px; font-size: 13px;">
 ${params.name}
 </div>
 <div style="font-size: 12px;">Count: <strong>${params.value.toLocaleString()}</strong></div>
 <div style="font-size: 11px; color: #98A2B3; margin-top: 6px;">
 Right-click for detailed analysis
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
                    fontFamily: "Inter, sans-serif",
                },
                upperLabel: { show: false },
                itemStyle: {
                    gapWidth: 4,
                    borderRadius: 12,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 20,
                        shadowColor: `rgba(126, 174, 196, 0.4)`,
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