//@ts-nocheck
import { useState } from "react";
import DownloadCsvButton from "../../../../components/common/DownloadCsvButton";

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
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl border border-gray-200/40 dark:border-gray-700/30 shadow-sm transition-all duration-300 p-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h3>
 <div className="flex items-center space-x-2">
 {dropdownOptions.length > 0 && (
 <select
 value={selected}
 onChange={handleChange}
 className="
 px-3 py-1.5
 bg-white/80 backdrop-blur-sm dark:bg-gray-900
 border border-gray-200 dark:border-gray-600
 rounded-xl
 text-sm text-gray-700 dark:text-gray-300
 focus:outline-none focus:ring-2 focus:ring-orange-300/50
 cursor-pointer
 transition-all duration-200
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
 </div>
 );
}
