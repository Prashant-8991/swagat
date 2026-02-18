//@ts-nocheck
interface ProgramTypeFilterProps {
 activeProgramTypes: string[];
 onProgramTypeClick: (type: string | null) => void;
 hasActiveFilters: boolean;
 onClearAllFilters: () => void;
}

const PROGRAM_TYPES = [
 { value: 'GS', label: 'GS', color: 'from-sky-600 to-sky-700' },
 { value: 'TS', label: 'TS', color: 'from-emerald-600 to-emerald-700' },
 { value: 'DS', label: 'DS', color: 'from-teal-600 to-teal-700' },
 { value: 'LF', label: 'LF', color: 'from-orange-500 to-orange-600' },
 { value: 'RLF', label: 'RLF', color: 'from-red-500 to-red-600' },
 { value: 'WTC', label: 'WTC', color: 'from-rose-500 to-rose-600' },
];

export default function ProgramTypeFilter({
 activeProgramTypes,
 onProgramTypeClick,
 hasActiveFilters,
 onClearAllFilters
}: ProgramTypeFilterProps) {
 return (
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mr-1">
 Program Type:
 </span>

 {PROGRAM_TYPES.map((type) => (
 <button
 key={type.value}
 onClick={() => onProgramTypeClick(type.value)}
 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
 activeProgramTypes.includes(type.value)
 ? `bg-gradient-to-r ${type.color} text-white shadow-sm`
 : 'bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700'
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
 className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors duration-200 shadow-sm"
 >
 Clear All Filters
 </button>
 </>
 )}
 </div>
 );
}