// @ts-nocheck
import { useState } from 'react';
import { HiFunnel } from 'react-icons/hi2';
import { useAppSelector } from '../../redux/hooks';
import GlobalFilterModal from './GlobalFilterModal';

export default function GlobalFilterButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const globalFilters = useAppSelector((state) => state.gSwagat);

  const activeFilterCount =
    globalFilters.programTypes.length +
    globalFilters.districts.length +
    globalFilters.talukas.length +
    globalFilters.departments.length +
    globalFilters.grievanceStatuses.length +
    globalFilters.subStatuses.length +
    globalFilters.disposeChannels.length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className={`
            h-14 w-14 rounded-2xl shadow-xl shadow-gray-800/15 flex items-center justify-center transition-all duration-300
            hover:scale-110 active:scale-95 bg-gray-800 hover:bg-gray-900 text-white
          `}
          aria-label="Open Global Filters"
        >
          <HiFunnel className="w-6 h-6" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm animate-pulse">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <GlobalFilterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
