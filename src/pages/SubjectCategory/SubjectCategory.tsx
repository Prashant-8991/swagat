// //@ts-nocheck
// import { useState, useMemo, useCallback } from 'react';
// import { useFilters } from './hooks/useFilters';
// import { useForecast } from './hooks/useForecast';
// import { useSubjectData } from './hooks/useSubjectData';
// import { useTrends } from './hooks/useTrends';
// import { useContextMenu } from './hooks/useContextMenu';
// import { usePagination } from './hooks/usePagination';
// import { downloadCsv } from './utils/downloadCsv';
// import { convertFilterToDisplay } from './utils/dateHelpers';
// import { useGlobalFilters } from '../../hooks/useGlobalFilters';
// import ContextMenu from '../../components/common/ContextMenu';
// import LoadingSpinner from './components/UI/LoadingSpinner';
// import DownloadCsvButton from '../../components/common/DownloadCsvButton';
// import GlobalFilterButton from '../../components/common/GlobalFilterButton';
// import ProgramTypeFilter from './components/Filters/ProgramTypeFilter';
// import ForecastToggle from './components/Filters/ForecastToggle';
// import ActiveFiltersPane from './components/Filters/ActiveFiltersPane';
// import StickyMiniActiveFilters from './components/Filters/StickyMiniActiveFilters';
// import DateRangeFilter from '../../components/common/DateRangeFilter';
// import DistrictChoroplethMap from './components/Charts/DistrictChoroplethMap';
// import MonthlyTimelineChart from './components/Charts/MonthlyTimelineChart';
// import SubjectTrendlineAnalysis from './components/Charts/SubjectTrendlineAnalysis';
// import DepartmentTalukaChart from './components/Charts/DepartmentTalukaChart';
// import SubjectTable from './components/Subjects/SubjectTable';
// import AICategoryTable from './components/Charts/AICategoryTable';

// const AIContainer = ({ children, title, icon: Icon, action, className = "", noHeader = false }) => (
// <div className={`relative bg-white p-1 rounded-2xl shadow-sm transition-transform duration-300 flex flex-col overflow-hidden group ${className}`}>
// <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
// <div className="absolute inset-0 rounded-2xl p-[1px] bg-white mask-linear-gradient" />
// <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col z-10">
// {!noHeader && (
// <div className="flex items-center justify-between mb-6">
// <h2 className="text-lg font-bold bg-clip-text text-black flex items-center gap-2">
// {Icon && <Icon className="w-5 h-5 text-teal-500" />}
// {title}
// </h2>
// {action}
// </div>
// )}
// {children}
// </div>
// </div>
// );

// export default function SubjectCategory() {
// const { filters: globalFilterValues, hasGlobalFilters } = useGlobalFilters();

// const {
// filters: localFilters,
// updateFilter: updateLocalFilter,
// handleProgramTypeClick: handleLocalProgramTypeClick,
// handleDistrictClick: handleLocalDistrictClick,
// handleTalukaClick: handleLocalTalukaClick,
// handleSubjectClick: handleLocalSubjectClick,
// handleAICategoryClick: handleLocalAICategoryClick,
// handleMonthClick: handleLocalMonthClick,
// handleGrievanceStatusClick: handleLocalGrievanceStatusClick,
// handleDisposeChannelClick: handleLocalDisposeChannelClick,
// clearFilters: clearLocalFilters,
// hasActiveFilters: hasLocalFilters,
// handleDepartmentClick: handleLocalDepartmentClick,
// newupdateFilter
// } = useFilters();

// const mergedFilters = useMemo(() => ({
// ...globalFilterValues,
// ...Object.fromEntries(
// Object.entries(localFilters).filter(([_, value]) => value !== null)
// )
// }), [globalFilterValues, localFilters]);

// const hasActiveFilters = hasGlobalFilters || hasLocalFilters;

// // Use handlers directly without unnecessary useCallback wrappers
// const handleProgramTypeClick = handleLocalProgramTypeClick;
// const handleDistrictClick = handleLocalDistrictClick;
// const handleTalukaClick = handleLocalTalukaClick;
// const handleSubjectClick = handleLocalSubjectClick;
// const handleAICategoryClick = handleLocalAICategoryClick;
// const handleMonthClick = handleLocalMonthClick;
// const handleGrievanceStatusClick = handleLocalGrievanceStatusClick;
// const handleDisposeChannelClick = handleLocalDisposeChannelClick;
// const clearFilters = clearLocalFilters;
// const handleDepartmentClick = handleLocalDepartmentClick;
// const updateFilter = updateLocalFilter;

