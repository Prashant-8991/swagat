// @ts-nocheck
import { useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
 GridComponent,
 TooltipComponent,
 LegendComponent,
 DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
 useAppDispatch,
 useAppSelector
} from '../../redux/hooks';
import {
 fetchDrillThroughData,
 setFiltersFromDrillThrough,
 updateFilter,
 clearFilters,
 setCurrentPage,
 setSearchQuery,
 setInitialized,
 resetDrillThrough,
 DrillThroughFilters
} from '../../redux/features/drillthroughSlice';
import {
 getDrillThroughFilters
} from '../../utils/drillthrough';
import { PASTEL_COLORS } from '../../utils/colorPalette';
import DistrictChoroplethMap from '../SubjectCategory/components/Charts/DistrictChoroplethMap';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';

echarts.use([
 BarChart,
 GridComponent,
 TooltipComponent,
 LegendComponent,
 DataZoomComponent,
 CanvasRenderer
]);

function downloadCSV(data: any[], filename: string, headers: string[]) {
 const csvContent = [
 headers.join(','),
 ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 if (link.download !== undefined) {
 const url = URL.createObjectURL(blob);
 link.setAttribute('href', url);
 link.setAttribute('download', filename);
 link.style.visibility = 'hidden';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 }
}

const DownloadCsvButton = memo(({ onClick }: { onClick: () => void }) => {
 return (
 <button
 onClick={onClick}
 title="Download CSV"
 className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
 >
 <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="text-slate-600 dark:text-slate-400">
 <path d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 </button>
 );
});

export default function DrillThroughComponent() {
 const dispatch = useAppDispatch();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
 const chartRef = useRef<any>(null);
 const abortControllerRef = useRef<AbortController | null>(null);
 const prevSearchParamsRef = useRef<string>('');

 const { filters: globalFilterValues } = useGlobalFilters();

 const {
 data,
 filters,
 currentPage,
 pageSize,
 searchQuery,
 loading,
 error,
 sourcePage,
 isInitialized
 } = useAppSelector((state) => state.drillthrough);

 const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

 useEffect(() => {
 if (Object.keys(globalFilterValues).length > 0) {
 const globalFilterUpdates: Partial<DrillThroughFilters> = {};

 if (globalFilterValues.programTypes && Array.isArray(globalFilterValues.programTypes)) {
 globalFilterUpdates.programTypes = globalFilterValues.programTypes;
 }
 if (globalFilterValues.district) {
 globalFilterUpdates.district = globalFilterValues.district;
 }
 if (globalFilterValues.taluka) {
 globalFilterUpdates.taluka = Array.isArray(globalFilterValues.taluka)
 ? globalFilterValues.taluka[0]
 : globalFilterValues.taluka;
 }
 if (globalFilterValues.departmentName) {
 globalFilterUpdates.departmentName = globalFilterValues.departmentName;
 }
 if (globalFilterValues.grievanceStatus) {
 globalFilterUpdates.grievanceStatus = globalFilterValues.grievanceStatus;
 }
 if (globalFilterValues.disposeChnl) {
 globalFilterUpdates.disposeChannel = globalFilterValues.disposeChnl;
 }
 if (Object.keys(globalFilterUpdates).length > 0) {
 dispatch(setFiltersFromDrillThrough({
 filters: globalFilterUpdates,
 sourcePage: sourcePage
 }));
 }
 }
 }, [globalFilterValues, dispatch, sourcePage]);

 useEffect(() => {
 const urlFilters = getDrillThroughFilters();
 const source = searchParams.get('source');

 const currentParamsString = searchParams.toString();
 if (!isInitialized || currentParamsString !== prevSearchParamsRef.current) {
 dispatch(setFiltersFromDrillThrough({
 filters: urlFilters as Partial<DrillThroughFilters>,
 sourcePage: source || undefined
 }));
 prevSearchParamsRef.current = currentParamsString;
 }
 }, [searchParams, dispatch, isInitialized]);

 useEffect(() => {
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }

 const abortController = new AbortController();
 abortControllerRef.current = abortController;

 const promise = dispatch(fetchDrillThroughData());

 return () => {
 promise.abort();
 abortController.abort();
 };
 }, [dispatch, filters, currentPage, pageSize, searchQuery, fromDate, toDate]);

 const handleFilterUpdate = useCallback((key: string, value: any) => {
 dispatch(updateFilter({ key: key as any, value }));
 }, [dispatch]);

 const handleClearFilters = useCallback(() => {
 dispatch(clearFilters());
 }, [dispatch]);

 const handlePageChange = useCallback((page: number) => {
 dispatch(setCurrentPage(page));
 }, [dispatch]);

 const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
 dispatch(setSearchQuery(e.target.value));
 }, [dispatch]);

 const handleTalukaClick = useCallback((taluka: string) => {
 dispatch(updateFilter({
 key: 'taluka',
 value: filters.taluka === taluka ? null : taluka
 }));
 }, [dispatch, filters.taluka]);

 const handleDisposeChannelClick = useCallback((channel: string) => {
 dispatch(updateFilter({
 key: 'disposeChannel',
 value: filters.disposeChannel === channel ? null : channel
 }));
 }, [dispatch, filters.disposeChannel]);

 const handleDistrictClick = useCallback((district: string) => {
 dispatch(updateFilter({
 key: 'district',
 value: filters.district === district ? null : district
 }));
 }, [dispatch, filters.district]);

 const handleDownloadChart = useCallback(() => {
 if (data?.talukaDisposeChannelChart) {
 const headers = ['taluka', 'disposeChannel', 'count'];
 downloadCSV(data.talukaDisposeChannelChart, 'taluka_grievances.csv', headers);
 }
 }, [data]);

 const handleDownloadTable = useCallback(() => {
 if (data?.subjectTable?.data) {
 const headers = [
 'inwardNo',
 'subject',
 'avgDisposalDays',
 'firstDepartmentName',
 'firstSubStatusName',
 'firstForwardedToDesignation',
 'firstQuestionDistrict',
 'firstSubjectCategory'
 ];
 downloadCSV(data.subjectTable.data, 'subject_details.csv', headers);
 }
 }, [data]);

 if (error) {
 return (
 <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
 <p className="font-semibold">Error loading data</p>
 <p className="text-sm mt-1">{error}</p>
 <button
 onClick={() => window.location.reload()}
 className="mt-4 px-4 py-2 bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-100 rounded-lg text-sm font-medium hover:bg-rose-200 dark:hover:bg-rose-700 transition-colors"
 >
 Retry
 </button>
 </div>
 );
 }

 const { kpi, talukaDisposeChannelChart, subjectTable, districts } = data || {};
 const chartData = (talukaDisposeChannelChart || []).filter((item: any) => item.taluka !== null && item.taluka !== undefined && item.taluka !== '');
 const filteredSubjects = subjectTable?.data || [];

 return (
 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
 Drill-Through Analysis
 </h1>
 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
 Detailed breakdown of grievance data
 </p>
 </div>
 <button onClick={() => window.history.back()} className='p-2 bg-gray-600 text-white rounded-full'>Back</button>
 </div>

 <FilterBadgeContainer filters={filters} onClear={handleClearFilters} fromDate={fromDate} toDate={toDate} />
 <KPICards kpi={kpi} />

 <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-200/40 dark:border-slate-700/30 shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
 <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></span>
 District Distribution
 </h3>
 </div>
 <div className="h-88">
 {districts && districts.length > 0 ? (
 <DistrictChoroplethMap
 data={districts}
 onDistrictClick={handleDistrictClick}
 onContextMenu={() => { }}
 selectedDistrict={filters.district}
 />
 ) : (
 <EmptyState message="No district data available" />
 )}
 </div>
 </div>

 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-200/40 dark:border-slate-700/30 shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
 <span className="w-1 h-6 bg-gradient-to-b from-teal-500 to-teal-700 rounded-full"></span>
 Taluka Grievances by Disposal Channel
 </h3>
 <DownloadCsvButton onClick={handleDownloadChart} />
 </div>
 <div className="h-80">
 {chartData.length > 0 ? (
 <TalukaStackedBarChart
 data={chartData}
 chartRef={chartRef}
 onTalukaClick={handleTalukaClick}
 onDisposeChannelClick={handleDisposeChannelClick}
 selectedTaluka={filters.taluka}
 selectedChannel={filters.disposeChannel}
 />
 ) : (
 <EmptyState message="No chart data available" />
 )}
 </div>
 </div>
 </div>
 <SubjectDetailsTable
 subjects={filteredSubjects}
 searchQuery={searchQuery}
 onSearchChange={handleSearchChange}
 onDownload={handleDownloadTable}
 subjectTable={subjectTable}
 currentPage={currentPage}
 pageSize={pageSize}
 onPageChange={handlePageChange}
 />
 </div>
 );
}

