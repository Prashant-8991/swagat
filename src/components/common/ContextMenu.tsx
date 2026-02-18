//@ts-nocheck
import React, { useRef, useEffect } from 'react';
import { FilterState, ContextMenuState } from '../../types';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    data: ContextMenuState['data'];
    filterKey: ContextMenuState['filterKey'];
    filters: FilterState;
    onClose: () => void;
    onDrillThrough: () => void;
}

export default function ContextMenu({
    visible,
    x,
    y,
    data,
    filterKey,
    filters,
    onClose,
    onDrillThrough
}: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [visible, onClose]);

    if (!visible || !data) {
        return null;
    }

    return (
        <>
            <div
                className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[9998]"
                onClick={onClose}
            />

            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed glass-strong dark:bg-gray-800/90 rounded-2xl shadow-glass-lg border border-gray-200/30 dark:border-gray-700/50 py-2 z-[9999] min-w-[240px]"
                style={{
                    left: `${x}px`,
                    top: `${y}px`,
                }}
            >
                <div className="px-4 py-3 border-b border-gray-100/40 dark:border-gray-700/40">
                    <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] mb-2">
                        Selected Item
                    </div>
                    <div
                        className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[200px]"
                        title={data.name}
                    >
                        {data.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                        <span>Count:</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                            {data.value.toLocaleString()}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onDrillThrough}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-700/40 flex items-center gap-3 transition-all group"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-800 text-white transition-all shadow-sm group-hover:shadow-md">
                        <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-100 text-[13px]">Drill Through</div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">View detailed analysis</div>
                    </div>
                </button>

                <div className="px-4 py-2 border-t border-gray-100/40 dark:border-gray-700/40 mt-1">
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100/80 dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600 rounded shadow-glass-sm">
                            ESC
                        </kbd>
                        <span>to close</span>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
