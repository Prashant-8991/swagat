//@ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setDateRange, clearDates } from '../../redux/features/dateSlice';
import { IoMdSearch } from "react-icons/io";

import GlobalSearchModal from './GlobalSearchModal';

import 'react-datepicker/dist/react-datepicker.css';

const DateRangeFilter: React.FC = () => {
 const dispatch = useAppDispatch();
 const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

 const [isModalOpen, setIsModalOpen] = useState(false);

 const [startDate, setStartDate] = useState<Date | null>(
 fromDate ? new Date(fromDate) : null
 );
 const [endDate, setEndDate] = useState<Date | null>(
 toDate ? new Date(toDate) : null
 );

 const openModal = () => setIsModalOpen(true);
 const closeModal = useCallback(() => setIsModalOpen(false), []);

 useEffect(() => {
 setStartDate(fromDate ? new Date(fromDate) : null);
 setEndDate(toDate ? new Date(toDate) : null);
 }, [fromDate, toDate]);

 useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.ctrlKey && event.key === 'k') {
 event.preventDefault(); 
 openModal();
 }
 };

 document.addEventListener('keydown', handleKeyDown);

 return () => {
 document.removeEventListener('keydown', handleKeyDown);
 };
 }, []);

 const getYesterday = (): Date => {
 const yesterday = new Date();
 yesterday.setDate(yesterday.getDate() - 1);
 return yesterday;
 };

 const maxDate = getYesterday();

 const minDate = new Date(2023, 11, 25); 

 const formatDateForAPI = (date: Date | null): string | null => {
 if (!date) return null;
 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const day = String(date.getDate()).padStart(2, '0');
 return `${year}-${month}-${day}`;
 };

 const handleFromDateChange = (date: Date | null) => {
 setStartDate(date);
 dispatch(setDateRange({
 fromDate: formatDateForAPI(date),
 toDate: formatDateForAPI(endDate)
 }));
 };

 const handleToDateChange = (date: Date | null) => {
 setEndDate(date);
 dispatch(setDateRange({
 fromDate: formatDateForAPI(startDate),
 toDate: formatDateForAPI(date)
 }));
 };

 const handleClearDates = () => {
 setStartDate(null);
 setEndDate(null);
 dispatch(clearDates());
 };

 return (
 <>
 <div className="flex items-center justify-end gap-3 flex-wrap z-200">
 <div
 className='p-2 px-4 gap-3 bg-[#EBECF0] dark:bg-gray-700 text-gray-900 dark:text-white 
 cursor-pointer rounded-full flex justify-center items-center transition-colors duration-200 
 hover:bg-[#DEDFE4] dark:hover:bg-gray-600'
 onClick={openModal}
 title="Global Search (Ctrl + K)"
 >
 <IoMdSearch size={20} className='' />
 Ctrl + K
 </div>

 <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />

 <div className="flex items-center gap-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
 From:
 </label>
 <DatePicker
 selected={startDate}
 onChange={handleFromDateChange}
 minDate={minDate}
 maxDate={maxDate}
 dateFormat="dd-MM-yyyy"
 placeholderText="DD-MM-YYYY"
 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
 bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 text-gray-900 dark:text-white text-sm
 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
 transition-colors duration-200 w-[130px] cursor-pointer"
 wrapperClassName="date-picker-wrapper"
 calendarClassName="dark:bg-gray-800 dark:border-gray-600"
 selectsStart
 startDate={startDate}
 endDate={endDate}
 />
 </div>

 <div className="flex items-center gap-2">
 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
 To:
 </label>
 <DatePicker
 selected={endDate}
 onChange={handleToDateChange}
 minDate={startDate || minDate}
 maxDate={maxDate}
 dateFormat="dd-MM-yyyy"
 placeholderText="DD-MM-YYYY"
 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
 bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 text-gray-900 dark:text-white text-sm
 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
 transition-colors duration-200 w-[130px] cursor-pointer"
 wrapperClassName="date-picker-wrapper"
 calendarClassName="dark:bg-gray-800 dark:border-gray-600"
 selectsEnd
 startDate={startDate}
 endDate={endDate}
 />
 </div>

 {(startDate || endDate) && (
 <button
 onClick={handleClearDates}
 className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 
 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 
 transition-colors duration-200"
 title="Clear date filters"
 >
 <XMarkIcon className="w-4 h-4" />
 Clear
 </button>
 )}
 </div>

 <GlobalSearchModal
 isOpen={isModalOpen}
 onRequestClose={closeModal}
 />
 </>
 );
};

export default DateRangeFilter;