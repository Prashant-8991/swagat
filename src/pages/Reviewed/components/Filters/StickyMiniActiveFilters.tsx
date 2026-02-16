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
      <div className="pointer-events-auto max-w-[800px] w-full bg-white/95 dark:bg-gray-900/95 border border-black dark:border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mr-2">Active Filters:</span>

        <div className="flex flex-wrap gap-1">
          {globalFilters?.districts?.length > 0 && globalFilters.districts.map((district) => (
            <span key={district} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs flex items-center gap-2 shadow-sm">
              District: <strong>{district}</strong>
              <button onClick={() => clearGlobalFilter('districts')} className="hover:text-blue-100 ml-1">✕</button>
            </span>
          ))}

          {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((taluka) => (
            <span key={taluka} className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-xs flex items-center gap-2 shadow-sm">
              Taluka: <strong>{taluka}</strong>
              <button onClick={() => {
                const newTalukas = globalFilters.talukas.filter(t => t !== taluka);
                dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
              }} className="hover:text-cyan-100 ml-1">✕</button>
            </span>
          ))}

          {globalFilters?.departments?.length > 0 && globalFilters.departments.map((dept) => (
            <span key={dept} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs flex items-center gap-2 shadow-sm">
              Department: <strong>{dept}</strong>
              <button onClick={() => clearGlobalFilter('departments')} className="hover:text-purple-100 ml-1">✕</button>
            </span>
          ))}

          {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((status) => (
            <span key={status} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs flex items-center gap-2 shadow-sm">
              Status: <strong>{status}</strong>
              <button onClick={() => clearGlobalFilter('grievanceStatuses')} className="hover:text-amber-100 ml-1">✕</button>
            </span>
          ))}

          {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((status) => (
            <span key={status} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs flex items-center gap-2 shadow-sm">
              Sub Status: <strong>{status}</strong>
              <button onClick={() => {
                const newStatuses = globalFilters.subStatuses.filter(s => s !== status);
                dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
              }} className="hover:text-rose-100 ml-1">✕</button>
            </span>
          ))}

          {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((channel) => (
            <span key={channel} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs flex items-center gap-2 shadow-sm">
              Channel: <strong>{channel}</strong>
              <button onClick={() => clearGlobalFilter('disposeChannels')} className="hover:text-green-100 ml-1">✕</button>
            </span>
          ))}

          {filters.district && (
            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs flex items-center gap-2 border border-blue-200 dark:border-blue-800">
              District: <strong>{filters.district}</strong>
              <button
                onClick={() => updateFilter('district', null)}
                className="hover:text-blue-900 dark:hover:text-blue-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.departmentName && (
            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs flex items-center gap-2 border border-purple-200 dark:border-purple-800">
              Department: <strong>{filters.departmentName}</strong>
              <button
                onClick={() => updateFilter('departmentName', null)}
                className="hover:text-purple-900 dark:hover:text-purple-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.disposeChnl && (
            <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs flex items-center gap-2 border border-green-200 dark:border-green-800">
              Channel: <strong>{filters.disposeChnl}</strong>
              <button
                onClick={() => updateFilter('disposeChnl', null)}
                className="hover:text-green-900 dark:hover:text-green-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.grievanceStatus && (
            <span className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs flex items-center gap-2 border border-orange-200 dark:border-orange-800">
              Status: <strong>{filters.grievanceStatus}</strong>
              <button
                onClick={() => updateFilter('grievanceStatus', null)}
                className="hover:text-orange-900 dark:hover:text-orange-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {activeProgramTypes.length > 0 && activeProgramTypes.map((type) => (
            <span
              key={type}
              className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs flex items-center gap-2 border border-indigo-200 dark:border-indigo-800"
            >
              Program: <strong>{type}</strong>
              <button
                onClick={() => handleProgramTypeClick(type)}
                className="hover:text-indigo-900 dark:hover:text-indigo-100 ml-1"
              >
                ✕
              </button>
            </span>
          ))}

          {filters.taluka && (
            <span className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs flex items-center gap-2 border border-cyan-200 dark:border-cyan-800">
              Taluka: <strong>{filters.taluka}</strong>
              <button
                onClick={() => updateFilter('taluka', null)}
                className="hover:text-cyan-900 dark:hover:text-cyan-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.subStatusName && (
            <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
              Sub Status: <strong>{filters.subStatusName}</strong>
              <button
                onClick={() => updateFilter('subStatusName', null)}
                className="hover:text-rose-900 dark:hover:text-rose-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.forwardedToDesignation && (
            <span className="px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg text-xs flex items-center gap-2 border border-pink-200 dark:border-pink-800">
              Designation: <strong>{filters.forwardedToDesignation}</strong>
              <button
                onClick={() => updateFilter('forwardedToDesignation', null)}
                className="hover:text-pink-900 dark:hover:text-pink-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.grievanceReviewType && (
            <span className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-xs flex items-center gap-2 border border-teal-200 dark:border-teal-800">
              Review Type: <strong>{filters.grievanceReviewType}</strong>
              <button
                onClick={() => updateFilter('grievanceReviewType', null)}
                className="hover:text-teal-900 dark:hover:text-teal-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {filters.subjectCategory && (
            <span className="px-3 py-1.5 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 rounded-lg text-xs flex items-center gap-2 border border-lime-200 dark:border-lime-800">
              Subject: <strong>{filters.subjectCategory}</strong>
              <button
                onClick={() => updateFilter('subjectCategory', null)}
                className="hover:text-lime-900 dark:hover:text-lime-100 ml-1"
              >
                ✕
              </button>
            </span>
          )}
        </div>

        <button
          onClick={clearAllFilters}
          className="ml-auto px-2 py-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-800 shadow-sm hover:shadow transition-all whitespace-nowrap"
        >
          ✕ Clear All
        </button>
      </div>
    </div>
  );
}
