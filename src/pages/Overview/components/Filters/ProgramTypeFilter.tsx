// @ts-nocheck
import { motion } from 'framer-motion';

interface ProgramTypeFilterProps {
    activeProgramTypes: string[];
    onProgramTypeClick: (type: string) => void;
}

const programTypeColorMap: Record<string, string> = {
    'GS': 'from-blue-400 to-blue-500 shadow-blue-500/20',
    'TS': 'from-green-500 to-green-600 shadow-emerald-500/20',
    'DS': 'from-teal-400 to-teal-500 shadow-teal-500/20',
    'LF': 'from-orange-400 to-orange-500 shadow-orange-500/20',
    'RLF': 'from-red-500 to-red-600 shadow-rose-500/20',
    'WTC': 'from-purple-500 to-purple-600 shadow-purple-500/20'
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
                                ? `bg-gradient-to-r ${programTypeColorMap[type]} text-white shadow-lg`
                                : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                            }
                `}
                    >
                        <div className={`absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 ${isActive ? 'group-hover:translate-y-0' : ''}`} />
                        {type}
                    </motion.button>
                );
            })}
        </div>
    );
}
