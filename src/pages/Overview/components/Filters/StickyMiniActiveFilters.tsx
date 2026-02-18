//@ts-nocheck
import { useState, useEffect } from 'react';
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';
import { X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyMiniActiveFiltersProps {
    filters: FilterState;
    clearAllFilters: () => void;
    updateFilter: (key: keyof FilterState, value: string | string[] | null) => void;
    activeProgramTypes: string[];
    handleProgramTypeClick: (type: string | null) => void;
}

function MiniTag({ label, value, onRemove, dark = false }: { label: string; value: string; onRemove: () => void; dark?: boolean }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 border shadow-sm transition-colors ${dark
            ? 'bg-gray-800 text-white border-gray-700 dark:bg-gray-700 dark:border-gray-600'
            : 'bg-white text-gray-700 border-gray-200 dark:bg-secondary dark:text-secondary-foreground dark:border-border'
            }`}>
            <span className="opacity-60 font-medium uppercase">{label}</span>
            <span>{value}</span>
            <button onClick={onRemove} className="hover:text-red-500 transition-colors ml-0.5">
                <X size={10} strokeWidth={3} />
            </button>
        </span>
    );
}

export default function StickyMiniActiveFilters({
    filters,
    clearAllFilters,
    updateFilter,
    activeProgramTypes,
    handleProgramTypeClick
}: StickyMiniActiveFiltersProps) {
    const dispatch = useAppDispatch();
    const globalFilters = useAppSelector((state) => state.gSwagat);
    const [showSticky, setShowSticky] = useState(false);

    const clearGlobalFilter = (filterType: string) => {
        dispatch(setgSwagatData({
            ...globalFilters,
            [filterType]: []
        }));
    };

    useEffect(() => {
        const full = document.getElementById('active-filters-pane');
        if (!full) {
            setShowSticky(false);
            return;
        }

        const observer = new window.IntersectionObserver(
            ([entry]) => {
                setShowSticky(!entry.isIntersecting);
            },
            { root: null, threshold: 0 }
        );

        observer.observe(full);
        return () => observer.disconnect();
    }, [filters]);

    return (
        <AnimatePresence>
            {showSticky && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-0 left-0 w-full flex justify-center z-[90] pointer-events-none"
                    style={{ top: '72px' }}
                >
                    <div className="pointer-events-auto max-w-4xl w-full mx-4 bg-background/90 backdrop-blur-xl rounded-full px-2 py-1.5 flex items-center gap-2 shadow-2xl border border-border/50 ring-1 ring-black/5">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                            <Filter size={14} strokeWidth={2.5} />
                        </div>

                        <div className="flex flex-wrap gap-1.5 items-center overflow-x-auto no-scrollbar py-1 px-1">
                            {globalFilters?.districts?.length > 0 && globalFilters.districts.map((district) => (
                                <MiniTag key={district} label="Dist" value={district} dark onRemove={() => clearGlobalFilter('districts')} />
                            ))}

                            {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
                                <MiniTag key={taluka} label="Tal" value={taluka} dark onRemove={() => {
                                    const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
                                    dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
                                }} />
                            ))}

                            {globalFilters?.departments?.length > 0 && globalFilters.departments.map((dept) => (
                                <MiniTag key={dept} label="Dept" value={dept} dark onRemove={() => clearGlobalFilter('departments')} />
                            ))}

                            {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
                                <MiniTag key={status} label="Stat" value={status} dark onRemove={() => clearGlobalFilter('grievanceStatuses')} />
                            ))}

                            {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
                                <MiniTag key={status} label="Sub" value={status} dark onRemove={() => {
                                    const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
                                    dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
                                }} />
                            ))}

                            {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
                                <MiniTag key={channel} label="Chnl" value={channel} dark onRemove={() => clearGlobalFilter('disposeChannels')} />
                            ))}

                            {filters.district && (
                                <MiniTag label="Dist" value={filters.district} onRemove={() => updateFilter('district', null)} />
                            )}
                            {filters.departmentName && (
                                <MiniTag label="Dept" value={filters.departmentName} onRemove={() => updateFilter('departmentName', null)} />
                            )}
                            {filters.disposeChnl && (
                                <MiniTag label="Chnl" value={filters.disposeChnl} onRemove={() => updateFilter('disposeChnl', null)} />
                            )}
                            {filters.grievanceStatus && (
                                <MiniTag label="Stat" value={filters.grievanceStatus} onRemove={() => updateFilter('grievanceStatus', null)} />
                            )}
                            {activeProgramTypes.length > 0 && activeProgramTypes.map((type) => (
                                <MiniTag key={type} label="Prog" value={type} onRemove={() => handleProgramTypeClick(type)} />
                            ))}
                            {filters.taluka && (
                                <MiniTag label="Tal" value={filters.taluka} onRemove={() => updateFilter('taluka', null)} />
                            )}
                            {filters.subStatusName && (
                                <MiniTag label="Sub" value={filters.subStatusName} onRemove={() => updateFilter('subStatusName', null)} />
                            )}
                        </div>

                        <div className="flex-1"></div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={clearAllFilters}
                            className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors flex-shrink-0"
                        >
                            Clear All
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
