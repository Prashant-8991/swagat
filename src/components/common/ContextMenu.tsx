//@ts-nocheck
import React, { useRef, useEffect } from 'react';
import { FilterState, ContextMenuState } from '../../types';

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

 const adjustedX = x;
 const adjustedY = y;

 if (!visible || !data) {
 return null;
 }

 return (
 <>
 <div
 className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9998]"
 onClick={onClose}
 />

 <div
 ref={menuRef}
 className="fixed bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-xl shadow-2xl border border-gray-200/40 dark:border-gray-700 py-2 z-[9999] min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200"
 style={{
 left: `${adjustedX}px`,
 top: `${adjustedY}px`,
 }}
 >
 <div className="px-4 py-2.5 border-b border-gray-200/40 dark:border-gray-700">
 <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
 Selected Item
 </div>
 <div
 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[180px]"
 title={data.name}
 >
 {data.name}
 </div>
 <div className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-center gap-1">
 <span className="text-gray-500 dark:text-gray-500">Count:</span>
 <span className="font-semibold text-blue-600 dark:text-blue-400">
 {data.value.toLocaleString()}
 </span>
 </div>
 </div>

 <button
 onClick={onDrillThrough}
 className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-slate-50 dark:hover:from-blue-900/20 dark:hover:to-slate-900/20 flex items-center gap-3 transition-all group"
 >
 <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 text-white group-hover:shadow-sm group-hover:shadow-blue-500/50 transition-all">
 <svg
 width="16"
 height="16"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 className="group-hover:translate-x-0.5 transition-transform"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 </div>
 <div className="flex-1">
 <div className="font-semibold text-gray-900 dark:text-gray-100">Drill Through</div>
 <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View detailed analysis</div>
 </div>
 </button>

 <div className="px-4 py-2 border-t border-gray-200/40 dark:border-gray-700 mt-1">
 <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
 <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
 ESC
 </kbd>
 <span>to close</span>
 </div>
 </div>
 </div>
 </>
 );
}
