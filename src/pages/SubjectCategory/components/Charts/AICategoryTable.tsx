//@ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { AICategoryData } from '../../types';
import EmptyState from '../UI/EmptyState';
import SubjectPagination from '../Subjects/SubjectPagination';
import DownloadCsvButton from '../../../../components/common/DownloadCsvButton';

interface AICategoryTableProps {
 aiCategories: AICategoryData[];
 handleAICategoryClick: (aiCategory: string) => void;
 handleContextMenu: (params: any, filterKey: string) => void;
 selectedAICategory: string | null;
}

export default function AICategoryTable({
 aiCategories,
 handleAICategoryClick,
 handleContextMenu,
 selectedAICategory
}: AICategoryTableProps) {
 const [currentPage, setCurrentPage] = useState(1);
 const [searchQuery, setSearchQuery] = useState('');
 const pageSize = 6;

 const filteredCategories = useMemo(() => {
 if (!searchQuery.trim()) return aiCategories;

 const query = searchQuery.toLowerCase();
 return aiCategories.filter(cat =>
 cat.aiCategory.toLowerCase().includes(query)
 );
 }, [aiCategories, searchQuery]);

 const totalPages = Math.ceil(filteredCategories.length / pageSize);
 const startIndex = (currentPage - 1) * pageSize;
 const endIndex = startIndex + pageSize;
 const paginatedCategories = filteredCategories.slice(startIndex, endIndex);
 const showPagination = filteredCategories.length > pageSize;

 useEffect(() => {
 setCurrentPage(1);
 }, [aiCategories.length, searchQuery]);

 const handleDownloadCsv = () => {
 const csvContent = [
 ['AI Category', 'Count', 'Avg Disposal Days'].join(','),
 ...aiCategories.map(cat =>
 [cat.aiCategory, cat.count, cat.avgDisposalDays ? cat.avgDisposalDays.toFixed(1) : 'N/A'].join(',')
 )
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = 'ai_categories.csv';
 a.click();
 window.URL.revokeObjectURL(url);
 };

 return (
 <div className="relative bg-white p-1 rounded-2xl shadow-sm transition-transform duration-300 flex flex-col overflow-hidden group h-full">
 <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
 <div className="absolute inset-0 rounded-2xl p-[1px] bg-white mask-linear-gradient" />
 <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col z-10">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-bold bg-clip-text text-black flex items-center gap-2">
 Categories
 </h2>
 <div className="flex items-center gap-2">
 <span className="text-sm text-gray-500 dark:text-gray-400">
 {filteredCategories.length} results
 </span>
 <DownloadCsvButton onClick={handleDownloadCsv} />
 </div>
 </div>

 <div className="mb-4">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
 <svg
 className="w-4 h-4 text-gray-500 dark:text-gray-400"
 aria-hidden="true"
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 20 20"
 >
 <path
 stroke="currentColor"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="2"
 d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
 />
 </svg>
 </div>
 <input
 type="text"
 className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
 placeholder="Search AI categories..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
 title="Clear search"
 >
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>
 </div>

 <div className="overflow-x-auto max-h-[500px]">
 <table className="w-full text-sm">
 <thead className="bg-gray-100 dark:bg-gray-700/50 border-b-2 border-gray-200/30 dark:border-gray-600 sticky top-0">
 <tr>
 <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
 AI Category
 </th>
 <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
 Count
 </th>
 <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
 Avg Disposal
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
 {paginatedCategories.length > 0 ? (
 paginatedCategories
 .filter(category => category.aiCategory !== 'અન્ય')
 .map((category, idx) => (
 <tr
 key={`${category.aiCategory}-${idx}`}
 onClick={() => handleAICategoryClick(category.aiCategory)}
 onContextMenu={(e) => {
 e.preventDefault()
 handleContextMenu(
 {
 name: category.aiCategory,
 value: category.count,
 event: e
 },
 'aiCategory'
 )
 }}
 className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${selectedAICategory === category.aiCategory
 ? 'bg-slate-50 dark:bg-slate-900/20 border-l-4 border-slate-500'
 : ''
 }`}
 title="Click to filter, right-click to drill through"
 >
 <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
 {category.aiCategory}
 </td>
 <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
 {category.count.toLocaleString()}
 </td>
 <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
 {category.avgDisposalDays != null ? category.avgDisposalDays.toFixed(1) : 'N/A'}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={4} className="px-4 py-8 text-center">
 <EmptyState
 icon="📊"
 message={
 searchQuery
 ? `No results for "${searchQuery}"`
 : 'No AI categories found for selected filters'
 }
 />
 </td>
 </tr>
 )}

 </tbody>
 </table>
 </div>

 {showPagination && totalPages > 1 && (
 <SubjectPagination
 currentPage={currentPage}
 totalPages={totalPages}
 totalSubjects={filteredCategories.length}
 pageSize={pageSize}
 setCurrentPage={setCurrentPage}
 />
 )}
 </div>
 </div>
 );
}