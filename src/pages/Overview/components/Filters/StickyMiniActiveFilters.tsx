//@ts-nocheck
import { useState, useEffect } from 'react';
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';

interface StickyMiniActiveFiltersProps {
 filters: FilterState;
 clearAllFilters: () => void;
 updateFilter: (key: keyof FilterState, value: string | string[] | null) => void;
 activeProgramTypes: string[];
 handleProgramTypeClick: (type: string | null) => void;
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

 if (!showSticky) return null;

 return (
 <div
 className="fixed top-0 left-0 w-full flex justify-center z-[9999] pointer-events-none"
 style={{ top: '70px', paddingTop: '8px' }}
 >
 <div className="pointer-events-auto max-w-[600px] w-full bg-white/60 backdrop-blur-lg dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/40 dark:border-gray-700/30 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
 <span className="text-xs font-semibold text-gray-600 dark:text-gray-200 mr-2">Active Filters:</span>
 <div className="flex flex-wrap gap-1">
 {globalFilters?.districts?.length > 0 && globalFilters.districts.map((district) => (
 <span key={district} className="px-3 py-1.5 bg-sky-500 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm">
 District: <strong>{district}</strong>
 <button onClick={() => clearGlobalFilter('districts')} className="hover:text-sky-100 ml-1">x</button>
 </span>
 ))}

 {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
 <span key={taluka} className="px-3 py-1.5 bg-teal-500 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm">
 Taluka: <strong>{taluka}</strong>
 <button onClick={() => {
 const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
 dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
 }} className="hover:text-teal-100 ml-1">x</button>
 </span>
 ))}

 {globalFilters?.departments?.length > 0 && globalFilters.departments.map((dept) => (
 <span key={dept} className="px-3 py-1.5 bg-slate-600 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm">
 Department: <strong>{dept}</strong>
 <button onClick={() => clearGlobalFilter('departments')} className="hover:text-slate-200 ml-1">x</button>
 </span>
 ))}

 {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
 <span key={status} className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm">
 Status: <strong>{status}</strong>
 <button onClick={() => clearGlobalFilter('grievanceStatuses')} className="hover:text-amber-100 ml-1">x</button>
 </span>
 ))}

 {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
 <span key={status} className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm">
 Sub Status: <strong>{status}</strong>
 <button onClick={() => {
 const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
 dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
 }} className="hover:text-rose-100 ml-1">x</button>
 </span>
 ))}

 {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
 <span key={channel} className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs flex items-center gap-2 shadow-sm">
 Channel: <strong>{channel}</strong>
 <button onClick={() => clearGlobalFilter('disposeChannels')} className="hover:text-emerald-100 ml-1">x</button>
 </span>
 ))}

 {filters.district && (
 <span className="px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-xl text-xs flex items-center gap-2 border border-sky-200/60 dark:border-sky-800/40">
 District: <strong>{filters.district}</strong>
 <button
 onClick={() => updateFilter('district', null)}
 className="hover:text-sky-900 dark:hover:text-sky-100 ml-1"
 >
 x
 </button>
 </span>
 )}
 {filters.departmentName && (
 <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 rounded-xl text-xs flex items-center gap-2 border border-slate-200/60 dark:border-slate-800/40">
 Department: <strong>{filters.departmentName}</strong>
 <button
 onClick={() => updateFilter('departmentName', null)}
 className="hover:text-slate-900 dark:hover:text-slate-100 ml-1"
 >
 x
 </button>
 </span>
 )}
 {filters.disposeChnl && (
 <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 border border-emerald-200/60 dark:border-emerald-800/40">
 Channel: <strong>{filters.disposeChnl}</strong>
 <button
 onClick={() => updateFilter('disposeChnl', null)}
 className="hover:text-emerald-900 dark:hover:text-emerald-100 ml-1"
 >
 x
 </button>
 </span>
 )}
 {filters.grievanceStatus && (
 <span className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl text-xs flex items-center gap-2 border border-orange-200/60 dark:border-orange-800/40">
 Status: <strong>{filters.grievanceStatus}</strong>
 <button
 onClick={() => updateFilter('grievanceStatus', null)}
 className="hover:text-orange-900 dark:hover:text-orange-100 ml-1"
 >
 x
 </button>
 </span>
 )}
 {activeProgramTypes.length > 0 && activeProgramTypes.map((type) => (
 <span
 key={type}
 className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-xl text-xs flex items-center gap-2 border border-teal-200/60 dark:border-teal-800/40"
 >
 Program: <strong>{type}</strong>
 <button
 onClick={() => handleProgramTypeClick(type)}
 className="hover:text-teal-900 dark:hover:text-teal-100 ml-1"
 >
 x
 </button>
 </span>
 ))}
 {filters.taluka && (
 <span className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs flex items-center gap-2 border border-cyan-200/60 dark:border-cyan-800/40">
 Taluka: <strong>{filters.taluka}</strong>
 <button
 onClick={() => updateFilter('taluka', null)}
 className="hover:text-cyan-900 dark:hover:text-cyan-100 ml-1"
 >
 x
 </button>
 </span>
 )}
 {filters.subStatusName && (
 <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 border border-rose-200/60 dark:border-rose-800/40">
 Sub Status: <strong>{filters.subStatusName}</strong>
 <button
 onClick={() => updateFilter('subStatusName', null)}
 className="hover:text-rose-900 dark:hover:text-rose-100 ml-1"
 >
 x
 </button>
 </span>
 )}
 </div>
 <button
 onClick={clearAllFilters}
 className="ml-auto px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 dark:text-red-400 text-xs font-medium border border-red-200/60 dark:border-red-800/40 transition-all"
 >
 x Clear
 </button>
 </div>
 </div>
 );
}