// const {
// includeForecast,
// setIncludeForecast,
// forecastLoading,
// forecastData
// } = useForecast(mergedFilters);

// const {
// dashboardData,
// allSubjects,
// loading,
// error,
// forecastAvailable
// } = useSubjectData(mergedFilters);

// const {
// increasingTrends,
// decreasingTrends,
// trendsLoading
// } = useTrends(mergedFilters);

// const {
// contextMenu,
// handleContextMenu,
// closeContextMenu,
// handleDrillThrough
// } = useContextMenu(mergedFilters);

// const [pageSize, setPageSize] = useState(5);

// const [activeDepartmentOverlay, setActiveDepartmentOverlay] = useState(null);

// const {
// searchQuery,
// setSearchQuery,
// currentPage,
// setCurrentPage,
// displayedSubjects,
// paginatedSubjects,
// showPagination,
// totalPages,
// totalSubjects
// } = usePagination(dashboardData?.subjects, allSubjects, pageSize);

// const handleForecastCsv = useCallback(() => {
// const monthlyTrends = dashboardData?.monthlyTrends || [];
// const historicalRows = (monthlyTrends.filter((t) => !t.isForecast) || []).map((d) => ({
// source: 'Historical',
// monthDisplay: d?.monthDisplay ?? '',
// count: d?.count ?? '',
// percentage: d?.percentage ?? '',
// forecastLower: d?.forecastLower ?? '',
// forecastUpper: d?.forecastUpper ?? ''
// }));

// const forecastRows = (forecastData || []).map((d) => ({
// source: 'Forecast',
// monthDisplay: d?.monthDisplay ?? '',
// count: d?.count ?? '',
// percentage: d?.percentage ?? '',
// forecastLower: d?.forecastLower ?? '',
// forecastUpper: d?.forecastUpper ?? ''
// }));

// const columns = [
// { key: 'source', label: 'Source' },
// { key: 'monthDisplay', label: 'Month' },
// { key: 'count', label: 'Count' },
// { key: 'percentage', label: 'Percentage' },
// { key: 'forecastLower', label: '95% Lower' },
// { key: 'forecastUpper', label: '95% Upper' }
// ];

// downloadCsv({
// data: [...historicalRows, ...forecastRows],
// columns,
// filename: 'monthly_trends.csv'
// });
// }, [dashboardData?.monthlyTrends, forecastData]);

// const handleDistrictCsv = useCallback(() => {
// const columns = [
// { key: 'district', label: 'District' },
// { key: 'count', label: 'Count' },
// { key: 'percentage', label: 'Percentage' }
// ];
// downloadCsv({
// data: dashboardData?.districts || [],
// columns,
// filename: 'districts.csv'
// });
// }, [dashboardData?.districts]);

// const handleTalukaCsv = useCallback(() => {
// const columns = [
// { key: 'taluka', label: 'Taluka' },
// { key: 'district', label: 'District' },
// { key: 'count', label: 'Count' },
// { key: 'percentage', label: 'Percentage' }
// ];
// downloadCsv({
// data: dashboardData?.talukas || [],
// columns,
// filename: 'talukas.csv'
// });
// }, [dashboardData?.talukas]);

// const handleSubjectCsv = useCallback(() => {
// const columns = [
// { key: 'subjectCategory', label: 'Subject Category' },
// { key: 'count', label: 'Count' },
// { key: 'avgDisposalDays', label: 'Avg Disposal Days' },
// { key: 'percentage', label: 'Percentage' }
// ];
// downloadCsv({
// data: allSubjects ?? displayedSubjects,
// columns,
// filename: 'subject_categories.csv'
// });
// }, [allSubjects, displayedSubjects]);

// const { districts, talukas, subjects, aiCategories, monthlyTrends, departments } = useMemo(() => {
// if (!dashboardData) {
// return {
// districts: [],
// talukas: [],
// subjects: [],
// aiCategories: [],
// monthlyTrends: [],
// departments: []
// };
// }
// return {
// districts: dashboardData.districts || [],
// talukas: dashboardData.talukas || [],
// subjects: dashboardData.subjects || [],
// aiCategories: dashboardData.aiCategories || [],
// monthlyTrends: dashboardData.monthlyTrends || [],
// departments: dashboardData.departments || []
// };
// }, [dashboardData]);

