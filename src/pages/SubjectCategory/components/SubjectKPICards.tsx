// @ts-nocheck
import { motion } from 'framer-motion';

interface SubjectKPICardsProps {
    totalGrievances: number;
    avgDisposalDays?: number;
    programTypes: string[];
    topCategory?: { name: string; count: number } | null;
}

export default function SubjectKPICards({
    totalGrievances,
    avgDisposalDays,
    programTypes,
    topCategory
}: SubjectKPICardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Grievances Card */}
            <div
                className="relative group overflow-hidden bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 origin-top-right">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-600 dark:text-blue-400">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </span>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total Grievances
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-2 mt-4">
                            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">
                                {totalGrievances.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            {programTypes.length > 0 ? `Across ${programTypes.length} program types` : 'All program types'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Average Disposal Time Card */}
            <div
                className="relative group overflow-hidden bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 origin-top-right">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-600 dark:text-teal-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-sm border border-teal-100 dark:border-teal-800">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </span>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Avg Disposal Time
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-2 mt-4">
                            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 tracking-tight">
                                {avgDisposalDays ? avgDisposalDays.toFixed(1) : 'N/A'}
                            </span>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">days</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                            Average across subject categories
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Category Card */}
            <div
                className="relative group overflow-hidden bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 origin-top-right">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600 dark:text-indigo-400">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-800">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                            </span>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Top Category
                            </h3>
                        </div>

                        <div className="mt-4">
                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Highest Volume</div>
                            <div className="font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem] text-lg leading-tight" title={topCategory?.name || 'N/A'}>
                                {topCategory?.name || 'No Data Available'}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between gap-1.5 w-full">
                            <span className="flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                Grievances
                            </span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">{topCategory?.count?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