const FilterBadgeContainer = memo(({ filters, onClear, fromDate, toDate }: any) => (
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/40 dark:border-slate-700/30 shadow-sm">
 <div className="flex flex-wrap items-center gap-3">
 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Applied Filters:</span>
 {filters.district && <FilterBadge label="District" value={filters.district} color="blue" />}
 {filters.taluka && <FilterBadge label="Taluka" value={filters.taluka} color="purple" />}
 {filters.departmentName && <FilterBadge label="Department" value={filters.departmentName} color="emerald" />}
 {filters.disposeChannel && <FilterBadge label="Dispose Channel" value={filters.disposeChannel} color="amber" />}
 {filters.subjectCategory && <FilterBadge label="Subject" value={filters.subjectCategory} color="rose" />}
 {filters.grievanceStatus && <FilterBadge label="Grievance Status" value={filters.grievanceStatus} color="cyan" />}
 {filters.programTypes && filters.programTypes.length > 0 && (
 filters.programTypes.map((type: string) => (
 <FilterBadge key={type} label="Program" value={type} color="indigo" />
 ))
 )}
 {filters.escalatedByCitizen && <FilterBadge label="Escalated" value={filters.escalatedByCitizen} color="teal" />}
 {filters.IsReviewed !== null && <FilterBadge label="Reviewed" value={filters.IsReviewed} color="teal" />}
 {filters.aiCategory && <FilterBadge label="AI Category" value={filters.aiCategory} color="fuchsia" />}
 {filters.levelNo !== null && <FilterBadge label="Level" value={`Level ${filters.levelNo}`} color="cyan" />}
 {filters.month && <FilterBadge label="Month" value={filters.month} color="violet" />}
 {filters.subject && <FilterBadge label="Subject Name" value={filters.subject} color="fuchsia" />}
 {filters.forwardedToDesignation && <FilterBadge label="Designation" value={filters.forwardedToDesignation} color="sky" />}
 {filters.grievanceReviewType && <FilterBadge label="Review Type" value={filters.grievanceReviewType} color="lime" />}
 {filters.subStatusName && <FilterBadge label="Sub Status" value={filters.subStatusName} color="orange" />}
 {fromDate && <FilterBadge label="From Date" value={fromDate} color="emerald" />}
 {toDate && <FilterBadge label="To Date" value={toDate} color="rose" />}
 <button
 onClick={onClear}
 className="ml-auto px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-semibold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-all"
 >
 ✕ Clear All
 </button>
 </div>
 </div>
));

