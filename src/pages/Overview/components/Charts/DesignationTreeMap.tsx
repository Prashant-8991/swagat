import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartData } from "../../types";
import { useTheme } from "../../../../context/ThemeContext";
import { Info, ArrowLeft } from "lucide-react";

interface DesignationTreeMapProps {
    data: ChartData[];
    onBack: () => void;
    onContextMenu?: (params: any) => void;
}

// Beautiful palettes for Light and Dark modes
const LIGHT_PALETTE = [
    "#8EAEC4", "#A8CDB2", "#F2C7AE", "#A3B7C4", "#A2D8C6",
    "#E6C27A", "#F0B4A8", "#B4C8A6", "#D9A88F", "#F2CCD1"
];

const DARK_PALETTE = [
    "#3B82F6", "#10B981", "#F59E0B", "#6366F1", "#EC4899",
    "#8B5CF6", "#14B8A6", "#F97316", "#06B6D4", "#D946EF"
];

const COLUMN_PATTERN = [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9];

export default function DesignationTreeMap({
    data,
    onBack,
    onContextMenu,
}: DesignationTreeMapProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [hoveredData, setHoveredData] = useState<ChartData | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Sort data
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.count - a.count);
    }, [data]);

    // Distribute into Columns
    const columns = useMemo(() => {
        const cols: ChartData[][] = [];
        let currentIndex = 0;

        for (const count of COLUMN_PATTERN) {
            if (currentIndex >= sortedData.length) break;
            const chunk = sortedData.slice(currentIndex, currentIndex + count);
            if (chunk.length > 0) {
                cols.push(chunk);
            }
            currentIndex += count;
        }

        if (currentIndex < sortedData.length) {
            const remaining = sortedData.slice(currentIndex);
            if (remaining.length > 0) cols.push(remaining);
        }

        return cols;
    }, [sortedData]);

    const currentPalette = isDark ? DARK_PALETTE : LIGHT_PALETTE;

    return (
        <div
            className="relative w-full h-[480px] p-1 select-none cursor-default"
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoveredData(null)}
        >
            {/* Back Button Overlay */}
            <div className="absolute top-2 left-2 z-20">
                <button
                    onClick={onBack}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm backdrop-blur-md transition-all
                        ${isDark
                            ? 'bg-gray-900/40 hover:bg-gray-800/60 text-gray-200 border border-white/10'
                            : 'bg-white/40 hover:bg-white/60 text-gray-700 border border-black/5'
                        }
                    `}
                >
                    <ArrowLeft size={14} />
                    Back
                </button>
            </div>

            <div className="flex w-full h-full gap-2 overflow-hidden pt-10">
                {columns.map((colItems, colIdx) => (
                    <motion.div
                        key={`col-${colIdx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: colIdx * 0.05 }}
                        className="flex flex-col flex-1 h-full gap-2 min-w-[80px]"
                    >
                        {colItems.map((item) => {
                            const globalIndex = sortedData.findIndex(d => d.forwardedToDesignation === item.forwardedToDesignation);
                            const color = currentPalette[globalIndex % currentPalette.length];
                            const isActive = hoveredData?.forwardedToDesignation === item.forwardedToDesignation;

                            return (
                                <motion.div
                                    key={item.forwardedToDesignation}
                                    layoutId={item.forwardedToDesignation}
                                    // Designation map might not have onTileClick in props? Checked original file, it didn't have click handler for tiles besides Back.
                                    // I'll leave onClick empty or just for standard behavior if needed.
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        if (onContextMenu) {
                                            onContextMenu({
                                                name: item.forwardedToDesignation,
                                                value: item.count,
                                                event: { event: e }
                                            });
                                        }
                                    }}
                                    onMouseEnter={() => setHoveredData(item)}
                                    onMouseLeave={() => setHoveredData(null)}
                                    className={`
                                        relative flex-1 rounded-xl cursor-pointer overflow-hidden transition-all duration-300
                                        ${isActive ? 'scale-[1.02] z-10 shadow-lg' : ''}
                                        ${isDark ? 'ring-offset-gray-950' : 'ring-offset-white'}
                                    `}
                                    style={{
                                        backgroundColor: color,
                                    }}
                                >
                                    {/* Content Container */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                                        <span className={`
                                            text-xs font-bold leading-tight mb-0.5 line-clamp-2
                                            ${isDark ? 'text-white' : 'text-gray-800'}
                                        `}>
                                            {item.forwardedToDesignation}
                                        </span>
                                        <span className={`
                                            text-[10px] font-medium opacity-90
                                            ${isDark ? 'text-white/80' : 'text-gray-900/70'}
                                        `}>
                                            {item.count.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </div>

            {/* Floating Tooltip */}
            <AnimatePresence>
                {hoveredData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                            position: 'fixed',
                            left: mousePos.x + 16,
                            top: mousePos.y + 16,
                            zIndex: 100,
                            pointerEvents: 'none',
                        }}
                        className={`
                            min-w-[140px] px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border
                            ${isDark
                                ? 'bg-gray-900/95 border-gray-700 text-gray-100 shadow-black/50'
                                : 'bg-white/95 border-gray-100 text-gray-800 shadow-gray-200/50'
                            }
                        `}
                    >
                        <p className={`text-[10px] font-bold mb-0.5 uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {hoveredData.forwardedToDesignation}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-outfit tracking-tight">
                                {hoveredData.count.toLocaleString()}
                            </span>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                cases
                            </span>
                        </div>
                        <div className={`mt-2 text-[10px] font-medium flex items-center gap-1 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                            <Info size={10} />
                            Right-click for options
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
