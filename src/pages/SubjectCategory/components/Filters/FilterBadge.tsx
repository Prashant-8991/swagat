//@ts-nocheck
interface FilterBadgeProps {
 label: string;
 value: string;
 onClear: () => void;
 color: 'indigo' | 'blue' | 'green' | 'purple' | 'orange';
}

export default function FilterBadge({ label, value, onClear, color }: FilterBadgeProps) {
 const colorClasses = {
 indigo: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700',
 blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
 green: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
 purple: 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
 orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700'
 };

 return (
 <span className={`px-3 py-1.5 rounded-lg text-sm border flex items-center gap-2 ${colorClasses[color]}`}>
 <span className="font-medium">{label}:</span>
 {value}
 <button
 onClick={onClear}
 className="hover:opacity-75 font-bold ml-1"
 aria-label={`Clear ${label} filter`}
 >
 ✕
 </button>
 </span>
 );
}