// const historical = useMemo(() =>
// monthlyTrends?.filter(t => !t.isForecast) || [],
// [monthlyTrends]
// );

// const forecast = useMemo(() =>
// forecastData || [],
// [forecastData]
// );

// if (error) {
// console.error('Dashboard error:', error);

// }

// if (loading && !dashboardData) {
// return <LoadingSpinner />;
// }

// const hasData = dashboardData && (
// districts.length > 0 ||
// talukas.length > 0 ||
// subjects.length > 0 ||
// aiCategories.length > 0 ||
// monthlyTrends.length > 0
// );

// return (
// <div className="max-h-[90vh] bg-yellow-600 scroll-auto flex flex-col gap-2 from-gray-50 to-teal-50 dark:from-gray-900 dark:to-teal-950 p-4">
// <div >
// <ContextMenu
// visible={contextMenu.visible}
// x={contextMenu.x}
// y={contextMenu.y}
// data={contextMenu.data}
// filterKey={contextMenu.filterKey}
// filters={mergedFilters}
// onClose={closeContextMenu}
// onDrillThrough={handleDrillThrough}
// />
// </div>


// <div className="max-w-[1800px] mx-auto space-y-4">
// {error && (
// <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
// <div className="flex items-center gap-3">
// <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
// <div>
// <h3 className="text-red-800 dark:text-red-300 font-semibold">Data Loading Error</h3>
// <p className="text-red-600 dark:text-red-400 text-sm">{error.message}</p>
// </div>
// </div>
// </div>
// )}

// {!loading && !hasData && (
// <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
// <div className="text-6xl mb-4">📊</div>
// <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold text-lg mb-2">No Data Available</h3>
// <p className="text-yellow-600 dark:text-yellow-400">Try adjusting your filters to see data.</p>
// </div>
// )}

// <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">{hasActiveFilters && (
// <button
// onClick={clearFilters}
// className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium transition-all border border-red-200 dark:border-red-800 shadow-sm active:scale-95"
// >
// <span>✕</span>
// <span>Clear Filters</span>
// </button>
// )}
// </div>

// <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
// <div className="flex flex-wrap items-center gap-3">
// <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
// Program Type:
// </span>
// {['GS', 'TS', 'DS', 'LF', 'RLF', 'WTC'].map((type) => {
// const colorMap = {
// 'GS': 'from-blue-600 to-blue-700',
// 'TS': 'from-green-600 to-green-700',
// 'DS': 'from-teal-600 to-teal-700',
// 'LF': 'from-orange-600 to-orange-700',
// 'RLF': 'from-red-600 to-red-700',
// 'WTC': 'from-pink-600 to-pink-700'
// };
// const isActive = (mergedFilters.programTypes || []).includes(type);
// return (
// <button
// key={type}
// onClick={() => handleProgramTypeClick(type)}
// className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${isActive
// ? `bg-gradient-to-r ${colorMap[type]} text-white shadow-sm`
// : 'bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 border border-gray-300 dark:border-gray-700'
// }`}
// >
// {type}
// </button>
// );
// })}
// </div>
// <DateRangeFilter />
// </div>

// <ProgramTypeFilter
// activeProgramTypes={mergedFilters.programTypes || []}
// onProgramTypeClick={handleProgramTypeClick}
// selectedDistrict={mergedFilters.district}
// onDistrictClick={handleDistrictClick}
// selectedDepartment={mergedFilters.departmentName}
// onDepartmentClick={handleDepartmentClick}
// selectedTaluka={mergedFilters.taluka}
// onTalukaClick={handleTalukaClick}
// selectedAICategory={mergedFilters.aiCategory}
// onAICategoryClick={handleAICategoryClick}
// selectedGrievanceStatus={mergedFilters.grievanceStatus}
// onGrievanceStatusClick={handleGrievanceStatusClick}
// selectedDisposeChannel={mergedFilters.disposeChnl}
// onDisposeChannelClick={handleDisposeChannelClick}
// hasActiveFilters={hasActiveFilters}
// onClearAllFilters={clearFilters}
// />

// {hasActiveFilters && (
// <ActiveFiltersPane
// filters={mergedFilters}
// updateFilter={updateFilter}
// handleProgramTypeClick={handleProgramTypeClick}
// convertFilterToDisplay={convertFilterToDisplay}
// />
// )}

