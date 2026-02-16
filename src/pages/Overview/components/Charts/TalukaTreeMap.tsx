//@ts-nocheck
import { useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "../../utils/chartConfig";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";

interface TalukaTreeMapProps {
    data: ChartData[];
    onBack: () => void;
    onTileClick?: (taluka: string) => void;
    onContextMenu?: (params: any) => void;
}

const COLOR_PALETTE = [
    "#2EC7C9", "#B6A2DE", "#5AB1EF", "#FFB980", "#D87A80",
    "#8D98B3", "#E5CF09", "#97B552", "#95706C", "#DC69AA"
];

export default function TalukaTreeMap({
    data,
    onBack,
    onTileClick,
    onContextMenu,
}: TalukaTreeMapProps) {
    const chartRef = useRef<any>(null);

    const filteredData = data.filter((d) => d.taluka && d.taluka.trim() !== "" && d.taluka.toLowerCase() !== "null");
    const sortedData = [...filteredData].sort((a, b) => b.count - a.count);

    const treeData = sortedData.map((d, idx) => {
        const baseColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        return {
            name: d.taluka,
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
                name: "Taluka Distribution",
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

    return (
        <div className="relative">
            <button
                onClick={onBack}
                className="absolute top-2 left-2 z-10 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                ← Back to Districts
            </button>
            <ReactEChartsCore
                ref={chartRef}
                echarts={echarts}
                option={option}
                onEvents={{
                    click: (params: any) => {
                        if (params.componentType === 'series' && onTileClick) {
                            onTileClick(params.name);
                        }
                    },
                    contextmenu: (params: any) => {
                        if (params.componentType === 'series' && onContextMenu) {
                            params.event.event.preventDefault();
                            params.event.event.stopPropagation();
                            onContextMenu(params);
                        }
                    }
                }}
                style={{ height: "200px", width: "100%" }}
                opts={{ renderer: "canvas" }}
            />
        </div>
    );
}
