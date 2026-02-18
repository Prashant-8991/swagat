//@ts-nocheck
interface SubjectPaginationProps {
 currentPage: number;
 totalPages: number;
 totalSubjects: number;
 pageSize: number;
 setCurrentPage: (page: number) => void;
}

export default function SubjectPagination({
 currentPage,
 totalPages,
 totalSubjects,
 pageSize,
 setCurrentPage
}: SubjectPaginationProps) {
 if (totalPages <= 1) {
 return null;
 }

 const startIndex = (currentPage - 1) * pageSize + 1;
 const endIndex = Math.min(currentPage * pageSize, totalSubjects);

 return (
 <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-200/40 dark:border-gray-700 pt-4">
 <div className="text-sm text-gray-600 dark:text-gray-400">
 Showing {startIndex} to {endIndex} of {totalSubjects} categories
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
 disabled={currentPage === 1}
 className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
 >
 Previous
 </button>

 <span className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
 Page {currentPage} of {totalPages}
 </span>

 <button
 onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
 disabled={currentPage === totalPages}
 className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
 >
 Next
 </button>
 </div>
 </div>
 );
}