// <StickyMiniActiveFilters
// filters={mergedFilters}
// clearFilters={clearFilters}
// updateFilter={updateFilter}
// convertFilterToDisplay={convertFilterToDisplay}
// />

// <div className="grid grid-cols-12 gap-4">
// <div className="col-span-12 lg:col-span-7 h-full">
// <AIContainer
// title="District Geographical Distribution"
// action={<DownloadCsvButton onClick={handleDistrictCsv} />}
// className="h-full"
// >
// <div className="flex-1 min-h-[400px]">
// {districts && districts.length > 0 ? (
// <div className="h-full w-full">
// <DistrictChoroplethMap
// data={districts}
// onDistrictClick={handleDistrictClick}
// onContextMenu={(params) => handleContextMenu(params, 'district')}
// selectedDistrict={mergedFilters.district}
// />
// </div>
// ) : (
// <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
// <div className="text-center">
// <div className="text-6xl mb-4">🗺️</div>
// <p className="text-lg">No district data available for selected filters</p>
// </div>
// </div>
// )}
// </div>
// </AIContainer>
// </div>

// <div className="col-span-12 lg:col-span-5 h-full">
// <div className="h-full">
// <AICategoryTable
// aiCategories={aiCategories}
// handleAICategoryClick={handleAICategoryClick}
// handleContextMenu={handleContextMenu}
// selectedAICategory={mergedFilters.aiCategory}
// />
// </div>
// </div>
// </div>

// <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

// <AIContainer
// title="Department and Taluka Breakdown"
// className="relative"
// >
// <DepartmentTalukaChart
// departments={departments}
// talukas={talukas}
// onDepartmentClick={newupdateFilter}
// onDepartmentClear={() => updateFilter('departmentName', null)}
// onTalukaClick={handleTalukaClick}
// onContextMenu={(params, filterKey) => handleContextMenu(params, filterKey)}
// selectedDepartment={mergedFilters.departmentName}
// selectedTaluka={mergedFilters.taluka}
// baseFilters={{
// programTypes: mergedFilters.programTypes,
// district: mergedFilters.district,
// disposeChnl: mergedFilters.disposeChnl,
// departmentName: mergedFilters.departmentName,
// grievanceStatus: mergedFilters.grievanceStatus,
// subStatusName: mergedFilters.subStatusName,
// subjectCategory: mergedFilters.subjectCategory,
// aiCategory: mergedFilters.aiCategory,
// month: mergedFilters.month
// }}
// />
// </AIContainer>

// <SubjectTable
// displayedSubjects={displayedSubjects}
// paginatedSubjects={paginatedSubjects}
// showPagination={showPagination}
// totalSubjects={totalSubjects}
// totalPages={totalPages}
// currentPage={currentPage}
// setCurrentPage={setCurrentPage}
// searchQuery={searchQuery}
// setSearchQuery={setSearchQuery}
// handleSubjectClick={handleSubjectClick}
// handleContextMenu={handleContextMenu}
// handleSubjectCsv={handleSubjectCsv}
// selectedSubject={mergedFilters.subjectCategory}
// pageSize={pageSize}
// setPageSize={setPageSize}
// />
// </div >

// <div className="grid grid-cols-1 gap-4 mb-3">
// <div
// className="h-[450px] rounded-3xl p-1 shadow-2xl transition-all duration-500 
// shadow-orange-500/50-orange-500/80 
// bg-white/80 backdrop-blur-sm dark:bg-gray-800/40"
// >
// <AIContainer
// title="Monthly Trend Analysis with 2-Month Forecast"
// action={
// <div className="flex items-center gap-3">
// {forecastLoading && (
// <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-lg border border-blue-200 dark:border-blue-700 font-medium flex items-center gap-2">
// <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
// Loading Forecast...
// </span>
// )}

// {forecastAvailable && includeForecast && !mergedFilters.month && !forecastLoading && forecastData.length > 0 && (
// <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-lg border border-green-200 dark:border-green-700 font-medium">
// ✓ Forecast Loaded
// </span>
// )}
// <DownloadCsvButton onClick={handleForecastCsv} />
// </div>
// }
// className="h-full"
// >
// <ForecastToggle
// includeForecast={includeForecast}
// setIncludeForecast={setIncludeForecast}
// disabled={!!mergedFilters.month}
// loading={forecastLoading}
// />
// {(historical.length > 0 || monthlyTrends.length > 0) ? (
// <div className="h-[350px]">
// <MonthlyTimelineChart
// historical={historical}
// forecast={forecast}
// forecastLoading={forecastLoading}
// onMonthClick={handleMonthClick}
// onContextMenu={(params) => handleContextMenu(params, 'month')}
// selectedMonth={mergedFilters.month}
// />
// </div>
// ) : (
// <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
// <div className="text-center">
// <div className="text-6xl mb-4">📊</div>
// <p className="text-lg">No monthly trend data available for selected filters</p>
// <p className="text-sm mt-2">Try adjusting your filters or date range</p>
// </div>
// </div>
// )}
// </AIContainer>
// </div>
// </div>

