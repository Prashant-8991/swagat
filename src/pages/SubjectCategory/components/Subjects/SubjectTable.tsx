//@ts-nocheck
import { SubjectData } from '../../types';
import SubjectSearchBar from './SubjectSearchBar';
import SubjectPagination from './SubjectPagination';
import DownloadCsvButton from '../../../../components/common/DownloadCsvButton';
import EmptyState from '../UI/EmptyState';

interface SubjectTableProps {
  displayedSubjects: SubjectData[];
  paginatedSubjects: SubjectData[];
  showPagination: boolean;
  totalSubjects: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSubjectClick: (subject: string) => void;
  handleContextMenu: (params: any, filterKey: string) => void;
  handleSubjectCsv: () => void;
  selectedSubject: string | null;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export default function SubjectTable({
  displayedSubjects,
  paginatedSubjects,
  showPagination,
  totalSubjects,
  totalPages,
  currentPage,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  handleSubjectClick,
  handleContextMenu,
  handleSubjectCsv,
  selectedSubject,
  pageSize,
  setPageSize
}: SubjectTableProps) {
  return (
    <div
      id="subject-table"
      className="relative bg-white p-1 rounded-2xl shadow-xl hover:scale-101 transition-transform duration-300 flex flex-col overflow-hidden group"
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute inset-0 rounded-2xl p-[1px] bg-white mask-linear-gradient" />
      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold bg-clip-text text-black flex items-center gap-2">
            Subject Categories
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
              <option value={2}>2 per page</option>
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalSubjects} results
            </span>
            <DownloadCsvButton onClick={handleSubjectCsv} />
          </div>
        </div>

        <SubjectSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCurrentPage={setCurrentPage}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700/50 border-b-2 border-black dark:border-gray-600 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  #
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Subject Category
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Count
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                  Avg Disposal Days
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedSubjects.length > 0 ? (
                paginatedSubjects.map((subject, idx) => (
                  <tr
                    key={`${subject.subjectCategory}-${idx}`}
                    onClick={() => handleSubjectClick(subject.subjectCategory)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleContextMenu(
                        {
                          name: subject.subjectCategory,
                          value: subject.count,
                          event: e
                        },
                        'subjectCategory'
                      );
                    }}
                    className={`
          cursor-pointer 
          hover:bg-gray-50 dark:hover:bg-gray-700/30 
          transition-colors 
          ${selectedSubject === subject.subjectCategory
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500'
                        : ''
                      }
        `}
                    title="Click to filter, right-click to drill through"
                  >
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                      {showPagination ? (currentPage - 1) * pageSize + idx + 1 : idx + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                      {subject.subjectCategory}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                      {subject.aiCategory}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
                      {subject.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-semibold">
                      {subject.avgDisposalDays != null ? subject.avgDisposalDays.toFixed(1) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <EmptyState
                      icon="🔍"
                      message={
                        searchQuery
                          ? `No results for "${searchQuery}"`
                          : 'No subject categories found for selected filters'
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
            totalSubjects={totalSubjects}
            pageSize={pageSize}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
