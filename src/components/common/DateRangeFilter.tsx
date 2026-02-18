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
            toDate: formatDateForAPI(date && endDate ? endDate : null)
        }));
    };

    const handleToDateChange = (date: Date | null) => {
        setEndDate(date);
        dispatch(setDateRange({
            fromDate: formatDateForAPI(date && startDate ? startDate : null),
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
            <div className="flex items-center justify-end gap-3 flex-wrap z-20">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='h-10 px-4 glass rounded-xl flex items-center gap-2 transition-all duration-200 
 cursor-pointer text-gray-500 hover:text-gray-900 border border-white/50 hover:border-brand-200 hover:bg-white/90 shadow-sm'
                    onClick={openModal}
                    title="Global Search (Ctrl + K)"
                >
                    <Search size={16} strokeWidth={2} />
                    <span className="text-xs font-semibold tracking-wide">Ctrl + K</span>
                </motion.div>

                <div className="h-6 w-px bg-gray-300/50 mx-1"></div>

                <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-white/60 shadow-glass">
                    <div className="flex items-center relative group">
                        <div className="absolute left-3 text-gray-400 group-hover:text-brand-500 transition-colors pointer-events-none">
                            <CalendarDays size={14} />
                        </div>
                        <DatePicker
                            selected={startDate}
                            onChange={handleFromDateChange}
                            minDate={minDate}
                            maxDate={maxDate}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Start Date"
                            className="pl-9 pr-3 py-2 bg-transparent text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none w-[110px] cursor-pointer"
                            wrapperClassName="date-picker-wrapper"
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </div>

                    <span className="text-gray-300 select-none">/</span>

                    <div className="flex items-center relative group">
                        <div className="absolute left-3 text-gray-400 group-hover:text-brand-500 transition-colors pointer-events-none">
                            <CalendarDays size={14} />
                        </div>
                        <DatePicker
                            selected={endDate}
                            onChange={handleToDateChange}
                            minDate={startDate || minDate}
                            maxDate={maxDate}
                            dateFormat="dd MMM yyyy"
                            placeholderText="End Date"
                            className="pl-9 pr-3 py-2 bg-transparent text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none w-[110px] cursor-pointer"
                            wrapperClassName="date-picker-wrapper"
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </div>
                </div>

                {(startDate || endDate) && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleClearDates}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-error-50 text-error-500 hover:bg-error-100 hover:text-error-600 transition-colors"
                        title="Clear date filters"
                    >
                        <X size={14} strokeWidth={2.5} />
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