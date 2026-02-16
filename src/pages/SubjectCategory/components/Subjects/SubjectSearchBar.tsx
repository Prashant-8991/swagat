//@ts-nocheck
interface SubjectSearchBarProps {
 searchQuery: string;
 setSearchQuery: (query: string) => void;
 setCurrentPage: (page: number) => void;
}

export default function SubjectSearchBar({
 searchQuery,
 setSearchQuery,
 setCurrentPage
}: SubjectSearchBarProps) {
 const handleChange = (value: string) => {
 setSearchQuery(value);
 setCurrentPage(1);
 };

 const handleClear = () => {
 setSearchQuery('');
 setCurrentPage(1);
 };

 return (
 <div className="mb-4">
 <div className="relative">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="absolute left-3 top-3 h-5 w-5 text-gray-400"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
 />
 </svg>

 <input
 type="text"
 value={searchQuery}
 onChange={(e) => handleChange(e.target.value)}
 placeholder="Search subject categories..."
 className="w-full px-4 py-2.5 pl-10 text-sm bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
 />

 {searchQuery && (
 <button
 onClick={handleClear}
 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
 title="Clear search"
 >
 <svg
 xmlns="http://www.w3.org/2000/svg"
 className="h-5 w-5"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth={2}
 d="M6 18L18 6M6 6l12 12"
 />
 </svg>
 </button>
 )}
 </div>
 </div>
 );
}
