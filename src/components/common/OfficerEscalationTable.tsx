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
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
 {title}
 </h3>
 <div className="flex items-center gap-2">
 <label htmlFor="base-level-select" className="text-sm font-medium text-gray-600 dark:text-gray-400">
 Base Level:
 </label>
 <select
 id="base-level-select"
 value={baseLevel}
 onChange={(e) => onBaseLevelChange(Number(e.target.value))}
 className="block pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 >
 {[1, 2, 3, 4, 5, 6].map((level) => (
 <option key={level} value={level}>
 Level {level}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div className="flex-1 overflow-auto">
 {loading ? (
 <div className="flex justify-center items-center h-full">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
 </div>
 ) : ranks.length === 0 ? (
 <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
 No data available for this level.
 </div>
 ) : (
 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
 <thead className="bg-white/80 backdrop-blur-sm dark:bg-gray-900">
 <tr>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Officer Name
 </th>
 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
 Escalations
 </th>
 </tr>
 </thead>
 <tbody className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 divide-y divide-gray-200 dark:divide-gray-700">
 {ranks.map((officer) => (
 <tr key={officer.rank} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
 <td className="px-6 py- text-sm text-gray-500 dark:text-gray-300">
 {officer.officerName}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-teal-600 dark:text-teal-400">
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
