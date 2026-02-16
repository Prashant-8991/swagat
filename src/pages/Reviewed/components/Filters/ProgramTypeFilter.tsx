//@ts-nocheck
interface ProgramTypeFilterProps {
  activeProgramTypes: string[];
  onProgramTypeClick: (type: string | null) => void;
  hasActiveFilters: boolean;
  onClearAllFilters: () => void;
}

const PROGRAM_TYPES = [
  { value: 'GS', label: 'GS', color: 'from-blue-600 to-blue-700' },
  { value: 'TS', label: 'TS', color: 'from-green-600 to-green-700' },
  { value: 'DS', label: 'DS', color: 'from-purple-600 to-purple-700' },
  { value: 'LF', label: 'LF', color: 'from-orange-600 to-orange-700' },
  { value: 'RLF', label: 'RLF', color: 'from-red-600 to-red-700' },
  { value: 'WTC', label: 'WTC', color: 'from-pink-600 to-pink-700' },
];

export default function ProgramTypeFilter({
  activeProgramTypes,
  onProgramTypeClick,
  hasActiveFilters,
  onClearAllFilters
}: ProgramTypeFilterProps) {
  return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Program Type:
        </span>

        {PROGRAM_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onProgramTypeClick(type.value)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              activeProgramTypes.includes(type.value)
                ? `bg-gradient-to-r ${type.color} text-white shadow-lg scale-105`
                : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-black dark:border-gray-700 hover:scale-105'
            }`}
          >
            {type.label}
          </button>
        ))}

        {hasActiveFilters && (
          <>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
            
            <button
              onClick={onClearAllFilters}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Clear All Filters
            </button>
          </>
        )}
      </div>
  );
}
