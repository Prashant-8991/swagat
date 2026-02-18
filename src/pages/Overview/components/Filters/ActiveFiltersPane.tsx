//@ts-nocheck
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

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
        'default': 'bg-gray-100/80 text-gray-700 border-gray-200/50',
        'global': 'bg-gray-800 text-white border-transparent',
        'district': 'bg-blue-light-50/80 text-blue-light-700 border-blue-light-200/50',
        'department': 'bg-gray-100/80 text-gray-700 border-gray-200/50',
        'status': 'bg-brand-50/80 text-brand-700 border-brand-200/50',
        'channel': 'bg-success-50/80 text-success-700 border-success-200/50',
        'program': 'bg-orange-50/80 text-orange-700 border-orange-200/50',
        'taluka': 'bg-blue-light-50/80 text-blue-light-700 border-blue-light-200/50',
        'substatus': 'bg-error-50/80 text-error-700 border-error-200/50',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border shadow-glass-sm ${variants[variant] || variants.default}`}
        >
            <span>{label}: {value}</span>
            <button onClick={onRemove} className="hover:opacity-70 transition-opacity ml-0.5">
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
            className="dashboard-card-static p-4"
        >
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                        Active Filters:
                    </span>

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
                </div>

                {clearAllFilters && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={clearAllFilters}
                        className="ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-medium transition-all duration-200 shadow-sm flex items-center gap-1.5"
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
