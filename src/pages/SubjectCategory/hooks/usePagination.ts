import { useState, useMemo } from 'react';
import { SubjectData } from '../types';

export function usePagination(
 apiSubjects: SubjectData[] | undefined,
 allSubjects: SubjectData[] | null,
 pageSize: number = 10
) {
 const [currentPage, setCurrentPage] = useState(1);
 const [searchQuery, setSearchQuery] = useState('');

 const { displayedSubjects, showPagination } = useMemo(() => {
 let displayed: SubjectData[] = [];
 let isPaginated = false;

 if (searchQuery.trim() && allSubjects) {
 
 displayed = allSubjects.filter(s =>
 s.subjectCategory.toLowerCase().includes(searchQuery.toLowerCase())
 );
 isPaginated = false;
 } else if (apiSubjects) {
 
 displayed = apiSubjects;
 isPaginated = true;
 }

 return {
 displayedSubjects: displayed,
 showPagination: isPaginated
 };
 }, [searchQuery, apiSubjects, allSubjects]);
 
 const totalSubjects = displayedSubjects.length;
 const totalPages = Math.ceil(totalSubjects / pageSize);
 
 const paginatedSubjects = useMemo(() => {
 if (showPagination) {
 const startIndex = (currentPage - 1) * pageSize;
 const endIndex = currentPage * pageSize;
 return displayedSubjects.slice(startIndex, endIndex);
 }
 return displayedSubjects;
 }, [displayedSubjects, showPagination, currentPage, pageSize]);

 return {
 searchQuery,
 setSearchQuery,
 currentPage,
 setCurrentPage,
 displayedSubjects,
 paginatedSubjects,
 showPagination,
 totalPages,
 totalSubjects,
 pageSize
 };
}
