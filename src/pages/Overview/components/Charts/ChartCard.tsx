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
    <div className="bg-white dark:text-white dark:bg-gray-800 rounded-2xl shadow-xl hover:scale-101 transition-transform duration-300 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center space-x-3">
          {dropdownOptions.length > 0 && (
            <select
              value={selected}
              onChange={handleChange}
              className="
                px-3 py-1.5
                bg-white dark:bg-gray-900
                border border-gray-300 dark:border-gray-600
                rounded-lg
                text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
                cursor-pointer
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