// <div className="grid grid-cols-1 gap-4 mb-6">
// <div
// className="h-[450px] rounded-3xl p-1 shadow-2xl transition-all duration-500 
// shadow-orange-500/50-orange-500/80 
// bg-white/80 backdrop-blur-sm dark:bg-gray-800/40"
// >
// <SubjectTrendlineAnalysis
// increasingTrends={increasingTrends || []}
// decreasingTrends={decreasingTrends || []}
// loading={trendsLoading}
// filters={mergedFilters}
// />
// </div>
// </div>
// </div >
// <GlobalFilterButton />
// </div >
// );
// }




















































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
import ContextMenu from '../../components/common/ContextMenu';
import LoadingSpinner from './components/UI/LoadingSpinner';
import DownloadCsvButton from '../../components/common/DownloadCsvButton';
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

const AIContainer = ({ children, title, icon: Icon, action, className = "", noHeader = false }) => (
 <div className={`relative bg-white p-1 rounded-2xl shadow-sm transition-transform duration-300 flex flex-col overflow-hidden group ${className}`}>
 <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
 <div className="absolute inset-0 rounded-2xl p-[1px] bg-white mask-linear-gradient" />
 <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col z-10">
 {!noHeader && (
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-lg font-bold bg-clip-text text-black flex items-center gap-2">
 {Icon && <Icon className="w-5 h-5 text-teal-500" />}
 {title}
 </h2>
 {action}
 </div>
 )}
 {children}
 </div>
 </div>
);

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
 clearFilters: clearLocalFilters,
 hasActiveFilters: hasLocalFilters,
 handleDepartmentClick: handleLocalDepartmentClick,
 newupdateFilter
 } = useFilters();

 const mergedFilters = useMemo(() => ({
 ...globalFilterValues,
 ...Object.fromEntries(
 Object.entries(localFilters).filter(([_, value]) => value !== null)
 )
 }), [globalFilterValues, localFilters]);

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
 const clearFilters = clearLocalFilters;
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

 if (error) {
 console.error('Dashboard error:', error);

 }

 if (loading && !dashboardData) {
 return <LoadingSpinner />;
 }

 const hasData = dashboardData && (
 districts.length > 0 ||
 talukas.length > 0 ||
 subjects.length > 0 ||
 aiCategories.length > 0 ||
 monthlyTrends.length > 0
 );

 return (
 <div className="max-h-[95vh] scroll-auto flex flex-col gap-2 from-gray-50 to-teal-50 dark:from-gray-900 dark:to-teal-950 p-4">
 <div >
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
 </div>


 <div className="max-w-[1800px] mx-auto space-y-4">
 {error && (
 <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
 <div className="flex items-center gap-3">
 <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
 <div>
 <h3 className="text-red-800 dark:text-red-300 font-semibold">Data Loading Error</h3>
 <p className="text-red-600 dark:text-red-400 text-sm">{error.message}</p>
 </div>
 </div>
 </div>
 )}

 {!loading && !hasData && (
 <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center">
 <div className="text-6xl mb-4">📊</div>
 <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold text-lg mb-2">No Data Available</h3>
 <p className="text-yellow-600 dark:text-yellow-400">Try adjusting your filters to see data.</p>
 </div>
 )}

 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">{hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium transition-all border border-red-200 dark:border-red-800 shadow-sm active:scale-95"
 >
 <span>✕</span>
 <span>Clear Filters</span>
 </button>
 )}
 </div>

 <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
 <div className="flex flex-wrap items-center gap-3">
 <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mr-1">
 Program Type:
 </span>
 {['GS', 'TS', 'DS', 'LF', 'RLF', 'WTC'].map((type) => {
 const colorMap = {
 'GS': 'from-sky-600 to-sky-700',
 'TS': 'from-emerald-600 to-emerald-700',
 'DS': 'from-teal-600 to-teal-700',
 'LF': 'from-orange-500 to-orange-600',
 'RLF': 'from-red-500 to-red-600',
 'WTC': 'from-rose-500 to-rose-600'
 };
 const isActive = (mergedFilters.programTypes || []).includes(type);
 return (
 <button
 key={type}
 onClick={() => handleProgramTypeClick(type)}
 className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
 ? `bg-gradient-to-r ${colorMap[type]} text-white shadow-sm`
 : 'bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700'
 }`}
 >
 {type}
 </button>
 );
 })}
 </div>
 <DateRangeFilter />
 </div>

 <ProgramTypeFilter
 activeProgramTypes={mergedFilters.programTypes || []}
 onProgramTypeClick={handleProgramTypeClick}
 selectedDistrict={mergedFilters.district}
 onDistrictClick={handleDistrictClick}
 selectedDepartment={mergedFilters.departmentName}
 onDepartmentClick={handleDepartmentClick}
 selectedTaluka={mergedFilters.taluka}
 onTalukaClick={handleTalukaClick}
 selectedAICategory={mergedFilters.aiCategory}
 onAICategoryClick={handleAICategoryClick}
 selectedGrievanceStatus={mergedFilters.grievanceStatus}
 onGrievanceStatusClick={handleGrievanceStatusClick}
 selectedDisposeChannel={mergedFilters.disposeChnl}
 onDisposeChannelClick={handleDisposeChannelClick}
 hasActiveFilters={hasActiveFilters}
 onClearAllFilters={clearFilters}
 />

 {hasActiveFilters && (
 <ActiveFiltersPane
 filters={mergedFilters}
 updateFilter={updateFilter}
 handleProgramTypeClick={handleProgramTypeClick}
 convertFilterToDisplay={convertFilterToDisplay}
 />
 )}

 <StickyMiniActiveFilters
 filters={mergedFilters}
 clearFilters={clearFilters}
 updateFilter={updateFilter}
 convertFilterToDisplay={convertFilterToDisplay}
 />

 <div className="grid grid-cols-12 gap-4">
 <div className="col-span-12 lg:col-span-7 h-full">
 <AIContainer
 title="District Geographical Distribution"
 action={<DownloadCsvButton onClick={handleDistrictCsv} />}
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
 </AIContainer>
 </div>

 <div className="col-span-12 lg:col-span-5 h-full">
 <div className="h-full">
 <AICategoryTable
 aiCategories={aiCategories}
 handleAICategoryClick={handleAICategoryClick}
 handleContextMenu={handleContextMenu}
 selectedAICategory={mergedFilters.aiCategory}
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

 <AIContainer
 title="Department and Taluka Breakdown"
 className="relative"
 >
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
 </AIContainer>

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
 </div >

 <div className="grid grid-cols-1 gap-4 mb-3">
 <div
 className="h-[450px] rounded-3xl p-1 shadow-2xl transition-all duration-500 
 shadow-orange-500/50-orange-500/80 
 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40"
 >
 <AIContainer
 title="Monthly Trend Analysis with 2-Month Forecast"
 action={
 <div className="flex items-center gap-3">
 {forecastLoading && (
 <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-lg border border-blue-200 dark:border-blue-700 font-medium flex items-center gap-2">
 <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
 Loading Forecast...
 </span>
 )}

 {forecastAvailable && includeForecast && !mergedFilters.month && !forecastLoading && forecastData.length > 0 && (
 <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-lg border border-green-200 dark:border-green-700 font-medium">
 ✓ Forecast Loaded
 </span>
 )}
 <DownloadCsvButton onClick={handleForecastCsv} />
 </div>
 }
 className="h-full"
 >
 <ForecastToggle
 includeForecast={includeForecast}
 setIncludeForecast={setIncludeForecast}
 disabled={!!mergedFilters.month}
 loading={forecastLoading}
 />
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
 </AIContainer>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-4 mb-6">
 <div
 className="h-[450px] rounded-3xl p-1 shadow-2xl transition-all duration-500 
 shadow-orange-500/50-orange-500/80 
 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40"
 >
 <SubjectTrendlineAnalysis
 increasingTrends={increasingTrends || []}
 decreasingTrends={decreasingTrends || []}
 loading={trendsLoading}
 filters={mergedFilters}
 />
 </div>
 </div>
 </div >
 <GlobalFilterButton />
 </div >
 );
}