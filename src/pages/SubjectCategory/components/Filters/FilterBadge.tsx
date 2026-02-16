//@ts-nocheck
interface FilterBadgeProps {
  label: string;
  value: string;
  onClear: () => void;
  color: 'indigo' | 'blue' | 'green' | 'purple' | 'orange';
}

export default function FilterBadge({ label, value, onClear, color }: FilterBadgeProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    green: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
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
