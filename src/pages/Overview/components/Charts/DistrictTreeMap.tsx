import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartData } from "../../types";
import { CHART_COLORS } from "../../../../utils/colorPalette";
import { useTheme } from "../../../../context/ThemeContext";
import { Info } from "lucide-react";

interface DistrictTreeMapProps {
    data: ChartData[];
    onTileClick: (value: string) => void;
    onContextMenu: (params: any) => void;
    selectedValue: string | null;
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

export default function DistrictTreeMap({
    data,
    onTileClick,
    onContextMenu,
    selectedValue,
}: DistrictTreeMapProps) {
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

        // If any data left (unlikely with sufficient pattern, but safe fallback), add to last column or new
        if (currentIndex < sortedData.length) {
            const remaining = sortedData.slice(currentIndex);
            // Distribute remaining evenly or just add a final column
            if (remaining.length > 0) cols.push(remaining);
        }

        return cols;
    }, [sortedData]);

    const currentPalette = isDark ? DARK_PALETTE : LIGHT_PALETTE;

    return (
        <div
            className="w-full h-[480px] p-1 select-none cursor-default"
            onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHoveredData(null)}
        >
            <div className="flex w-full h-full gap-2 overflow-hidden">
                {columns.map((colItems, colIdx) => (
                    <motion.div
                        key={`col-${colIdx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: colIdx * 0.05 }}
                        className="flex flex-col flex-1 h-full gap-2 min-w-[80px]"
                    >
                        {colItems.map((item) => {
                            // Calculate global index for color consistency
                            // We need to know previous counts to get true global index or just hash string?
                            // Simple way: calculate strictly based on item content or just keep an incrementing counter if we did it outside.
                            // Here, we can just use palette rotation based on col+item index combination for variety
                            // Or better, find index in sortedData
                            const globalIndex = sortedData.findIndex(d => d.district === item.district);
                            const color = currentPalette[globalIndex % currentPalette.length];

                            const isSelected = selectedValue === item.district;


                            return (
                                <motion.div
                                    key={item.district}
                                    layoutId={item.district}
                                    onClick={() => item.district && onTileClick(item.district)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        onContextMenu({
                                            name: item.district,
                                            value: item.count,
                                            event: { event: e } // mimic ECharts structure roughly
                                        });
                                    }}
                                    onMouseEnter={() => setHoveredData(item)}
                                    onMouseLeave={() => setHoveredData(null)}
                                    className={`
                                        relative flex-1 rounded-xl cursor-pointer overflow-hidden transition-all duration-300
                                        ${isSelected ? 'ring-2 ring-offset-2 ring-primary z-10' : 'hover:scale-[1.02] hover:z-10 hover:shadow-lg'}
                                        ${isDark ? 'ring-offset-gray-950' : 'ring-offset-white'}
                                    `}
                                    style={{
                                        backgroundColor: isSelected ? (isDark ? CHART_COLORS.primary : CHART_COLORS.powder) : color,
                                        opacity: (selectedValue && !isSelected) ? 0.6 : 1,
                                    }}
                                >
                                    {/* Content Container */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                                        <span className={`
                                            text-xs font-bold leading-tight mb-0.5 line-clamp-2
                                            ${isDark || isSelected ? 'text-white' : 'text-gray-800'}
                                            ${isSelected ? 'text-white' : ''}
                                        `}>
                                            {item.district}
                                        </span>
                                        <span className={`
                                            text-[10px] font-medium opacity-90
                                            ${isDark || isSelected ? 'text-white/80' : 'text-gray-900/70'}
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
                            zIndex: 100, // Ensure it's above everything
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
                            {hoveredData.district}
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