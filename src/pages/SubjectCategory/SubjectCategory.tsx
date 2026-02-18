//@ts-nocheck
import { useState, useMemo, useCallback } from 'react';
import { useFilters } from './hooks/useFilters';
import { useForecast } from './hooks/useForecast';
import { useSubjectData } from './hooks/useSubjectData';
import { useTrends } from './hooks/useTrends';
import { useContextMenu } from './hooks/useContextMenu';
import { usePagination } from './hooks/usePagination';
import { downloadCsv } from './utils/downloadCsv';
import { convertFilterToDisplay } from './utils/dateHelpers';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';
import { Link } from 'react-router-dom';
import ContextMenu from '../../components/common/ContextMenu';
import LoadingSpinner from './components/UI/LoadingSpinner';
import GlobalFilterButton from '../../components/common/GlobalFilterButton';
import ProgramTypeFilter from './components/Filters/ProgramTypeFilter';
import ForecastToggle from './components/Filters/ForecastToggle';
import ActiveFiltersPane from './components/Filters/ActiveFiltersPane';
import StickyMiniActiveFilters from './components/Filters/StickyMiniActiveFilters';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import DistrictChoroplethMap from './components/Charts/DistrictChoroplethMap';
import MonthlyTimelineChart from './components/Charts/MonthlyTimelineChart';
import SubjectTrendlineAnalysis from './components/Charts/SubjectTrendlineAnalysis';
import DepartmentTalukaChart from './components/Charts/DepartmentTalukaChart';
import SubjectTable from './components/Subjects/SubjectTable';
import AICategoryTable from './components/Charts/AICategoryTable';
import SubjectKPICards from './components/SubjectKPICards';
import ChartCard from '../Overview/components/Charts/ChartCard';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubjectCategory() {
    const { filters: globalFilterValues, hasGlobalFilters } = useGlobalFilters();

    const {
        filters: localFilters,
        updateFilter: updateLocalFilter,
        handleProgramTypeClick: handleLocalProgramTypeClick,
        handleDistrictClick: handleLocalDistrictClick,
        handleTalukaClick: handleLocalTalukaClick,
        handleSubjectClick: handleLocalSubjectClick,
        handleAICategoryClick: handleLocalAICategoryClick,
        handleMonthClick: handleLocalMonthClick,
        handleGrievanceStatusClick: handleLocalGrievanceStatusClick,
        handleDisposeChannelClick: handleLocalDisposeChannelClick,
        clearFilters,
        hasActiveFilters: hasLocalFilters,
        handleDepartmentClick: handleLocalDepartmentClick,
        newupdateFilter,
        clearLocalFiltersOnly
    } = useFilters();

    const mergedFilters = useMemo(() => ({
        ...globalFilterValues,
        ...Object.fromEntries(
            Object.entries(localFilters).filter(([_, value]) => value !== null)
        )
    }), [globalFilterValues, localFilters]);

    const activeProgramTypes = hasGlobalFilters
        ? (globalFilterValues.programTypes || [])
        : (localFilters.programTypes || []);

    const hasActiveFilters = hasGlobalFilters || hasLocalFilters;

    // Use handlers directly without unnecessary useCallback wrappers
    const handleProgramTypeClick = handleLocalProgramTypeClick;
    const handleDistrictClick = handleLocalDistrictClick;
    const handleTalukaClick = handleLocalTalukaClick;
    const handleSubjectClick = handleLocalSubjectClick;
    const handleAICategoryClick = handleLocalAICategoryClick;
    const handleMonthClick = handleLocalMonthClick;
    const handleGrievanceStatusClick = handleLocalGrievanceStatusClick;
    const handleDisposeChannelClick = handleLocalDisposeChannelClick;
    const handleDepartmentClick = handleLocalDepartmentClick;
    const updateFilter = updateLocalFilter;

    const {
        includeForecast,
        setIncludeForecast,
        forecastLoading,
        forecastData
    } = useForecast(mergedFilters);

    const {
        dashboardData,
        allSubjects,
        loading,
        error,
        forecastAvailable
    } = useSubjectData(mergedFilters);

    const {
        increasingTrends,
        decreasingTrends,
        trendsLoading
    } = useTrends(mergedFilters);

    const {
        contextMenu,
        handleContextMenu,
        closeContextMenu,
        handleDrillThrough
    } = useContextMenu(mergedFilters);

    const [pageSize, setPageSize] = useState(5);

    const [activeDepartmentOverlay, setActiveDepartmentOverlay] = useState(null);

    const {
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        displayedSubjects,
        paginatedSubjects,
        showPagination,
        totalPages,
        totalSubjects
    } = usePagination(dashboardData?.subjects, allSubjects, pageSize);

    const handleForecastCsv = useCallback(() => {
        const monthlyTrends = dashboardData?.monthlyTrends || [];
        const historicalRows = (monthlyTrends.filter((t) => !t.isForecast) || []).map((d) => ({
            source: 'Historical',
            monthDisplay: d?.monthDisplay ?? '',
            count: d?.count ?? '',
            percentage: d?.percentage ?? '',
            forecastLower: d?.forecastLower ?? '',
            forecastUpper: d?.forecastUpper ?? ''
        }));

        const forecastRows = (forecastData || []).map((d) => ({
            source: 'Forecast',
            monthDisplay: d?.monthDisplay ?? '',
            count: d?.count ?? '',
            percentage: d?.percentage ?? '',
            forecastLower: d?.forecastLower ?? '',
            forecastUpper: d?.forecastUpper ?? ''
        }));

        const columns = [
            { key: 'source', label: 'Source' },
            { key: 'monthDisplay', label: 'Month' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' },
            { key: 'forecastLower', label: '95% Lower' },
            { key: 'forecastUpper', label: '95% Upper' }
        ];

        downloadCsv({
            data: [...historicalRows, ...forecastRows],
            columns,
            filename: 'monthly_trends.csv'
        });
    }, [dashboardData?.monthlyTrends, forecastData]);

    const handleDistrictCsv = useCallback(() => {
        const columns = [
            { key: 'district', label: 'District' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' }
        ];
        downloadCsv({
            data: dashboardData?.districts || [],
            columns,
            filename: 'districts.csv'
        });
    }, [dashboardData?.districts]);

    const handleTalukaCsv = useCallback(() => {
        const columns = [
            { key: 'taluka', label: 'Taluka' },
            { key: 'district', label: 'District' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' }
        ];
        downloadCsv({
            data: dashboardData?.talukas || [],
            columns,
            filename: 'talukas.csv'
        });
    }, [dashboardData?.talukas]);

    const handleSubjectCsv = useCallback(() => {
        const columns = [
            { key: 'subjectCategory', label: 'Subject Category' },
            { key: 'count', label: 'Count' },
            { key: 'avgDisposalDays', label: 'Avg Disposal Days' },
            { key: 'percentage', label: 'Percentage' }
        ];
        downloadCsv({
            data: allSubjects ?? displayedSubjects,
            columns,
            filename: 'subject_categories.csv'
        });
    }, [allSubjects, displayedSubjects]);

    const { districts, talukas, subjects, aiCategories, monthlyTrends, departments } = useMemo(() => {
        if (!dashboardData) {
            return {
                districts: [],
                talukas: [],
                subjects: [],
                aiCategories: [],
                monthlyTrends: [],
                departments: []
            };
        }
        return {
            districts: dashboardData.districts || [],
            talukas: dashboardData.talukas || [],
            subjects: dashboardData.subjects || [],
            aiCategories: dashboardData.aiCategories || [],
            monthlyTrends: dashboardData.monthlyTrends || [],
            departments: dashboardData.departments || []
        };
    }, [dashboardData]);

    const historical = useMemo(() =>
        monthlyTrends?.filter(t => !t.isForecast) || [],
        [monthlyTrends]
    );

    const forecast = useMemo(() =>
        forecastData || [],
        [forecastData]
    );

    const kpiData = useMemo(() => {
        if (!subjects || subjects.length === 0) {
            return {
                totalGrievances: 0,
                avgDisposalDays: 0,
                topCategory: null
            };
        }

        const totalGrievances = subjects.reduce((sum: number, s: any) => sum + (s.count || 0), 0);

        let weightedDisposalSum = 0;
        let totalCountForAvg = 0;

        subjects.forEach((s: any) => {
            const count = s.count || 0;
            const days = s.avgDisposalDays || 0;
            if (days > 0) {
                weightedDisposalSum += count * days;
                totalCountForAvg += count;
            }
        });

        const avgDisposalDays = totalCountForAvg > 0 ? weightedDisposalSum / totalCountForAvg : 0;

        const topCategory = [...subjects].sort((a: any, b: any) => (b.count || 0) - (a.count || 0))[0] || null;

        return {
            totalGrievances,
            avgDisposalDays,
            topCategory: topCategory ? { name: topCategory.subjectCategory, count: topCategory.count } : null
        };
    }, [subjects]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="dashboard-card p-6 max-w-md"
                >
                    <h3 className="text-error-700 dark:text-error-300 font-semibold text-base mb-2">
                        Error Loading Dashboard
                    </h3>
                    <p className="text-error-500 dark:text-error-400 text-sm">{error.message}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-4 lg:p-5 transition-colors duration-300">
            <ContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                data={contextMenu.data}
                filterKey={contextMenu.filterKey}
                filters={mergedFilters}
                onClose={closeContextMenu}
                onDrillThrough={handleDrillThrough}
            />

            {/* Header Section */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-display mb-1">
                        Subject Analysis
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">Deep dive into grievance subject categories and trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <DateRangeFilter />
                </div>
            </div>

            {/* Program Type Filter Bar */}
            <div className="mb-6 rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-sm p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-700 pr-4 py-1.5">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Program
                    </span>
                </div>
                <ProgramTypeFilter
                    activeProgramTypes={activeProgramTypes}
                    onProgramTypeClick={handleLocalProgramTypeClick}
                />
            </div>

            {hasActiveFilters && (
                <div className="mb-4">
                    <ActiveFiltersPane
                        filters={mergedFilters}
                        activeProgramTypes={activeProgramTypes}
                        updateFilter={updateLocalFilter}
                        setActiveProgramTypes={() => { }}
                        handleProgramTypeClick={handleLocalProgramTypeClick}
                        clearAllFilters={clearFilters}
                        clearLocalFiltersOnly={clearLocalFiltersOnly}
                        activeProgramTypes={activeProgramTypes}
                    />
                </div>
            )}

            <StickyMiniActiveFilters
                filters={mergedFilters}
                clearAllFilters={clearFilters}
                updateFilter={updateLocalFilter}
                activeProgramTypes={activeProgramTypes}
                handleProgramTypeClick={handleLocalProgramTypeClick}
            />

            {!loading && dashboardData && (
                <SubjectKPICards
                    totalGrievances={kpiData.totalGrievances}
                    avgDisposalDays={kpiData.avgDisposalDays}
                    programTypes={activeProgramTypes}
                    topCategory={kpiData.topCategory}
                />
            )}

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 size={32} strokeWidth={1.5} className="text-gray-400" />
                    </motion.div>
                </div>
            )}


            {!loading && dashboardData && (
                <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 lg:col-span-7 h-full">
                            <ChartCard
                                title="District Geographical Distribution"
                                downloadCsv={handleDistrictCsv}
                                className="h-full"
                            >
                                <div className="flex-1 min-h-[400px]">
                                    {districts && districts.length > 0 ? (
                                        <div className="h-full w-full">
                                            <DistrictChoroplethMap
                                                data={districts}
                                                onDistrictClick={handleDistrictClick}
                                                onContextMenu={(params) => handleContextMenu(params, 'district')}
                                                selectedDistrict={mergedFilters.district}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <div className="text-center">
                                                <div className="text-6xl mb-4">🗺️</div>
                                                <p className="text-lg">No district data available for selected filters</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ChartCard>
                        </div>

                        <div className="col-span-12 lg:col-span-5 h-full">
                            <ChartCard title="AI Category Analysis" className="h-full">
                                <div className="h-full">
                                    <AICategoryTable
                                        aiCategories={aiCategories}
                                        handleAICategoryClick={handleAICategoryClick}
                                        handleContextMenu={handleContextMenu}
                                        selectedAICategory={mergedFilters.aiCategory}
                                    />
                                </div>
                            </ChartCard>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title="Department and Taluka Breakdown" className="h-full">
                            <DepartmentTalukaChart
                                departments={departments}
                                talukas={talukas}
                                onDepartmentClick={newupdateFilter}
                                onDepartmentClear={() => updateFilter('departmentName', null)}
                                onTalukaClick={handleTalukaClick}
                                onContextMenu={(params, filterKey) => handleContextMenu(params, filterKey)}
                                selectedDepartment={mergedFilters.departmentName}
                                selectedTaluka={mergedFilters.taluka}
                                baseFilters={{
                                    programTypes: mergedFilters.programTypes,
                                    district: mergedFilters.district,
                                    disposeChnl: mergedFilters.disposeChnl,
                                    departmentName: mergedFilters.departmentName,
                                    grievanceStatus: mergedFilters.grievanceStatus,
                                    subStatusName: mergedFilters.subStatusName,
                                    subjectCategory: mergedFilters.subjectCategory,
                                    aiCategory: mergedFilters.aiCategory,
                                    month: mergedFilters.month
                                }}
                            />
                        </ChartCard>

                        <ChartCard title="Subject Table" downloadCsv={handleSubjectCsv} className="h-full">
                            <SubjectTable
                                displayedSubjects={displayedSubjects}
                                paginatedSubjects={paginatedSubjects}
                                showPagination={showPagination}
                                totalSubjects={totalSubjects}
                                totalPages={totalPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                handleSubjectClick={handleSubjectClick}
                                handleContextMenu={handleContextMenu}
                                handleSubjectCsv={handleSubjectCsv}
                                selectedSubject={mergedFilters.subjectCategory}
                                pageSize={pageSize}
                                setPageSize={setPageSize}
                            />
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <ChartCard
                            title="Monthly Trend Analysis with Forecast"
                            downloadCsv={handleForecastCsv}
                            headerControls={
                                <>
                                    {forecastLoading && (
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-lg border border-blue-200 dark:border-blue-700 font-medium flex items-center gap-2">
                                            <Loader2 size={12} className="animate-spin" />
                                            Loading Forecast...
                                        </span>
                                    )}

                                    {forecastAvailable && includeForecast && !mergedFilters.month && !forecastLoading && forecastData.length > 0 && (
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-lg border border-green-200 dark:border-green-700 font-medium">
                                            ✓ Forecast Loaded
                                        </span>
                                    )}

                                    <div className="mx-2">
                                        <ForecastToggle
                                            includeForecast={includeForecast}
                                            setIncludeForecast={setIncludeForecast}
                                            disabled={!!mergedFilters.month}
                                            loading={forecastLoading}
                                        />
                                    </div>
                                </>
                            }
                        >
                            {(historical.length > 0 || monthlyTrends.length > 0) ? (
                                <div className="h-[350px]">
                                    <MonthlyTimelineChart
                                        historical={historical}
                                        forecast={forecast}
                                        forecastLoading={forecastLoading}
                                        onMonthClick={handleMonthClick}
                                        onContextMenu={(params) => handleContextMenu(params, 'month')}
                                        selectedMonth={mergedFilters.month}
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">📊</div>
                                        <p className="text-lg">No monthly trend data available for selected filters</p>
                                        <p className="text-sm mt-2">Try adjusting your filters or date range</p>
                                    </div>
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pb-6">
                        <ChartCard title="Subject Trendline Analysis">
                            <SubjectTrendlineAnalysis
                                increasingTrends={increasingTrends || []}
                                decreasingTrends={decreasingTrends || []}
                                loading={trendsLoading}
                                filters={mergedFilters}
                            />
                        </ChartCard>
                    </div>
                </div>
            )}

            <GlobalFilterButton />
        </div>
    );
}