const KPICards = memo(({ kpi }: any) => (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="group relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-200/40 dark:border-slate-700/30 shadow-sm transition-all duration-300">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Grievances</p>
 <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
 {kpi?.totalCount.toLocaleString()}
 </h3>
 </div>
 </div>
 </div>

 <div className="group relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-200/40 dark:border-slate-700/30 shadow-sm transition-all duration-300">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Disposed at Level 1</p>
 <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
 {kpi?.level1DisposedCount.toLocaleString()}
 </h3>
 <div className="mt-2 inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
 {kpi?.level1DisposalPct.toFixed(1)}% of total
 </div>
 </div>
 </div>
 </div>
 </div>
));

const SubjectDetailsTable = memo(({
 subjects,
 searchQuery,
 onSearchChange,
 onDownload,
 subjectTable,
 currentPage,
 pageSize,
 onPageChange
}: any) => (
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-200/40 dark:border-slate-700/30 shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
 <span className="w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full"></span>
 Subject Details
 </h3>
 <div className="flex items-center gap-3">
 <span className="text-sm text-slate-500 dark:text-slate-400">{subjects.length} results</span>
 <DownloadCsvButton onClick={onDownload} />
 </div>
 </div>

 <div className="mb-4">
 <input
 type="text"
 value={searchQuery}
 onChange={onSearchChange}
 placeholder="Search subjects, departments, or status..."
 className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500"
 />
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-slate-50 dark:bg-slate-700/50 border-b-2 border-slate-200 dark:border-slate-600">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Inward No.</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</th>
 <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">Avg Days</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Department</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Status</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Designation</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">District</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">Category</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
 {subjects.length > 0 ? (
 subjects.map((subject: any, idx: number) => (
 <SubjectRow key={`${subject.subject}-${idx}`} subject={subject} />
 ))
 ) : (
 <tr>
 <td colSpan={8} className="px-4 py-8 text-center">
 <EmptyState
 message={searchQuery ? `No results for "${searchQuery}"` : "No subjects found"}
 />
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {subjectTable && subjectTable.totalCount > pageSize && (
 <Pagination
 currentPage={currentPage}
 totalCount={subjectTable.totalCount}
 pageSize={pageSize}
 hasNextPage={subjectTable.hasNextPage}
 hasPreviousPage={subjectTable.hasPreviousPage}
 onPageChange={onPageChange}
 />
 )}
 </div>
));

const SubjectRow = memo(({ subject }: any) => (
 <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
 <td className="px-4 py-3 text-xs text-slate-900 dark:text-slate-100 font-medium max-w-xs truncate" title={subject.inwardNo}>
 {subject.inwardNo}
 </td>
 <td className="px-4 py-3 text-xs text-slate-900 dark:text-slate-100 font-medium max-w-xs truncate" title={subject.subject}>
 {subject.subject}
 </td>
 <td className="px-4 py-3 text-xs text-right text-slate-700 dark:text-slate-300 font-bold">
 {subject.avgDisposalDays?.toFixed(1) || 'N/A'}
 </td>
 <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate" title={subject.firstDepartmentName || ''}>
 {subject.firstDepartmentName || 'N/A'}
 </td>
 <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate" title={subject.firstSubStatusName || ''}>
 {subject.firstSubStatusName || 'N/A'}
 </td>
 <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate" title={subject.firstForwardedToDesignation || ''}>
 {subject.firstForwardedToDesignation || 'N/A'}
 </td>
 <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
 {subject.firstQuestionDistrict || 'N/A'}
 </td>
 <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate" title={subject.firstSubjectCategory || ''}>
 {subject.firstSubjectCategory || 'N/A'}
 </td>
 </tr>
));

const Pagination = memo(({ currentPage, totalCount, pageSize, hasNextPage, hasPreviousPage, onPageChange }: any) => (
 <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
 <div className="text-sm text-slate-600 dark:text-slate-400">
 Page {currentPage} of {Math.ceil(totalCount / pageSize)}
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => onPageChange(Math.max(1, currentPage - 1))}
 disabled={!hasPreviousPage}
 className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
 >
 ← Previous
 </button>
 <button
 onClick={() => onPageChange(currentPage + 1)}
 disabled={!hasNextPage}
 className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
 >
 Next →
 </button>
 </div>
 </div>
));

function FilterBadge({ label, value, color }: { label: string; value: string; color: string }) {
 const colorClasses: Record<string, string> = {
 blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
 purple: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50',
 emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50',
 amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50',
 rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/50',
 indigo: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/50',
 teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/50',
 cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700/50',
 violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700/50',
 fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-700/50',
 sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700/50'
 };

 return (
 <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${colorClasses[color]}`}>
 <span>{label}:</span> <span className="font-semibold">{value}</span>
 </span>
 );
}

function EmptyState({ message }: { message: string }) {
 return (
 <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
 <p className="text-sm">{message}</p>
 </div>
 );
}

const TalukaStackedBarChart = memo(({
 data,
 chartRef,
 onTalukaClick,
 onDisposeChannelClick,
 selectedTaluka,
 selectedChannel
}: {
 data: any[];
 chartRef: any;
 onTalukaClick: (taluka: string) => void;
 onDisposeChannelClick: (channel: string) => void;
 selectedTaluka: string | null;
 selectedChannel: string | null;
}) => {
 const option = useMemo(() => {
 const talukaMap = new Map<string, Map<string, number>>();

 data.forEach(item => {
 if (!talukaMap.has(item.taluka)) {
 talukaMap.set(item.taluka, new Map());
 }
 talukaMap.get(item.taluka)!.set(item.disposeChannel, item.count);
 });

 const disposeChannels = Array.from(new Set(data.map(d => d.disposeChannel)));
 const talukas = Array.from(talukaMap.keys())
 .sort((a, b) => {
 const aTotal = Array.from(talukaMap.get(a)!.values()).reduce((sum, val) => sum + val, 0);
 const bTotal = Array.from(talukaMap.get(b)!.values()).reduce((sum, val) => sum + val, 0);
 return bTotal - aTotal;
 })
 .slice(0, 20);

 const channelColors: Record<string, { normal: string; selected: string }> = {
 Green: {
 normal: 'green',
 selected: 'green'
 },
 Yellow: {
 normal: '#e7d210',
 selected: '#e7d210'
 },
 Red: {
 normal: '#f1170b',
 selected: '#f1170b'
 }
 };

 const series = disposeChannels.map((channel, idx) => {
 const isSelected = channel === selectedChannel;
 const colorObj = channelColors[channel];
 let color;
 if (colorObj) {
 color = isSelected ? colorObj.selected : colorObj.normal;
 } else {
 const pastellColors = [PASTEL_COLORS.lavender, PASTEL_COLORS.skyBlue, PASTEL_COLORS.aqua, PASTEL_COLORS.lilac];
 color = pastellColors[idx % pastellColors.length];
 }
 return {
 name: channel,
 type: 'bar',
 stack: 'total',
 data: talukas.map(taluka => talukaMap.get(taluka)?.get(channel) || 0),
 itemStyle: {
 color,
 borderWidth: isSelected ? 2 : 0,
 borderColor: '#000000',
 },
 barMaxWidth: 50,
 emphasis: {
 itemStyle: {
 shadowBlur: 10,
 shadowColor: 'rgba(0,0,0,0.3)'
 }
 }
 };
 });

 return {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' },
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#E2E8F0',
 borderWidth: 1,
 textStyle: { color: '#475569' },
 formatter: (params: any) => {
 let html = `<div style="padding: 8px;">
 <div style="font-weight: 600; margin-bottom: 6px; font-size: 13px;">${params[0].axisValue}</div>`;

 let total = 0;
 params.forEach((p: any) => {
 total += p.value;
 html += `<div style="color: #64748B; font-size: 12px; margin-bottom: 2px;">
 ${p.marker} ${p.seriesName}: <strong style="color: #1E293B;">${p.value.toLocaleString()}</strong>
 </div>`;
 });

 html += `<div style="color: #64748B; font-size: 12px; margin-top: 4px; padding-top: 4px; border-top: 1px solid #E2E8F0;">
 Total: <strong style="color: #1E293B;">${total.toLocaleString()}</strong>
 </div></div>`;
 return html;
 }
 },
 legend: {
 data: disposeChannels,
 top: 0,
 textStyle: { fontSize: 11, color: '#64748B' },
 selected: selectedChannel ? { [selectedChannel]: true } : undefined
 },
 grid: { left: '5%', right: '5%', bottom: '20%', top: '12%', containLabel: true },
 xAxis: {
 type: 'category',
 data: talukas.map(t => selectedTaluka === t ? `★ ${t}` : t),
 axisLabel: {
 rotate: 35,
 fontSize: 9,
 color: (value: string) => {
 const cleanValue = value.replace('★ ', '');
 return cleanValue === selectedTaluka ? '#6366F1' : '#64748B';
 },
 fontWeight: (value: string) => {
 const cleanValue = value.replace('★ ', '');
 return cleanValue === selectedTaluka ? 'bold' : 'normal';
 },
 interval: 0
 },
 axisLine: { lineStyle: { color: '#E2E8F0' } }
 },
 yAxis: {
 type: 'value',
 axisLabel: { fontSize: 10, color: '#64748B' },
 splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
 },
 dataZoom: [
 { type: 'inside', start: 0, end: 100 }
 ],
 series
 };
 }, [data, selectedTaluka, selectedChannel]);

 const onEvents = useMemo(() => ({
 click: (params: any) => {
 if (params.componentType === 'series') {
 onDisposeChannelClick(params.seriesName);
 }
 },
 legendselectchanged: (params: any) => {
 const selectedName = Object.keys(params.selected).find(key => params.selected[key] && key !== selectedChannel);
 if (selectedName) {
 onDisposeChannelClick(selectedName);
 }
 }
 }), [onDisposeChannelClick, selectedChannel]);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '100%', width: '100%', cursor: 'pointer' }}
 notMerge={true}
 lazyUpdate={true}
 />
 );
});