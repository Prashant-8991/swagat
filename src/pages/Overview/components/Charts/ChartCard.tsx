//@ts-nocheck
import { useState } from "react";
import DownloadCsvButton from "../../../../components/common/DownloadCsvButton";
import { motion } from "framer-motion";

interface DropdownOption {
    label: string;
    value: string;
}

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    downloadCsv?: () => void;
    dropdownOptions?: DropdownOption[];
    onDropdownChange?: (value: string) => void;
    defaultValue?: string;
    headerControls?: React.ReactNode;
    className?: string;
}

export default function ChartCard({
    title,
    children,
    downloadCsv,
    dropdownOptions = [],
    onDropdownChange,
    defaultValue,
    headerControls,
    className = "",
}: ChartCardProps) {
    const [selected, setSelected] = useState(defaultValue || "");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelected(value);
        onDropdownChange?.(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className={`group relative overflow-hidden bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col ${className}`}
        >
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10 shrink-0 border-b border-gray-100/50 dark:border-gray-700/30 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 opacity-80"></div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">{title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    {dropdownOptions.length > 0 && (
                        <div className="relative group">
                            <select
                                value={selected}
                                onChange={handleChange}
                                className="
                                    appearance-none pr-9 pl-3 py-1.5
                                    bg-gray-50/50 hover:bg-gray-100/80 dark:bg-gray-700/30 dark:hover:bg-gray-700/50
                                    border border-gray-200/60 dark:border-gray-600
                                    rounded-lg
                                    text-xs font-semibold text-gray-700 dark:text-gray-300
                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                                    cursor-pointer
                                    transition-all duration-200
                                    min-w-[140px] shadow-sm backdrop-blur-sm
                                "
                            >
                                {dropdownOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    )}
                    {headerControls}
                    {downloadCsv && <DownloadCsvButton onClick={downloadCsv} />}
                </div>
            </div>
            <div className="chart-container relative z-10 flex-1 w-full min-h-0">{children}</div>
        </motion.div>
    );
}
