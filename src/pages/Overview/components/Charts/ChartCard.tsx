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
}

export default function ChartCard({
    title,
    children,
    downloadCsv,
    dropdownOptions = [],
    onDropdownChange,
    defaultValue,
}: ChartCardProps) {
    const [selected, setSelected] = useState(defaultValue || "");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelected(value);
        onDropdownChange?.(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="dashboard-card p-6 md:p-8 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full z-0 transition-all duration-500 opacity-50 group-hover:scale-110"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">{title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    {dropdownOptions.length > 0 && (
                        <div className="relative group">
                            <select
                                value={selected}
                                onChange={handleChange}
                                className="
                                    appearance-none pr-8 pl-3 py-2
                                    bg-white/80 hover:bg-white
                                    dark:bg-gray-800/80 dark:hover:bg-gray-700/80
                                    border border-gray-200/60 dark:border-gray-700/60
                                    rounded-xl
                                    text-xs font-semibold text-gray-700 dark:text-gray-300
                                    focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50
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
                    {downloadCsv && <DownloadCsvButton onClick={downloadCsv} />}
                </div>
            </div>
            <div className="chart-container relative z-10">{children}</div>
        </motion.div>
    );
}
