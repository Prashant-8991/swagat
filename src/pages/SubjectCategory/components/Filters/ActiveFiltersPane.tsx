//@ts-nocheck
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Trash2 } from 'lucide-react';

interface ActiveFiltersPaneProps {
    filters: FilterState;
    updateFilter: (key: keyof FilterState, value: string | string[] | null) => void;
    handleProgramTypeClick: (type: string) => void;
    convertFilterToDisplay?: (val: string) => string;
    clearLocalFiltersOnly?: () => void;
    clearAllFilters?: () => void;
    activeProgramTypes?: string[];
    setActiveProgramTypes?: (val: any) => void;
}

export default function ActiveFiltersPane({
    filters,
    updateFilter,
    handleProgramTypeClick,
    convertFilterToDisplay = (val) => val,
    clearLocalFiltersOnly,
    clearAllFilters,
    activeProgramTypes
}: ActiveFiltersPaneProps) {
    const dispatch = useAppDispatch();
    const globalFilters = useAppSelector((state) => state.gSwagat);

    const clearGlobalFilter = (filterType: string) => {
        dispatch(setgSwagatData({
            ...globalFilters,
            [filterType]: []
        }));
    };

    const hasLocalFilters = (activeProgramTypes && activeProgramTypes.length > 0) ||
        filters.district || filters.taluka || filters.departmentName ||
        filters.disposeChnl || filters.subjectCategory || filters.aiCategory ||
        filters.month || filters.grievanceStatus || filters.subStatusName;

    const hasGlobalFilters = globalFilters.programTypes?.length > 0 ||
        globalFilters.districts?.length > 0 || globalFilters.talukas?.length > 0 ||
        globalFilters.departments?.length > 0 || globalFilters.grievanceStatuses?.length > 0 ||
        globalFilters.subStatuses?.length > 0 || globalFilters.disposeChannels?.length > 0;

    if (!hasLocalFilters && !hasGlobalFilters) {
        return null;
    }

    const FilterChip = ({ label, value, onRemove, colorClass = "blue" }: { label: string, value: string, onRemove: () => void, colorClass?: string }) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
            indigo: "bg-indigo-50/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
            emerald: "bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
            rose: "bg-rose-50/80 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
            amber: "bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
            violet: "bg-violet-50/80 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
            cyan: "bg-cyan-50/80 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
            fuchsia: "bg-fuchsia-50/80 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800",
            pink: "bg-pink-50/80 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
            teal: "bg-teal-50/80 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
            orange: "bg-orange-50/80 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
        };

        const activeColor = colors[colorClass] || colors.blue;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-xs font-semibold border ${activeColor} backdrop-blur-sm transition-colors shadow-sm cursor-default`}
            >
                <span className="opacity-70 font-medium">{label}:</span>
                <span className="truncate max-w-[150px]">{value}</span>
                <button
                    onClick={onRemove}
                    className="ml-1 p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label={`Remove ${label} filter`}
                >
                    <X size={12} strokeWidth={3} />
                </button>
            </motion.div>
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-4 border border-white/50 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
            >
                <div className="flex items-center flex-wrap gap-3">
                    <div className="mr-2 flex items-center gap-2 px-3 py-1.5 bg-gray-50/80 dark:bg-gray-800/80 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <Filter size={14} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Active
                        </span>
                        <span className="flex h-2 w-2 relative ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                    </div>

                    {/* Global Filters */}
                    {globalFilters.districts?.map(d => <FilterChip key={`g-dist-${d}`} label="District" value={d} onRemove={() => clearGlobalFilter('districts')} colorClass="indigo" />)}
                    {globalFilters.talukas?.map(t => (
                        <FilterChip
                            key={`g-tal-${t}`}
                            label="Taluka"
                            value={t}
                            onRemove={() => {
                                const newTalukas = globalFilters.talukas.filter(val => val !== t);
                                dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
                            }}
                            colorClass="indigo"
                        />
                    ))}
                    {globalFilters.departments?.map(d => <FilterChip key={`g-dept-${d}`} label="Dept" value={d} onRemove={() => clearGlobalFilter('departments')} colorClass="indigo" />)}
                    {globalFilters.grievanceStatuses?.map(s => <FilterChip key={`g-stat-${s}`} label="Status" value={s} onRemove={() => clearGlobalFilter('grievanceStatuses')} colorClass="indigo" />)}
                    {globalFilters.subStatuses?.map(s => (
                        <FilterChip
                            key={`g-sub-${s}`}
                            label="Sub Status"
                            value={s}
                            onRemove={() => {
                                const newStatuses = globalFilters.subStatuses.filter(val => val !== s);
                                dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
                            }}
                            colorClass="indigo"
                        />
                    ))}
                    {globalFilters.disposeChannels?.map(c => <FilterChip key={`g-chnl-${c}`} label="Channel" value={c} onRemove={() => clearGlobalFilter('disposeChannels')} colorClass="indigo" />)}

                    {/* Local Filters */}
                    {activeProgramTypes?.map(t => <FilterChip key={`prog-${t}`} label="Program" value={t} onRemove={() => handleProgramTypeClick(t)} colorClass="teal" />)}
                    {filters.district && <FilterChip label="District" value={filters.district} onRemove={() => updateFilter('district', null)} colorClass="blue" />}
                    {filters.taluka && <FilterChip label="Taluka" value={filters.taluka} onRemove={() => updateFilter('taluka', null)} colorClass="cyan" />}
                    {filters.departmentName && <FilterChip label="Dept" value={filters.departmentName} onRemove={() => updateFilter('departmentName', null)} colorClass="violet" />}
                    {filters.subjectCategory && <FilterChip label="Subject" value={filters.subjectCategory} onRemove={() => updateFilter('subjectCategory', null)} colorClass="fuchsia" />}
                    {filters.aiCategory && <FilterChip label="AI Cat" value={filters.aiCategory} onRemove={() => updateFilter('aiCategory', null)} colorClass="pink" />}
                    {filters.month && <FilterChip label="Month" value={convertFilterToDisplay(filters.month)} onRemove={() => updateFilter('month', null)} colorClass="amber" />}
                    {filters.disposeChnl && <FilterChip label="Channel" value={filters.disposeChnl} onRemove={() => updateFilter('disposeChnl', null)} colorClass="emerald" />}
                    {filters.grievanceStatus && <FilterChip label="Status" value={filters.grievanceStatus} onRemove={() => updateFilter('grievanceStatus', null)} colorClass="orange" />}
                    {filters.subStatusName && <FilterChip label="Sub Status" value={filters.subStatusName} onRemove={() => updateFilter('subStatusName', null)} colorClass="rose" />}

                    {/* Clear Buttons */}
                    <div className="ml-auto flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700/50">
                        {hasLocalFilters && clearLocalFiltersOnly && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearLocalFiltersOnly}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all shadow-sm"
                            >
                                <Trash2 size={13} className="text-red-500 group-hover:text-red-600" />
                                <span>Clear Filters</span>
                            </motion.button>
                        )}

                        {hasGlobalFilters && !hasLocalFilters && clearAllFilters && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearAllFilters}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all shadow-sm"
                            >
                                <X size={13} />
                                <span>Clear All</span>
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
