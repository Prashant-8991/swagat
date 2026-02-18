//@ts-nocheck
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';

interface ActiveFiltersPaneProps {
 filters: FilterState;
 activeProgramTypes: string[];
 updateFilter: (key: keyof FilterState, value: string | string[] | null) => void;
 setActiveProgramTypes: (value: string[]) => void;
 handleProgramTypeClick: (type: string | null) => void;
 clearAllFilters?: () => void;
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
 <div
 id="active-filters-pane"
 className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/40 dark:border-gray-700/30 shadow-sm"
 >
 <div className="flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center flex-wrap gap-2">
 <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
 <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
 Active Filters:
 </span>

 {globalFilters?.districts?.length > 0 && globalFilters.districts.map((district) => (
 <div key={district} className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-500 text-white rounded-xl text-sm font-medium shadow-sm">
 <span>District: {district}</span>
 <button onClick={() => clearGlobalFilter('districts')} className="hover:text-sky-100 ml-1 font-bold transition-colors">x</button>
 </div>
 ))}

 {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
 <div key={taluka} className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-xl text-sm font-medium shadow-sm">
 <span>Taluka: {taluka}</span>
 <button
 onClick={() => {
 const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
 dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
 }}
 className="hover:text-teal-100 ml-1 font-bold transition-colors"
 >x</button>
 </div>
 ))}

 {globalFilters?.departments?.length > 0 && globalFilters.departments.map((dept) => (
 <div key={dept} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-xl text-sm font-medium shadow-sm">
 <span>Department: {dept}</span>
 <button onClick={() => clearGlobalFilter('departments')} className="hover:text-slate-200 ml-1 font-bold transition-colors">x</button>
 </div>
 ))}

 {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
 <div key={status} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-xl text-sm font-medium shadow-sm">
 <span>Status: {status}</span>
 <button onClick={() => clearGlobalFilter('grievanceStatuses')} className="hover:text-amber-100 ml-1 font-bold transition-colors">x</button>
 </div>
 ))}

 {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
 <div key={status} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-sm font-medium shadow-sm">
 <span>Sub Status: {status}</span>
 <button
 onClick={() => {
 const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
 dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
 }}
 className="hover:text-rose-100 ml-1 font-bold transition-colors"
 >x</button>
 </div>
 ))}

 {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
 <div key={channel} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-sm">
 <span>Channel: {channel}</span>
 <button onClick={() => clearGlobalFilter('disposeChannels')} className="hover:text-emerald-100 ml-1 font-bold transition-colors">x</button>
 </div>
 ))}

 {filters.district && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-xl text-sm font-medium border border-sky-200/60 dark:border-sky-800/40">
 <span>District: {filters.district}</span>
 <button
 onClick={() => updateFilter('district', null)}
 className="hover:text-sky-900 dark:hover:text-sky-100 ml-1 font-bold transition-colors"
 aria-label="Remove district filter"
 >
 x
 </button>
 </div>
 )}

 {filters.departmentName && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium border border-slate-200/60 dark:border-slate-800/40">
 <span>Department: {filters.departmentName}</span>
 <button
 onClick={() => updateFilter('departmentName', null)}
 className="hover:text-slate-900 dark:hover:text-slate-100 ml-1 font-bold transition-colors"
 aria-label="Remove department filter"
 >
 x
 </button>
 </div>
 )}

 {filters.disposeChnl && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium border border-emerald-200/60 dark:border-emerald-800/40">
 <span>Channel: {filters.disposeChnl}</span>
 <button
 onClick={() => updateFilter('disposeChnl', null)}
 className="hover:text-emerald-900 dark:hover:text-emerald-100 ml-1 font-bold transition-colors"
 aria-label="Remove channel filter"
 >
 x
 </button>
 </div>
 )}

 {filters.grievanceStatus && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-medium border border-orange-200/60 dark:border-orange-800/40">
 <span>Status: {filters.grievanceStatus}</span>
 <button
 onClick={() => updateFilter('grievanceStatus', null)}
 className="hover:text-orange-900 dark:hover:text-orange-100 ml-1 font-bold transition-colors"
 aria-label="Remove status filter"
 >
 x
 </button>
 </div>
 )}

 {activeProgramTypes.length > 0 && activeProgramTypes.map((type) => (
 <div
 key={type}
 className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-xl text-sm font-medium border border-teal-200/60 dark:border-teal-800/40"
 >
 <span>Program: {type}</span>
 <button
 onClick={() => handleProgramTypeClick(type)}
 className="hover:text-teal-900 dark:hover:text-teal-100 ml-1 font-bold transition-colors"
 aria-label={`Remove ${type} program type filter`}
 >
 x
 </button>
 </div>
 ))}

 {filters.taluka && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl text-sm font-medium border border-cyan-200/60 dark:border-cyan-800/40">
 <span>Taluka: {filters.taluka}</span>
 <button
 onClick={() => updateFilter('taluka', null)}
 className="hover:text-cyan-900 dark:hover:text-cyan-100 ml-1 font-bold transition-colors"
 aria-label="Remove taluka filter"
 >
 x
 </button>
 </div>
 )}

 {filters.subStatusName && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl text-sm font-medium border border-rose-200/60 dark:border-rose-800/40">
 <span>Sub Status: {filters.subStatusName}</span>
 <button
 onClick={() => updateFilter('subStatusName', null)}
 className="hover:text-rose-900 dark:hover:text-rose-100 ml-1 font-bold transition-colors"
 aria-label="Remove sub status filter"
 >
 x
 </button>
 </div>
 )}
 </div>

 {clearAllFilters && (
 <button
 onClick={clearAllFilters}
 className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
 aria-label="Clear all filters"
 >
 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
 </svg>
 Clear All
 </button>
 )}
 </div>
 </div>
 );
}
