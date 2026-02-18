//@ts-nocheck
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveFiltersPaneProps {
    filters: FilterState;
    activeProgramTypes: string[];
    updateFilter: (key: keyof FilterState, value: string | string[] | null) => void;
    setActiveProgramTypes: (value: string[]) => void;
    handleProgramTypeClick: (type: string | null) => void;
    clearAllFilters?: () => void;
}

function FilterTag({ label, value, onRemove, variant = 'default' }: { label: string; value: string; onRemove: () => void; variant?: string }) {
    const variants: Record<string, string> = {
        'default': 'bg-gray-50 border-gray-200 text-gray-600',
        'global': 'bg-gray-900 border-transparent text-white shadow-xl shadow-gray-900/10',
        'district': 'bg-sky-50 border-sky-100 text-sky-700',
        'department': 'bg-violet-50 border-violet-100 text-violet-700',
        'status': 'bg-emerald-50 border-emerald-100 text-emerald-700',
        'channel': 'bg-indigo-50 border-indigo-100 text-indigo-700',
        'program': 'bg-orange-50 border-orange-100 text-orange-700',
        'taluka': 'bg-cyan-50 border-cyan-100 text-cyan-700',
        'substatus': 'bg-rose-50 border-rose-100 text-rose-700',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200 hover:shadow-sm ${variants[variant] || variants.default}`}
        >
            <span className="opacity-70 font-medium uppercase tracking-wider text-[9px]">{label}</span>
            <span>{value}</span>
            <button onClick={onRemove} className="p-0.5 rounded-full hover:bg-black/10 transition-colors ml-0.5">
                <X size={12} strokeWidth={2.5} />
            </button>
        </motion.div>
    );
}

export default function ActiveFiltersPane({
    filters,
    activeProgramTypes,
    updateFilter,
    handleProgramTypeClick,
    clearAllFilters
}: ActiveFiltersPaneProps) {
    const dispatch = useAppDispatch();
    const globalFilters = useAppSelector((state) => state.gSwagat);

    const clearGlobalFilter = (filterType: string) => {
        dispatch(setgSwagatData({
            ...globalFilters,
            [filterType]: []
        }));
    };

    const hasLocalFilters = activeProgramTypes.length > 0 ||
        filters.district || filters.taluka || filters.departmentName ||
        filters.disposeChnl || filters.grievanceStatus || filters.subStatusName;

    const hasGlobalFilters = globalFilters?.programTypes?.length > 0 ||
        globalFilters?.districts?.length > 0 || globalFilters?.talukas?.length > 0 ||
        globalFilters?.departments?.length > 0 || globalFilters?.grievanceStatuses?.length > 0 ||
        globalFilters?.subStatuses?.length > 0 || globalFilters?.disposeChannels?.length > 0;

    if (!hasLocalFilters && !hasGlobalFilters) {
        return null;
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            id="active-filters-pane"
            className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm"
        >
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center gap-2 uppercase tracking-widest mr-2">
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>
                        Active Filters:
                    </span>

                    <AnimatePresence>
                        {globalFilters?.districts?.length > 0 && globalFilters.districts.map((district) => (
                            <FilterTag key={district} label="District" value={district} variant="global" onRemove={() => clearGlobalFilter('districts')} />
                        ))}

                        {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
                            <FilterTag key={taluka} label="Taluka" value={taluka} variant="global" onRemove={() => {
                                const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
                                dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
                            }} />
                        ))}

                        {globalFilters?.departments?.length > 0 && globalFilters.departments.map((dept) => (
                            <FilterTag key={dept} label="Department" value={dept} variant="global" onRemove={() => clearGlobalFilter('departments')} />
                        ))}

                        {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
                            <FilterTag key={status} label="Status" value={status} variant="global" onRemove={() => clearGlobalFilter('grievanceStatuses')} />
                        ))}

                        {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
                            <FilterTag key={status} label="Sub Status" value={status} variant="global" onRemove={() => {
                                const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
                                dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
                            }} />
                        ))}

                        {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
                            <FilterTag key={channel} label="Channel" value={channel} variant="global" onRemove={() => clearGlobalFilter('disposeChannels')} />
                        ))}

                        {filters.district && (
                            <FilterTag label="District" value={filters.district} variant="district" onRemove={() => updateFilter('district', null)} />
                        )}

                        {filters.departmentName && (
                            <FilterTag label="Department" value={filters.departmentName} variant="department" onRemove={() => updateFilter('departmentName', null)} />
                        )}

                        {filters.disposeChnl && (
                            <FilterTag label="Channel" value={filters.disposeChnl} variant="channel" onRemove={() => updateFilter('disposeChnl', null)} />
                        )}

                        {filters.grievanceStatus && (
                            <FilterTag label="Status" value={filters.grievanceStatus} variant="status" onRemove={() => updateFilter('grievanceStatus', null)} />
                        )}

                        {activeProgramTypes.length > 0 && activeProgramTypes.map((type) => (
                            <FilterTag key={type} label="Program" value={type} variant="program" onRemove={() => handleProgramTypeClick(type)} />
                        ))}

                        {filters.taluka && (
                            <FilterTag label="Taluka" value={filters.taluka} variant="taluka" onRemove={() => updateFilter('taluka', null)} />
                        )}

                        {filters.subStatusName && (
                            <FilterTag label="Sub Status" value={filters.subStatusName} variant="substatus" onRemove={() => updateFilter('subStatusName', null)} />
                        )}
                    </AnimatePresence>
                </div>

                {clearAllFilters && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={clearAllFilters}
                        className="ml-auto px-4 py-1.5 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-full text-[10px] font-bold transition-all duration-200 shadow-sm flex items-center gap-1.5 uppercase tracking-wide"
                        aria-label="Clear all filters"
                    >
                        <X size={12} strokeWidth={2.5} />
                        Clear All
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}
