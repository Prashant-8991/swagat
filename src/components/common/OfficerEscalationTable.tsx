//@ts-nocheck
import React from 'react';

interface OfficerRank {
    rank: number;
    officerName: string;
    escalationCount: number;
    baseLevel: number;
}

interface OfficerEscalationTableProps {
    title: string;
    ranks: OfficerRank[];
    baseLevel: number;
    onBaseLevelChange: (level: number) => void;
    loading?: boolean;
}

const OfficerEscalationTable: React.FC<OfficerEscalationTableProps> = ({
    title,
    ranks,
    baseLevel,
    onBaseLevelChange,
    loading = false
}) => {
    return (

        <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/50 dark:border-gray-700/50 h-full flex flex-col transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {title}
                </h3>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                    <label htmlFor="base-level-select" className="pl-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        LEVEL:
                    </label>
                    <select
                        id="base-level-select"
                        value={baseLevel}
                        onChange={(e) => onBaseLevelChange(Number(e.target.value))}
                        className="bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 border-none focus:ring-0 cursor-pointer py-1 pr-8 pl-1"
                    >
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <option key={level} value={level} className="bg-white dark:bg-gray-800">
                                {level}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : ranks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2 opacity-50">👮‍♂️</div>
                        <p className="font-medium">No officers found</p>
                        <p className="text-xs mt-1">Try changing the level or filters</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700/50">
                        <thead>
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Officer Name
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Escalations
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {ranks.map((officer, index) => (
                                <tr
                                    key={`${officer.rank}-${index}`}
                                    className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors rounded-lg"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            {officer.officerName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-indigo-600 dark:text-indigo-400">
                                        {officer.escalationCount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OfficerEscalationTable;
