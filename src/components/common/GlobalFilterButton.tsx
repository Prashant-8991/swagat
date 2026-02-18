// @ts-nocheck
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import GlobalFilterModal from './GlobalFilterModal';
import { motion } from 'framer-motion';

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
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsModalOpen(true)}
          className={`
            h-14 w-14 rounded-2xl shadow-glass-lg flex items-center justify-center transition-all duration-300
            bg-gray-800 hover:bg-gray-900 text-white relative
          `}
          aria-label="Open Global Filters"
        >
          <SlidersHorizontal size={20} strokeWidth={1.8} />
          {hasActiveFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm"
            >
              {activeFilterCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      <GlobalFilterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
