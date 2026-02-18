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
            className="dashboard-card p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-white tracking-tight">{title}</h3>
                <div className="flex items-center gap-2">
                    {dropdownOptions.length > 0 && (
                        <select
                            value={selected}
                            onChange={handleChange}
                            className="
 px-3 py-1.5
 glass
 rounded-lg
 text-xs text-gray-600 dark:text-gray-300
 focus:outline-none focus:ring-1 focus:ring-brand-300/50
 cursor-pointer
 transition-all duration-200
 font-medium
 "
                        >
                            {dropdownOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    )}
                    {downloadCsv && <DownloadCsvButton onClick={downloadCsv} />}
                </div>
            </div>
            <div className="chart-container">{children}</div>
        </motion.div>
    );
}
