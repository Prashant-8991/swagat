//@ts-nocheck
import { FilterState } from '../../types';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setgSwagatData } from '../../../../redux/features/globalfilters';

interface ActiveFiltersPaneProps {
 filters: FilterState;
 updateFilter: (key: keyof FilterState, value: string | string[] | null) => void;
 handleProgramTypeClick: (type: string) => void;
 convertFilterToDisplay: (val: string) => string;
}

export default function ActiveFiltersPane({
 filters,
 updateFilter,
 handleProgramTypeClick,
 convertFilterToDisplay
}: ActiveFiltersPaneProps) {
 const dispatch = useAppDispatch();
 const globalFilters = useAppSelector((state) => state.gSwagat);

 const clearGlobalFilter = (filterType: string) => {
 dispatch(setgSwagatData({
 ...globalFilters,
 [filterType]: []
 }));
 };

 const hasLocalFilters = filters.programTypes?.length > 0 ||
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

 return (
 <div
 id="active-filters-pane"
 className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/40 dark:border-gray-700 shadow-sm"
 >
 <div className="flex items-center flex-wrap gap-3">
 <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
 <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
 Active Filters:
 </span>

 {/* Global Filters */}
 {globalFilters.districts?.length > 0 && globalFilters.districts.map((district) => (
 <div key={district} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium shadow-sm">
 <span>District: {district}</span>
 <button
 onClick={() => clearGlobalFilter('districts')}
 className="hover:text-blue-100 ml-1 font-bold transition-colors"
 aria-label="Remove global district filter"
 >
 ✕
 </button>
 </div>
 ))}

 {globalFilters.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
 <div key={taluka} className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium shadow-sm">
 <span>Taluka: {taluka}</span>
 <button
 onClick={() => {
 const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
 dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
 }}
 className="hover:text-cyan-100 ml-1 font-bold transition-colors"
 aria-label="Remove global taluka filter"
 >
 ✕
 </button>
 </div>
 ))}

 {globalFilters.departments?.length > 0 && globalFilters.departments.map((dept) => (
 <div key={dept} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-500 text-white rounded-lg text-sm font-medium shadow-sm">
 <span>Department: {dept}</span>
 <button
 onClick={() => clearGlobalFilter('departments')}
 className="hover:text-slate-100 ml-1 font-bold transition-colors"
 aria-label="Remove global department filter"
 >
 ✕
 </button>
 </div>
 ))}

 {globalFilters.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
 <div key={status} className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium shadow-sm">
 <span>Status: {status}</span>
 <button
 onClick={() => clearGlobalFilter('grievanceStatuses')}
 className="hover:text-amber-100 ml-1 font-bold transition-colors"
 aria-label="Remove global grievance status filter"
 >
 ✕
 </button>
 </div>
 ))}

 {globalFilters.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
 <div key={status} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium shadow-sm">
 <span>Sub Status: {status}</span>
 <button
 onClick={() => {
 const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
 dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
 }}
 className="hover:text-rose-100 ml-1 font-bold transition-colors"
 aria-label="Remove global sub status filter"
 >
 ✕
 </button>
 </div>
 ))}

 {globalFilters.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
 <div key={channel} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium shadow-sm">
 <span>Channel: {channel}</span>
 <button
 onClick={() => clearGlobalFilter('disposeChannels')}
 className="hover:text-green-100 ml-1 font-bold transition-colors"
 aria-label="Remove global dispose channel filter"
 >
 ✕
 </button>
 </div>
 ))}

 {/* Local Filters */}

 {filters.programTypes && filters.programTypes.map((type) => (
 <div
 key={type}
 className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 rounded-lg text-sm font-medium border border-teal-200 dark:border-teal-800"
 >
 <span>Program: {type}</span>
 <button
 onClick={() => handleProgramTypeClick(type)}
 className="hover:text-teal-900 dark:hover:text-teal-100 ml-1 font-bold transition-colors"
 aria-label={`Remove ${type} filter`}
 >
 ✕
 </button>
 </div>
 ))}

 {filters.district && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
 <span>District: {filters.district}</span>
 <button
 onClick={() => updateFilter('district', null)}
 className="hover:text-blue-900 dark:hover:text-blue-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.taluka && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
 <span>Taluka: {filters.taluka}</span>
 <button
 onClick={() => updateFilter('taluka', null)}
 className="hover:text-green-900 dark:hover:text-green-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.departmentName && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-800">
 <span>Department: {filters.departmentName}</span>
 <button
 onClick={() => updateFilter('departmentName', null)}
 className="hover:text-slate-900 dark:hover:text-slate-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.subjectCategory && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800">
 <span>Subject: {filters.subjectCategory}</span>
 <button
 onClick={() => updateFilter('subjectCategory', null)}
 className="hover:text-orange-900 dark:hover:text-orange-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.aiCategory && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 rounded-lg text-sm font-medium border border-pink-200 dark:border-pink-800">
 <span>AI Category: {filters.aiCategory}</span>
 <button
 onClick={() => updateFilter('aiCategory', null)}
 className="hover:text-pink-900 dark:hover:text-pink-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.month && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm font-medium border border-yellow-200 dark:border-yellow-800">
 <span>Month: {convertFilterToDisplay(filters.month)}</span>
 <button
 onClick={() => updateFilter('month', null)}
 className="hover:text-yellow-900 dark:hover:text-yellow-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.disposeChnl && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 rounded-lg text-sm font-medium border border-teal-200 dark:border-teal-800">
 <span>Channel: {filters.disposeChnl}</span>
 <button
 onClick={() => updateFilter('disposeChnl', null)}
 className="hover:text-teal-900 dark:hover:text-teal-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.grievanceStatus && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-medium border border-amber-200 dark:border-amber-800">
 <span>Status: {filters.grievanceStatus}</span>
 <button
 onClick={() => updateFilter('grievanceStatus', null)}
 className="hover:text-amber-900 dark:hover:text-amber-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 {filters.subStatusName && (
 <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 rounded-lg text-sm font-medium border border-rose-200 dark:border-rose-800">
 <span>Sub Status: {filters.subStatusName}</span>
 <button
 onClick={() => updateFilter('subStatusName', null)}
 className="hover:text-rose-900 dark:hover:text-rose-100 ml-1 font-bold transition-colors"
 >
 ✕
 </button>
 </div>
 )}

 </div>
 </div>
 );
}
