// @ts-nocheck
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import GlobalFilterModal from './GlobalFilterModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalFilterButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const globalFilters = useAppSelector((state) => state.gSwagat);

  const activeFilterCount =
    (globalFilters.programTypes?.length || 0) +
    (globalFilters.districts?.length || 0) +
    (globalFilters.talukas?.length || 0) +
    (globalFilters.departments?.length || 0) +
    (globalFilters.grievanceStatuses?.length || 0) +
    (globalFilters.subStatuses?.length || 0) +
    (globalFilters.disposeChannels?.length || 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className={`
            h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300
            bg-primary text-primary-foreground
            border border-primary/20
            backdrop-blur-sm group hover:shadow-primary/40 hover:scale-105 active:scale-95
          `}
          aria-label="Open Global Filters"
        >
          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <SlidersHorizontal size={22} strokeWidth={2} />

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.span
                key={activeFilterCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-destructive-foreground text-[11px] font-bold rounded-full flex items-center justify-center border-[3px] border-background shadow-sm"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <GlobalFilterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
