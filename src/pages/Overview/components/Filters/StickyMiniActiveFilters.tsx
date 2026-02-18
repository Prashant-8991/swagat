//@ts-nocheck
import { useState, useEffect } from 'react';
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';
import { X } from 'lucide-react';
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
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${dark ? 'bg-gray-800 text-white' : 'bg-white/60 text-gray-700 border border-gray-200/40'}`}>
            {label}: <strong>{value}</strong>
            <button onClick={onRemove} className="hover:opacity-70 ml-0.5">
                <X size={10} strokeWidth={2.5} />
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="fixed top-0 left-0 w-full flex justify-center z-[9999] pointer-events-none"
                    style={{ top: '70px', paddingTop: '8px' }}
                >
                    <div className="pointer-events-auto max-w-[600px] w-full glass-strong rounded-xl px-4 py-2 flex items-center gap-2 shadow-glass">
                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-300 mr-1.5 uppercase tracking-wider">Filters:</span>
                        <div className="flex flex-wrap gap-1">
                            {globalFilters?.districts?.length > 0 && globalFilters.districts.map((district) => (
                                <MiniTag key={district} label="District" value={district} dark onRemove={() => clearGlobalFilter('districts')} />
                            ))}

                            {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
                                <MiniTag key={taluka} label="Taluka" value={taluka} dark onRemove={() => {
                                    const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
                                    dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
                                }} />
                            ))}

                            {globalFilters?.departments?.length > 0 && globalFilters.departments.map((dept) => (
                                <MiniTag key={dept} label="Dept" value={dept} dark onRemove={() => clearGlobalFilter('departments')} />
                            ))}

                            {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
                                <MiniTag key={status} label="Status" value={status} dark onRemove={() => clearGlobalFilter('grievanceStatuses')} />
                            ))}

                            {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
                                <MiniTag key={status} label="Sub Status" value={status} dark onRemove={() => {
                                    const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
                                    dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
                                }} />
                            ))}

                            {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
                                <MiniTag key={channel} label="Channel" value={channel} dark onRemove={() => clearGlobalFilter('disposeChannels')} />
                            ))}

                            {filters.district && (
                                <MiniTag label="District" value={filters.district} onRemove={() => updateFilter('district', null)} />
                            )}
                            {filters.departmentName && (
                                <MiniTag label="Dept" value={filters.departmentName} onRemove={() => updateFilter('departmentName', null)} />
                            )}
                            {filters.disposeChnl && (
                                <MiniTag label="Channel" value={filters.disposeChnl} onRemove={() => updateFilter('disposeChnl', null)} />
                            )}
                            {filters.grievanceStatus && (
                                <MiniTag label="Status" value={filters.grievanceStatus} onRemove={() => updateFilter('grievanceStatus', null)} />
                            )}
                            {activeProgramTypes.length > 0 && activeProgramTypes.map((type) => (
                                <MiniTag key={type} label="Prog" value={type} onRemove={() => handleProgramTypeClick(type)} />
                            ))}
                            {filters.taluka && (
                                <MiniTag label="Taluka" value={filters.taluka} onRemove={() => updateFilter('taluka', null)} />
                            )}
                            {filters.subStatusName && (
                                <MiniTag label="SubStatus" value={filters.subStatusName} onRemove={() => updateFilter('subStatusName', null)} />
                            )}
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={clearAllFilters}
                            className="ml-auto px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-[10px] font-medium transition-all flex items-center gap-1"
                        >
                            <X size={10} strokeWidth={2.5} />
                            Clear
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
