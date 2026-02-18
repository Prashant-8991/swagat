//@ts-nocheck
import { SubjectData } from '../../types';
import EmptyState from '../UI/EmptyState';

interface SubjectSummaryCardProps {
 subjects: SubjectData[];
 allSubjects: SubjectData[] | null;
 totalSubjects: number;
 handleSubjectClick: (subject: string) => void;
 handleContextMenu: (params: any, filterKey: string) => void;
 selectedSubject: string | null;
}

export default function SubjectSummaryCard({
 subjects,
 allSubjects,
 totalSubjects,
 handleSubjectClick,
 handleContextMenu,
 selectedSubject
}: SubjectSummaryCardProps) {
 const totalGrievances = (allSubjects ?? subjects).reduce((sum, s) => sum + s.count, 0);

 return (
 <div className="relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 border border-gray-200/60/50 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm flex flex-col">
 <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
 Subject Categories Overview
 </h2>

 {subjects.length > 0 ? (
 <>
 <div className="grid grid-cols-2 gap-4 mb-6">
 <div className="p-4 dark:from-slate-900/20 dark:to-slate-800/20 rounded-xl border border-gray-200/60 dark:border-slate-700">
 <div className="text-2xl font-bold text-black dark:text-slate-300">
 {allSubjects?.length ?? totalSubjects}
 </div>
 <div className="text-xs text-black dark:text-black font-medium">
 Total Categories
 </div>
 </div>

 <div className="p-4 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-gray-200/60 dark:border-blue-700">
 <div className="text-2xl font-bold text-black dark:text-blue-300">
 {totalGrievances.toLocaleString()}
 </div>
 <div className="text-xs text-black dark:text-blue-400 font-medium">
 Total Grievances
 </div>
 </div>
 </div>

 <div className="mb-4">
 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
 Top 5 Categories
 </h3>
 <div className="space-y-2">
 {subjects.slice(0, 5).map((subject, idx) => (
 <div
 key={`top-subject-${subject.subjectCategory}-${idx}`}
 onClick={() => handleSubjectClick(subject.subjectCategory)}
 onContextMenu={(e) => {
 e.preventDefault();
 handleContextMenu(
 {
 name: subject.subjectCategory,
 value: subject.count,
 event: { event: e }
 },
 'subjectCategory'
 );
 }}
 className={`p-3 rounded-lg cursor-pointer transition-all ${
 selectedSubject === subject.subjectCategory
 ? 'bg-slate-100 dark:bg-slate-900/30 border-2 border-slate-500'
 : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200/40 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex-1 min-w-0 mr-3">
 <div className="text-sm font-medium text-black dark:text-gray-100 truncate">
 {subject.subjectCategory}
 </div>
 <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
 {subject.percentage.toFixed(1)}% of total
 </div>
 </div>
 <div className="text-right">
 <div className="text-lg font-bold text-black dark:text-slate-300">
 {subject.count.toLocaleString()}
 </div>
 </div>
 </div>
 <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
 <div
 className="h-full bg-black rounded-full transition-all duration-500"
 style={{ width: `${subject.percentage}%` }}
 ></div>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="mt-auto pt-4 border-t border-gray-200/40 dark:border-gray-700">
 <a
 href="#subject-table"
 className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-2"
 >
 View all {allSubjects?.length ?? totalSubjects} categories below →
 </a>
 </div>
 </>
 ) : (
 <EmptyState
 icon="📋"
 message="No subject categories found for selected filters"
 />
 )}
 </div>
 );
}
