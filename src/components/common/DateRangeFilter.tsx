//@ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarDays, X, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setDateRange, clearDates } from '../../redux/features/dateSlice';
import { motion } from 'framer-motion';

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
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='p-2 px-3.5 gap-2.5 glass rounded-xl flex justify-center items-center transition-all duration-200 
 cursor-pointer text-gray-600 hover:text-gray-800 dark:text-gray-300'
                    onClick={openModal}
                    title="Global Search (Ctrl + K)"
                >
                    <Search size={16} strokeWidth={1.8} />
                    <span className="text-xs font-medium text-gray-400">Ctrl + K</span>
                </motion.div>

                <CalendarDays size={16} strokeWidth={1.8} className="text-gray-400 dark:text-gray-500" />

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap tracking-wide">
                        From:
                    </label>
                    <DatePicker
                        selected={startDate}
                        onChange={handleFromDateChange}
                        minDate={minDate}
                        maxDate={maxDate}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className="px-3 py-2 border border-gray-200/50 dark:border-gray-600 rounded-lg 
 glass text-gray-800 dark:text-white text-xs font-medium
 focus:ring-1 focus:ring-brand-300/50 focus:border-brand-300/50
 transition-all duration-200 w-[120px] cursor-pointer"
                        wrapperClassName="date-picker-wrapper"
                        calendarClassName="dark:bg-gray-800 dark:border-gray-600"
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap tracking-wide">
                        To:
                    </label>
                    <DatePicker
                        selected={endDate}
                        onChange={handleToDateChange}
                        minDate={startDate || minDate}
                        maxDate={maxDate}
                        dateFormat="dd-MM-yyyy"
                        placeholderText="DD-MM-YYYY"
                        className="px-3 py-2 border border-gray-200/50 dark:border-gray-600 rounded-lg 
 glass text-gray-800 dark:text-white text-xs font-medium
 focus:ring-1 focus:ring-brand-300/50 focus:border-brand-300/50
 transition-all duration-200 w-[120px] cursor-pointer"
                        wrapperClassName="date-picker-wrapper"
                        calendarClassName="dark:bg-gray-800 dark:border-gray-600"
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>

                {(startDate || endDate) && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleClearDates}
                        className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 
 glass border border-gray-200/40 dark:border-gray-700
 rounded-lg hover:text-gray-700 dark:hover:text-gray-200 
 transition-all duration-200"
                        title="Clear date filters"
                    >
                        <X size={14} strokeWidth={2} />
                        Clear
                    </motion.button>
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