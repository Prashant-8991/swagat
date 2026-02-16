//@ts-nocheck
interface ForecastToggleProps {
 includeForecast: boolean;
 setIncludeForecast: (value: boolean) => void;
 disabled: boolean;
 loading: boolean;
}

export default function ForecastToggle({
 includeForecast,
 setIncludeForecast,
 disabled,
 loading
}: ForecastToggleProps) {
 return (
 <label
 className={`flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''
 }`}
 >
 <input
 type="checkbox"
 checked={includeForecast && !disabled}
 onChange={(e) => !disabled && setIncludeForecast(e.target.checked)}
 disabled={disabled}
 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
 />
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 Show 2-month forecast
 {disabled && (
 <span className="text-xs text-gray-500"> (disabled when month selected)</span>
 )}
 </span>
 {loading && (
 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 ml-auto"></div>
 )}
 </label>
 );
}
