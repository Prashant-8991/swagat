// @ts-nocheck
import { motion } from 'framer-motion';

interface ProgramTypeFilterProps {
    activeProgramTypes: string[];
    onProgramTypeClick: (type: string) => void;
}

const programTypeColorMap: Record<string, string> = {
    'GS': 'from-blue-500 to-indigo-600 shadow-blue-500/25',
    'TS': 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
    'DS': 'from-cyan-400 to-blue-500 shadow-cyan-500/25',
    'LF': 'from-orange-500 to-amber-600 shadow-orange-500/25',
    'RLF': 'from-rose-500 to-pink-600 shadow-rose-500/25',
    'WTC': 'from-violet-500 to-purple-600 shadow-violet-500/25'
};

const PROGRAM_TYPES = ['GS', 'TS', 'DS', 'LF', 'RLF', 'WTC'];

export default function ProgramTypeFilter({
    activeProgramTypes,
    onProgramTypeClick
}: ProgramTypeFilterProps) {

    return (
        <div className="flex flex-wrap items-center gap-2">
            {PROGRAM_TYPES.map((type) => {
                const isActive = activeProgramTypes.includes(type);
                return (
                    <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onProgramTypeClick(type)}
                        className={`
                            px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden shadow-sm
                            ${isActive
                                ? `bg-gradient-to-r ${programTypeColorMap[type]} text-white shadow-lg transform scale-105`
                                : 'bg-white/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 backdrop-blur-sm'
                            }
                        `}
                    >
                        <div className={`absolute inset-0 bg-white/20 dark:bg-white/10 translate-y-full transition-transform duration-300 ${isActive ? 'group-hover:translate-y-0' : ''}`} />
                        {type}
                    </motion.button>
                );
            })}
        </div>
    );
}
