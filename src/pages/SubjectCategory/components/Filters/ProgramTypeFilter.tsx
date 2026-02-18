// @ts-nocheck
import { motion } from 'framer-motion';

interface ProgramTypeFilterProps {
    activeProgramTypes: string[];
    onProgramTypeClick: (type: string) => void;
}

const programTypeColorMap: Record<string, string> = {
    'GS': 'from-blue-600 to-blue-700 shadow-blue-500/25',
    'TS': 'from-green-600 to-green-700 shadow-green-500/25',
    'DS': 'from-teal-600 to-teal-700 shadow-teal-500/25',
    'LF': 'from-orange-600 to-orange-700 shadow-orange-500/25',
    'RLF': 'from-red-600 to-red-700 shadow-red-500/25',
    'WTC': 'from-pink-600 to-pink-700 shadow-pink-500/25'
};

const PROGRAM_TYPES = ['GS', 'TS', 'DS', 'LF', 'RLF', 'WTC'];

export default function ProgramTypeFilter({
    activeProgramTypes,
    onProgramTypeClick
}: ProgramTypeFilterProps) {

    return (
        <div className="flex flex-wrap items-center gap-2">
            {PROGRAM_TYPES.map((type) => {
                const isActive = (activeProgramTypes || []).includes(type);
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
                        {type}
                    </motion.button>
                );
            })}
        </div>
    );
}
