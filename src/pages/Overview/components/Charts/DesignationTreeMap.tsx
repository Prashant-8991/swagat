//@ts-nocheck
import { useEffect, useRef } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts } from "../../utils/chartConfig";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface DesignationTreeMapProps {
    data: ChartData[];
    onBack: () => void;
    onContextMenu?: (params: any) => void;
}

const COLOR_PALETTE = [
    "#7EAEC4", "#9BBB9E", "#F0B89A", "#8FA3B0", "#89C4B0",
    "#D4A953", "#E89B8B", "#A0B88C", "#C78D6B", "#E8B4B8",
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
                    fontFamily: "Inter, sans-serif",
                },
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

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onBack}
                className="absolute top-2 left-2 z-10 px-3 py-1.5 glass-strong rounded-lg shadow-glass-sm text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-white/80 flex items-center gap-1.5 transition-all"
            >
                <ArrowLeft size={14} strokeWidth={2} />
                Back
            </motion.button>
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
