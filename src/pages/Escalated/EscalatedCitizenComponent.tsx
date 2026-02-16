//@ts-nocheck
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalFilterButton from '../../components/common/GlobalFilterButton';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, TreeChart, TreemapChart } from 'echarts/charts';
import {
 GridComponent,
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 DatasetComponent,
 DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { buildDrillThroughUrl } from '../../utils/drillthrough';
import { CHART_COLORS, PASTEL_COLORS } from '../../utils/colorPalette';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setgSwagatData } from '../../redux/features/globalfilters';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import OfficerEscalationTable from '../../components/common/OfficerEscalationTable';

echarts.use([
 BarChart,
 LineChart,
 GridComponent,
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 DatasetComponent,
 DataZoomComponent,
 TreeChart,
 TreemapChart,
 CanvasRenderer
]);

const GET_PAGE5_DASHBOARD = gql`
 query GetPage5Dashboard(
 $page: Int!
 $pageSize: Int!
 $programTypes: [String!]
 $departmentName: String
 $district: String
 $taluka: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $forwardedToDesignation: String
 $subjectCategory: String
 $levelNo: Int
 $escalationBaseLevel: Int
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage5(
 page: $page
 pageSize: $pageSize
 programTypes: $programTypes
 departmentName: $departmentName
 district: $district
 taluka: $taluka
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 forwardedToDesignation: $forwardedToDesignation
 subjectCategory: $subjectCategory
 levelNo: $levelNo
 escalationBaseLevel: $escalationBaseLevel
 fromDate: $fromDate
 toDate: $toDate
 ) {
 kpi {
 totalCount
 currentMonthCount
 previousMonthCount
 trendPercentage
 trendDirection
 }
 waterfallChart {
 levelNo
 count
 percentage
 }
 departmentBars {
 departmentName
 count
 }
 districtBars {
 district
 count
 }
 designationFeedbackChart {
 forwardedToDesignation
 feedbackCount
 totalCount
 feedbackPercentage
 }
 subjectTable {
 data {
 subjectCategory
 count
 }
 totalCount
 page
 pageSize
 hasNextPage
 hasPreviousPage
 }
 officerEscalationRanks {
 rank
 officerName
 escalationCount
 baseLevel
 }
 }
 }
`;

interface FilterState {
 departmentName: string | null;
 district: string | null;
 forwardedToDesignation: string | null;
 subjectCategory: string | null;
 levelNo: number | null;
}

interface WaterfallData {
 levelNo: number;
 count: number;
 percentage: number;
}

interface DepartmentBarData {
 departmentName: string;
 count: number;
}

interface DistrictBarData {
 district: string;
 count: number;
}

interface DesignationFeedbackData {
 forwardedToDesignation: string;
 feedbackCount: number;
 totalCount: number;
 feedbackPercentage: number;
}

interface SubjectCategoryRow {
 subjectCategory: string;
 count: number;
}

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
 }
}

function DownloadCsvButton({ onClick }: { onClick: () => void }) {
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
}

export default function EscalatedCitizenComponent() {
 const navigate = useNavigate();
 const location = useLocation();
 const dispatch = useAppDispatch();
 const waterfallChartRef = useRef<any>(null);
 const departmentChartRef = useRef<any>(null);
 const districtChartRef = useRef<any>(null);
 const designationChartRef = useRef<any>(null);

 const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);
 const gSwagatData = useAppSelector((state) => state.gSwagat);
 const globalFilters = useAppSelector((state) => state.gSwagat);

 const { filters: globalFilterValues, hasGlobalFilters } = useGlobalFilters();

 const [filters, setFilters] = useState<FilterState>({
 departmentName: null,
 district: null,
 forwardedToDesignation: null,
 subjectCategory: null,
 levelNo: null
 });

 const [escalationBaseLevel, setEscalationBaseLevel] = useState<number>(1);

 const mergedFilters = useMemo(() => ({
 ...globalFilterValues,
 ...Object.fromEntries(
 Object.entries(filters).filter(([_, value]) =>
 value !== null && (Array.isArray(value) ? value.length > 0 : true)
 )
 )
 }), [globalFilterValues, filters]);
 const [currentPage, setCurrentPage] = useState(1);
 const [searchQuery, setSearchQuery] = useState('');
 const pageSize = 10;

 const [contextMenu, setContextMenu] = useState<{
 visible: boolean;
 x: number;
 y: number;
 data: { name: string; value: number } | null;
 filterKey: 'departmentName' | 'district' | 'forwardedToDesignation' | 'subjectCategory' | 'levelNo' | null;
 }>({
 visible: false,
 x: 0,
 y: 0,
 data: null,
 filterKey: null
 });

 const { data, loading, error } = useQuery(GET_PAGE5_DASHBOARD, {
 variables: {
 page: currentPage,
 pageSize,
 programTypes: mergedFilters.programTypes && mergedFilters.programTypes.length > 0 ? mergedFilters.programTypes : null,
 departmentName: mergedFilters.departmentName,
 district: mergedFilters.district,
 taluka: mergedFilters.taluka,
 disposeChnl: mergedFilters.disposeChnl,
 grievanceStatus: mergedFilters.grievanceStatus,
 subStatusName: mergedFilters.subStatusName || null,
 forwardedToDesignation: mergedFilters.forwardedToDesignation,
 subjectCategory: mergedFilters.subjectCategory,
 levelNo: mergedFilters.levelNo,
 escalationBaseLevel: escalationBaseLevel,
 fromDate,
 toDate
 },
 fetchPolicy: 'cache-and-network'
 });

 const updateFilter = (key: keyof FilterState, value: any) => {
 setFilters({ ...filters, [key]: value });
 setCurrentPage(1);
 };

 const handleDepartmentClick = (department: string) => {
 if (filters.departmentName === department) {
 updateFilter('departmentName', null);
 } else {
 updateFilter('departmentName', department);
 }
 };

 const handleDistrictClick = (district: string) => {
 if (filters.district === district) {
 updateFilter('district', null);
 } else {
 updateFilter('district', district);
 }
 };

 const handleDesignationClick = (designation: string) => {
 if (filters.forwardedToDesignation === designation) {
 updateFilter('forwardedToDesignation', null);
 } else {
 updateFilter('forwardedToDesignation', designation);
 }
 };

 const handleSubjectClick = (subject: string) => {
 if (filters.subjectCategory === subject) {
 updateFilter('subjectCategory', null);
 } else {
 updateFilter('subjectCategory', subject);
 }
 };

 const handleWaterfallClick = (levelNo: number) => {
 if (filters.levelNo === levelNo) {
 updateFilter('levelNo', null);
 } else {
 updateFilter('levelNo', levelNo);
 }
 };

 const toggleProgramType = (type: string) => {
 const currentTypes = mergedFilters.programTypes ? [...mergedFilters.programTypes] : [];
 const index = currentTypes.indexOf(type);
 if (index > -1) {
 currentTypes.splice(index, 1);
 } else {
 currentTypes.push(type);
 }
 dispatch(setgSwagatData({
 ...gSwagatData,
 programTypes: currentTypes
 }));
 };

 const clearFilters = () => {
 setFilters({
 departmentName: null,
 district: null,
 forwardedToDesignation: null,
 subjectCategory: null,
 levelNo: null
 });
 setCurrentPage(1);
 setSearchQuery('');

 dispatch(setgSwagatData({
 programTypes: [],
 districts: [],
 talukas: [],
 departments: [],
 grievanceStatuses: [],
 subStatuses: [],
 disposeChannels: []
 }));
 };

 const handleDownloadWaterfall = () => {
 const csvData = waterfallData.map(item => ({
 'Level': `Level ${item.levelNo}`,
 'Count': item.count,
 'Percentage': `${item.percentage.toFixed(1)}%`
 }));
 downloadCSV(csvData, 'escalation_levels.csv', ['Level', 'Count', 'Percentage']);
 };

 const handleDownloadDepartments = () => {
 const csvData = departmentBars.map(item => ({
 'Department': item.departmentName,
 'Count': item.count
 }));
 downloadCSV(csvData, 'departments.csv', ['Department', 'Count']);
 };

 const handleDownloadDistricts = () => {
 const csvData = districtBars.map(item => ({
 'District': item.district,
 'Count': item.count
 }));
 downloadCSV(csvData, 'districts.csv', ['District', 'Count']);
 };

 const handleDownloadDesignations = () => {
 const csvData = designationData.map(item => ({
 'Designation': item.forwardedToDesignation,
 'Feedback Count': item.feedbackCount,
 'Total Count': item.totalCount,
 'Feedback %': `${item.feedbackPercentage.toFixed(1)}%`
 }));
 downloadCSV(csvData, 'designations.csv', ['Designation', 'Feedback Count', 'Total Count', 'Feedback %']);
 };

 const handleDownloadSubjects = () => {
 const csvData = (allSubjects ?? subjectTable?.data ?? []).map(item => ({
 'Subject Category': item.subjectCategory,
 'Count': item.count
 }));
 downloadCSV(csvData, 'subjects.csv', ['Subject Category', 'Count']);
 };

 const handleContextMenu = useCallback((params: any, filterKey: 'departmentName' | 'district' | 'forwardedToDesignation' | 'subjectCategory' | 'levelNo') => {
 const event = params.event?.event || params.event;
 const x = event?.clientX || event?.pageX || 0;
 const y = event?.clientY || event?.pageY || 0;

 setContextMenu({
 visible: true,
 x,
 y,
 data: {
 name: typeof params.name === 'number' ? `Level ${params.name}` : params.name,
 value: params.value || params.data?.value || params.data || 0
 },
 filterKey
 });
 }, []);

 const closeContextMenu = useCallback(() => {
 setContextMenu({
 visible: false,
 x: 0,
 y: 0,
 data: null,
 filterKey: null
 });
 }, []);

 const handleDrillThrough = useCallback(() => {
 if (!contextMenu.data || !contextMenu.filterKey) return;

 const drillThroughContext: Record<string, any> = {
 sourcePage: 'escalated-citizen',
 escalatedByCitizen: 'Yes', 
 };

 Object.entries(filters).forEach(([key, value]) => {
 if (value !== null) {
 drillThroughContext[key] = value;
 }
 });

 const clickedValue = contextMenu.data.name;
 const clickedKey = contextMenu.filterKey;

 if (clickedKey === 'levelNo') {
 const levelMatch = clickedValue.match(/\d+/);
 if (levelMatch) {
 drillThroughContext.levelNo = parseInt(levelMatch[0], 10);
 }
 } else {
 drillThroughContext[clickedKey] = clickedValue;
 }

 const url = buildDrillThroughUrl(drillThroughContext);
 navigate(url);
 closeContextMenu();
 }, [contextMenu.data, contextMenu.filterKey, filters, closeContextMenu, navigate]);

 useEffect(() => {
 const handleContextMenuEvent = (e: MouseEvent) => {
 const target = e.target as HTMLElement;
 if (target.closest('.chart-container, .subject-table')) {
 e.preventDefault();
 }
 };

 document.addEventListener('contextmenu', handleContextMenuEvent, { passive: false });
 return () => document.removeEventListener('contextmenu', handleContextMenuEvent);
 }, []);

 const [allSubjects, setAllSubjects] = useState<SubjectCategoryRow[] | null>(null);

 useEffect(() => {
 let isMounted = true;
 async function fetchAllSubjects() {
 try {
 const result = await fetch(
 import.meta.env.VITE_GRAPHQL_API_URL,
 {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 query: `
 query GetPage5Dashboard($page: Int!, $pageSize: Int!, $programTypes: [String!], $departmentName: String, $district: String, $taluka: String, $disposeChnl: String, $grievanceStatus: String, $subStatusName: String, $forwardedToDesignation: String, $levelNo: Int, $fromDate: String, $toDate: String) {
 dashboardPage5(
 page: $page
 pageSize: $pageSize
 programTypes: $programTypes
 departmentName: $departmentName
 district: $district
 taluka: $taluka
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 forwardedToDesignation: $forwardedToDesignation
 levelNo: $levelNo
 escalationBaseLevel: $escalationBaseLevel
 fromDate: $fromDate
 toDate: $toDate
 ) {
 subjectTable {
 data {
 subjectCategory
 count
 }
 }
 }
 }
 `,
 variables: {
 page: 1,
 pageSize: 10000, 
 programTypes: mergedFilters.programTypes && mergedFilters.programTypes.length > 0 ? mergedFilters.programTypes : null,
 departmentName: filters.departmentName,
 district: filters.district,
 taluka: mergedFilters.taluka,
 disposeChnl: mergedFilters.disposeChnl,
 grievanceStatus: mergedFilters.grievanceStatus,
 subStatusName: mergedFilters.subStatusName || null,
 forwardedToDesignation: filters.forwardedToDesignation,
 levelNo: filters.levelNo,
 fromDate,
 toDate
 }
 })
 }
 );

 if (!result.ok) {
 console.error("Failed to fetch subjects:", result.status, await result.text());
 if (isMounted) setAllSubjects([]);
 return;
 }

 const json = await result.json();
 const allData = json.data?.dashboardPage5?.subjectTable?.data || [];
 if (isMounted) setAllSubjects(allData);
 } catch (error) {
 console.error("Error fetching all subjects:", error);
 if (isMounted) setAllSubjects([]);
 }
 }

 setAllSubjects(null);
 fetchAllSubjects();
 return () => { isMounted = false; };
 }, [
 filters.departmentName,
 filters.district,
 filters.forwardedToDesignation,
 filters.levelNo,
 fromDate,
 toDate,
 ]);

 if (error) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
 <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl shadow-2xl border border-white/20">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Data</h2>
 <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{error.message}</p>
 <button
 onClick={() => window.location.reload()}
 className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl transition-all"
 >
 Reload Page
 </button>
 </div>
 </div>
 );
 }

 if (loading && !data) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
 <div className="text-center">
 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
 <p className="text-gray-600 dark:text-gray-400">Loading escalated grievances...</p>
 </div>
 </div>
 );
 }

 const dashboardData = data?.dashboardPage5;

 if (!dashboardData) {
 return (
 <div className="min-h-screen flex items-center justify-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
 <div className="text-center">
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h2>
 <p className="text-gray-600 dark:text-gray-400">Please check your backend connection</p>
 </div>
 </div>
 );
 }

 const kpi = dashboardData.kpi;
 const waterfallData: WaterfallData[] = dashboardData.waterfallChart || [];
 const departmentBars: DepartmentBarData[] = dashboardData.departmentBars || [];
 const districtBars: DistrictBarData[] = dashboardData.districtBars || [];
 const designationData: DesignationFeedbackData[] = dashboardData.designationFeedbackChart || [];
 const subjectTable = dashboardData.subjectTable;
 let subjects: SubjectCategoryRow[] = subjectTable?.data ?? [];
 let showPagination = false;
 let totalResults = 0;

 if (searchQuery.trim() && allSubjects) {
 const filteredSubjects = allSubjects.filter(s =>
 s.subjectCategory.toLowerCase().includes(searchQuery.toLowerCase())
 );
 totalResults = filteredSubjects.length;

 const startIndex = (currentPage - 1) * pageSize;
 const endIndex = startIndex + pageSize;
 subjects = filteredSubjects.slice(startIndex, endIndex);
 showPagination = totalResults > pageSize;
 } else {
 totalResults = subjectTable?.totalCount || 0;
 showPagination = subjectTable && subjectTable.totalCount > pageSize;
 }

 const hasActiveFilters = Object.entries(filters).some(([_, value]) => value !== null) ||
 globalFilters?.programTypes?.length > 0 ||
 globalFilters?.districts?.length > 0 ||
 globalFilters?.talukas?.length > 0 ||
 globalFilters?.departments?.length > 0 ||
 globalFilters?.grievanceStatuses?.length > 0 ||
 globalFilters?.subStatuses?.length > 0 ||
 globalFilters?.disposeChannels?.length > 0;

 return (
 <div className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
 <ContextMenu
 visible={contextMenu.visible}
 x={contextMenu.x}
 y={contextMenu.y}
 data={contextMenu.data}
 filterKey={contextMenu.filterKey}
 onClose={closeContextMenu}
 onDrillThrough={handleDrillThrough}
 />

 <div className="max-w-[1800px] mx-auto space-y-4">
 <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
 <div className="flex flex-wrap items-center gap-2">
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
 onClick={() => toggleProgramType(type)}
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

 {hasActiveFilters && (
 <>
 <div id="active-filters-pane" className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-xl p-3 border border-gray-200/40 dark:border-slate-700/30 shadow-sm">
 <div className="flex flex-wrap items-center gap-3">
 <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Filters:</span>
 {globalFilters?.programTypes?.length > 0 && globalFilters.programTypes.map((type: string) => (
 <FilterBadge key={type} label="Program" value={type} color="indigo" onClear={() => {
 const newTypes = globalFilters.programTypes.filter((t: string) => t !== type);
 dispatch(setgSwagatData({ ...globalFilters, programTypes: newTypes }));
 }} />
 ))}
 {globalFilters?.districts?.length > 0 && globalFilters.districts.map((d: string) => (
 <FilterBadge key={d} label="District" value={d} color="blue" onClear={() => dispatch(setgSwagatData({ ...globalFilters, districts: [] }))} />
 ))}
 {globalFilters?.talukas?.length > 0 && globalFilters.talukas.map((t: string) => (
 <FilterBadge key={t} label="Taluka" value={t} color="cyan" onClear={() => {
 const newTalukas = globalFilters.talukas.filter((tal: string) => tal !== t);
 dispatch(setgSwagatData({ ...globalFilters, talukas: newTalukas }));
 }} />
 ))}
 {globalFilters?.departments?.length > 0 && globalFilters.departments.map((d: string) => (
 <FilterBadge key={d} label="Department" value={d} color="purple" onClear={() => dispatch(setgSwagatData({ ...globalFilters, departments: [] }))} />
 ))}
 {globalFilters?.grievanceStatuses?.length > 0 && globalFilters.grievanceStatuses.map((s: string) => (
 <FilterBadge key={s} label="Status" value={s} color="amber" onClear={() => dispatch(setgSwagatData({ ...globalFilters, grievanceStatuses: [] }))} />
 ))}
 {globalFilters?.subStatuses?.length > 0 && globalFilters.subStatuses.map((s: string) => (
 <FilterBadge key={s} label="Sub Status" value={s} color="rose" onClear={() => {
 const newStatuses = globalFilters.subStatuses.filter((st: string) => st !== s);
 dispatch(setgSwagatData({ ...globalFilters, subStatuses: newStatuses }));
 }} />
 ))}
 {globalFilters?.disposeChannels?.length > 0 && globalFilters.disposeChannels.map((c: string) => (
 <FilterBadge key={c} label="Channel" value={c} color="green" onClear={() => dispatch(setgSwagatData({ ...globalFilters, disposeChannels: [] }))} />
 ))}
 {filters.departmentName && (
 <FilterBadge
 label="Department"
 value={filters.departmentName}
 onClear={() => updateFilter('departmentName', null)}
 color="blue"
 />
 )}
 {filters.district && (
 <FilterBadge
 label="District"
 value={filters.district}
 onClear={() => updateFilter('district', null)}
 color="purple"
 />
 )}
 {filters.forwardedToDesignation && (
 <FilterBadge
 label="Designation"
 value={filters.forwardedToDesignation}
 onClear={() => updateFilter('forwardedToDesignation', null)}
 color="emerald"
 />
 )}
 {filters.subjectCategory && (
 <FilterBadge
 label="Subject"
 value={filters.subjectCategory}
 onClear={() => updateFilter('subjectCategory', null)}
 color="amber"
 />
 )}
 {filters.levelNo !== null && (
 <FilterBadge
 label="Level"
 value={`Level ${filters.levelNo}`}
 onClear={() => updateFilter('levelNo', null)}
 color="rose"
 />
 )}
 <button
 onClick={clearFilters}
 className="ml-auto px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium transition-all border border-red-200 dark:border-red-800"
 >
 ✕ Clear All
 </button>
 </div>
 </div>
 <StickyMiniActiveFilters
 filters={filters}
 globalFilters={globalFilters}
 clearFilters={clearFilters}
 updateFilter={updateFilter}
 dispatch={dispatch}
 />
 </>
 )}

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="group relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 transition-transform duration-300 dark:border-slate-700/50 shadow-sm">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Escalated By Citizen</p>
 <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
 {kpi.totalCount.toLocaleString()}
 </h3>
 </div>
 </div>
 </div>

 <div className="group relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 transition-transform duration-300 dark:border-slate-700/50 shadow-sm">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">This Month</p>
 <h3 className="text-4xl font-bold dark:from-teal-400 dark:to-teal-600 bg-clip-text text-black">
 {kpi.currentMonthCount.toLocaleString()}
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Previous: {kpi.previousMonthCount.toLocaleString()}
 </p>
 </div>
 </div>
 </div>
 <KPICardWithTrend
 title="Monthly Trend"
 trendValue={kpi.trendPercentage}
 trendDirection={kpi.trendDirection}
 gradient="from-slate-500 to-teal-600"
 />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <ChartCard title="Escalation Levels" onDownload={handleDownloadWaterfall}>
 {waterfallData.length > 0 ? (
 <div className="h-full chart-container">
 <WaterfallChart
 data={waterfallData}
 chartRef={waterfallChartRef}
 onLevelClick={handleWaterfallClick}
 onContextMenu={(params) => handleContextMenu(params, 'levelNo')}
 selectedLevel={filters.levelNo}
 />
 </div>
 ) : (
 <EmptyState message="No level data" />
 )}
 </ChartCard>
 <ChartCard title="Top Departments" onDownload={handleDownloadDepartments}>
 {departmentBars.length > 0 ? (
 <div className="h-full chart-container">
 <DepartmentBarChart
 data={departmentBars}
 chartRef={departmentChartRef}
 onDepartmentClick={handleDepartmentClick}
 onContextMenu={(params) => handleContextMenu(params, 'departmentName')}
 selectedDepartment={filters.departmentName}
 />
 </div>
 ) : (
 <EmptyState message="No department data" />
 )}
 </ChartCard>
 <ChartCard title="Top Districts" onDownload={handleDownloadDistricts}>
 {districtBars.length > 0 ? (
 <div className="h-full chart-container">
 <DistrictBarChart
 data={districtBars}
 chartRef={districtChartRef}
 onDistrictClick={handleDistrictClick}
 onContextMenu={(params) => handleContextMenu(params, 'district')}
 selectedDistrict={filters.district}
 />
 </div>
 ) : (
 <EmptyState message="No district data" />
 )}
 </ChartCard>
 <ChartCard title="Feedback by Designation" onDownload={handleDownloadDesignations}>
 {designationData.length > 0 ? (
 <div className="h-full chart-container">
 <DesignationFeedbackChart
 data={designationData}
 chartRef={designationChartRef}
 onDesignationClick={handleDesignationClick}
 onContextMenu={(params) => handleContextMenu(params, 'forwardedToDesignation')}
 selectedDesignation={filters.forwardedToDesignation}
 />
 </div>
 ) : (
 <EmptyState message="No designation data" />
 )}
 </ChartCard>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 transition-transform duration-300 dark:border-slate-700/50 shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
 Subject Categories
 </h3>
 <div className="flex items-center gap-3">
 <span className="text-sm text-slate-500 dark:text-slate-400">{subjects.length} results</span>
 <DownloadCsvButton onClick={handleDownloadSubjects} />
 </div>
 </div>

 <div className="mb-4">
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setCurrentPage(1);
 }}
 placeholder="Search subjects..."
 className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500"
 />
 </div>

 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-slate-50 dark:bg-slate-700/50 border-b-2 border-slate-200 dark:border-slate-600">
 <tr>
 <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">#</th>
 <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Subject Category</th>
 <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Count</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
 {subjects.length > 0 ? (
 subjects.map((subject, idx) => (
 <tr
 key={`${subject.subjectCategory}-${idx}`}
 onClick={() => handleSubjectClick(subject.subjectCategory)}
 onContextMenu={(e) => {
 e.preventDefault();
 handleContextMenu({
 name: subject.subjectCategory,
 value: subject.count,
 event: { event: e }
 }, 'subjectCategory');
 }}
 className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors subject-table ${filters.subjectCategory === subject.subjectCategory
 ? 'bg-slate-100 dark:bg-slate-700/50 border-l-4 border-slate-500'
 : ''
 }`}
 title="Click to filter, right-click to drill through"
 >
 <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{idx + 1}</td>
 <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-medium">
 {subject.subjectCategory}
 </td>
 <td className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-300 font-bold">
 {subject.count.toLocaleString()}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={3} className="px-4 py-8 text-center">
 <EmptyState
 message={searchQuery ? `No results for "${searchQuery}"` : "No subjects found"}
 />
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {showPagination && (
 <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
 <div className="text-sm text-slate-600 dark:text-slate-400">Page {currentPage}</div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={!subjectTable.hasPreviousPage}
 className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
 >
 ← Previous
 </button>
 <button
 onClick={() => setCurrentPage(p => p + 1)}
 disabled={!subjectTable.hasNextPage}
 className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
 >
 Next →
 </button>
 </div>
 </div>
 )}
 </div>

 <OfficerEscalationTable
 title="Top 10 Escalated Officers (Citizen Escalation)"
 ranks={dashboardData.officerEscalationRanks || []}
 baseLevel={escalationBaseLevel}
 onBaseLevelChange={setEscalationBaseLevel}
 loading={loading}
 />
 </div>
 </div>
 <GlobalFilterButton />
 </div>
 );
}

const ContextMenu = React.memo(function ContextMenu({
 visible,
 x,
 y,
 data,
 filterKey,
 onClose,
 onDrillThrough
}: {
 visible: boolean;
 x: number;
 y: number;
 data: { name: string; value: number } | null;
 filterKey: string | null;
 onClose: () => void;
 onDrillThrough: () => void;
}) {
 const menuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
 onClose();
 }
 };

 const handleEscape = (event: KeyboardEvent) => {
 if (event.key === 'Escape') {
 onClose();
 }
 };

 if (visible) {
 document.addEventListener('mousedown', handleClickOutside);
 document.addEventListener('keydown', handleEscape);
 document.body.style.overflow = 'hidden';
 }

 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 document.removeEventListener('keydown', handleEscape);
 document.body.style.overflow = 'unset';
 };
 }, [visible, onClose]);

 if (!visible || !data) return null;

 const menuWidth = 220;
 const menuHeight = 160;
 const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
 const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;

 return (
 <>
 <div
 className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[9998]"
 onClick={onClose}
 />

 <div
 ref={menuRef}
 className="fixed bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-xl shadow-2xl border border-gray-200/40 dark:border-gray-700 py-2 z-[9999] min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200"
 style={{
 left: `${adjustedX}px`,
 top: `${adjustedY}px`,
 }}
 >
 <div className="px-4 py-2.5 border-b border-gray-200/40 dark:border-gray-700">
 <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
 Selected Item
 </div>
 <div
 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[180px]"
 title={data.name}
 >
 {data.name}
 </div>
 <div className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 flex items-center gap-1">
 <span className="text-gray-500 dark:text-gray-500">Count:</span>
 <span className="font-semibold text-teal-600 dark:text-slate-400">
 {data.value.toLocaleString()}
 </span>
 </div>
 </div>

 <button
 onClick={onDrillThrough}
 className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-teal-50 dark:hover:from-slate-900/20 dark:hover:to-teal-900/20 flex items-center gap-3 transition-all group"
 >
 <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-black border border-gray-200/60 group-hover:shadow-sm group-hover:shadow-slate-500/50 transition-all">
 <svg
 width="16"
 height="16"
 fill="none"
 viewBox="0 0 24 24"
 stroke="currentColor"
 className="group-hover:translate-x-0.5 transition-transform"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 </div>
 <div className="flex-1">
 <div className="font-semibold text-gray-900 dark:text-gray-100">Drill Through</div>
 <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View detailed analysis</div>
 </div>
 </button>

 <div className="px-4 py-2 border-t border-gray-200/40 dark:border-gray-700 mt-1">
 <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
 <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
 ESC
 </kbd>
 <span>to close</span>
 </div>
 </div>
 </div>
 </>
 );
});

function FilterBadge({ label, value, onClear, color }: any) {
 const colorClasses = {
 indigo: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700/50',
 blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
 cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700/50',
 purple: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50',
 emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50',
 amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50',
 rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700/50',
 green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700/50'
 };

 return (
 <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
 <span>{label}:</span> <span className="font-semibold">{value}</span>
 <button onClick={onClear} className="hover:opacity-75 font-bold ml-1">✕</button>
 </span>
 );
}

function KPICardWithTrend({ title, trendValue, trendDirection, gradient }: any) {
 const trend = trendDirection === 'up' ? 'up' : trendDirection === 'down' ? 'down' : 'neutral';
 const trendColor = trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-gray-600';
 const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

 return (
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 transition-transform duration-300 dark:border-slate-700/50 shadow-sm ">
 <div className="flex items-center justify-between mb-4">
 <div className="flex-1">
 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</p>
 <h3 className={`text-4xl font-bold bg-clip-text text-black`}>
 {trendIcon} {Math.abs(trendValue).toFixed(1)}%
 </h3>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className={`text-sm font-semibold ${trendColor}`}>
 {trend === 'up' ? 'Increase' : trend === 'down' ? 'Decrease' : 'Stable'}
 </span>
 <span className="text-xs text-slate-500 dark:text-slate-400">from last month</span>
 </div>

 <div className="mt-3 h-12">
 <TrendSparkline trendValue={trendValue} trend={trend} />
 </div>
 </div>
 );
}

function TrendSparkline({ trendValue, trend }: any) {
 const option = {
 grid: { top: 0, right: 0, bottom: 0, left: 0 },
 xAxis: {
 type: 'category',
 show: false,
 data: ['', '', '', '', '', '', '']
 },
 yAxis: {
 type: 'value',
 show: false
 },
 series: [
 {
 data: trend === 'up' ? [20, 25, 30, 28, 35, 40, 45] : trend === 'down' ? [45, 40, 35, 38, 30, 25, 20] : [30, 32, 31, 33, 32, 31, 30],
 type: 'line',
 smooth: true,
 symbol: 'none',
 lineStyle: {
 color: trend === 'up' ? PASTEL_COLORS.rose : trend === 'down' ? PASTEL_COLORS.mint : PASTEL_COLORS.powder,
 width: 2
 },
 areaStyle: {
 color: trend === 'up' ? `${PASTEL_COLORS.rose}30` : trend === 'down' ? `${PASTEL_COLORS.mint}30` : `${PASTEL_COLORS.powder}30`
 }
 }
 ]
 };

 return <ReactEChartsCore echarts={echarts} option={option} style={{ height: '100%' }} />;
}

function ChartCard({ title, children, onDownload }: any) {
 return (
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-5 transition-transform duration-300 dark:border-slate-700/50 shadow-sm ">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
 {title}
 </h3>
 <DownloadCsvButton onClick={onDownload} />
 </div>
 <div className="h-80">{children}</div>
 </div>
 );
}

function EmptyState({ message }: { message: string }) {
 return (
 <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
 <p className="text-sm">{message}</p>
 </div>
 );
}

function WaterfallChart({ data, chartRef, onLevelClick, onContextMenu, selectedLevel }: any) {
 const sortedData = [...data].sort((a, b) => a.levelNo - b.levelNo);

 const levels = sortedData.map(d => `L${d.levelNo}`);
 const levelNumbers = sortedData.map(d => d.levelNo);
 const counts = sortedData.map(d => d.count);

 let cumulative = 0;
 const waterfallData = counts.map((count) => {
 const start = cumulative;
 cumulative += count;
 return [start, cumulative];
 });

 const totalCount = counts.reduce((sum, count) => sum + count, 0);
 levels.push('Total');
 levelNumbers.push(-1);
 counts.push(totalCount);
 waterfallData.push([0, totalCount]);

 const option = {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' },
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#E2E8F0',
 borderWidth: 1,
 textStyle: { color: '#475569' },
 formatter: (params: any) => {
 const dataIndex = params[0].dataIndex;
 const isTotal = levelNumbers[dataIndex] === -1;

 if (isTotal) {
 return `<div style="padding: 8px;">
 <div style="font-weight: 600; margin-bottom: 4px; color: #10B981; font-size: 13px;">${levels[dataIndex]}</div>
 <div style="color: #64748B; font-size: 12px;">Count: <strong style="color: #10B981;">${counts[dataIndex].toLocaleString()}</strong></div>
 </div>`;
 }

 return `<div style="padding: 8px;">
 <div style="font-weight: 600; margin-bottom: 4px; color: #6366F1; font-size: 13px;">Level ${levelNumbers[dataIndex]}</div>
 <div style="color: #64748B; font-size: 12px; margin-bottom: 2px;">Count: <strong style="color: #6366F1;">${counts[dataIndex].toLocaleString()}</strong></div>
 <div style="color: #64748B; font-size: 11px;">Cumulative: <strong>${waterfallData[dataIndex][1].toLocaleString()}</strong></div>
 </div>`;
 }
 },
 grid: { left: '10%', right: '5%', bottom: '15%', top: '8%', containLabel: true },
 xAxis: {
 type: 'category',
 data: levels,
 axisLabel: { fontSize: 10, color: '#64748B', fontWeight: 500 },
 axisLine: { lineStyle: { color: '#E2E8F0' } }
 },
 yAxis: {
 type: 'value',
 name: 'Cumulative',
 nameTextStyle: { fontSize: 11, color: '#64748B' },
 axisLabel: { fontSize: 10, color: '#64748B' },
 splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
 },
 dataZoom: [
 { type: 'inside', start: 0, end: 100 }
 ],
 series: [
 {
 name: 'Placeholder',
 type: 'bar',
 stack: 'waterfall',
 itemStyle: { color: 'rgba(0,0,0,0)' },
 data: waterfallData.map(d => d[0]),
 silent: true
 },
 {
 name: 'Count',
 type: 'bar',
 stack: 'waterfall',
 data: counts.map((value: number, idx: number) => {
 const isTotal = levelNumbers[idx] === -1;
 const isSelected = !isTotal && levelNumbers[idx] === selectedLevel;

 return {
 value,
 itemStyle: {
 color: isTotal
 ? PASTEL_COLORS.mint
 : isSelected
 ? CHART_COLORS.primary
 : PASTEL_COLORS.lavender,
 borderRadius: [6, 6, 0, 0],
 borderWidth: isSelected ? 2 : 0,
 borderColor: CHART_COLORS.primary
 }
 };
 }),
 label: {
 show: true,
 position: 'inside',
 formatter: (params: any) => {
 const isTotal = levelNumbers[params.dataIndex] === -1;
 return isTotal ? `Total\n${params.value.toLocaleString()}` : `${params.value.toLocaleString()}`;
 },
 fontSize: 10,
 color: '#ffffff',
 fontWeight: 600
 },
 barMaxWidth: 45
 }
 ]
 };

 const onEvents = {
 click: (params: any) => {
 const levelNo = levelNumbers[params.dataIndex];
 if (levelNo !== -1) onLevelClick(levelNo);
 },
 contextmenu: (params: any) => {
 if (params.componentType === 'series' && params.seriesName === 'Count') {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 const levelNo = levelNumbers[params.dataIndex];
 if (levelNo !== -1) {
 const count = counts[params.dataIndex];
 onContextMenu({
 name: levelNo,
 value: count,
 event: params.event
 });
 }
 }
 }
 };

 useEffect(() => {
 if (chartRef.current) {
 const chartInstance = chartRef.current.getEchartsInstance();
 const dom = chartInstance.getDom();

 const handleContextMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };

 dom.addEventListener('contextmenu', handleContextMenu);

 return () => {
 dom.removeEventListener('contextmenu', handleContextMenu);
 };
 }
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '100%', width: '100%', cursor: 'pointer' }}
 notMerge={true}
 />
 );
}

function DepartmentBarChart({
 data,
 chartRef,
 onDepartmentClick,
 onContextMenu,
 selectedDepartment
}: any) {

 const sortedData = [...data]
 .sort((a, b) => b.count - a.count)
 .slice(0, 15);

 const treeData = sortedData.map((d) => ({
 name: d.departmentName,
 value: d.count,
 }));

 const counts = sortedData.map((d) => d.count);

 const option = {
 tooltip: {
 trigger: "item", 
 backgroundColor: "rgba(255, 255, 255, 0.95)",
 borderColor: "#E2E8F0",
 borderWidth: 1,
 textStyle: { color: "#475569" },
 formatter: (params: any) => {
 return `
 <div style="padding: 8px;">
 <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">
 ${params.data.name}
 </div>
 <div style="color: #64748B; font-size: 12px;">
 Count: <strong style="color: #9333EA;">
 ${params.data.value.toLocaleString()}
 </strong>
 </div>
 </div>
 `;
 }
 },
 series: [
 {
 type: "treemap",
 data: treeData,
 leafDepth: 1,
 label: {
 show: true,
 formatter: "{b}",
 fontSize: 12,
 }
 }
 ]
 };

 const onEvents = {
 click: (params: any) => {
 const clickedName = params.data.name; 
 onDepartmentClick(clickedName);
 },

 contextmenu: (params: any) => {
 if (params.componentType === "series") {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();

 onContextMenu({
 name: params.data.name, 
 value: params.data.value, 
 event: params.event
 });
 }
 }
 };

 useEffect(() => {
 if (!chartRef.current) return;

 const chart = chartRef.current.getEchartsInstance();
 const dom = chart.getDom();

 const preventMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };

 dom.addEventListener("contextmenu", preventMenu);
 return () => dom.removeEventListener("contextmenu", preventMenu);
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 notMerge={true}
 style={{ height: "100%", width: "100%", cursor: "pointer" }}
 />
 );
}

function DistrictBarChart({ data, chartRef, onDistrictClick, onContextMenu, selectedDistrict }: any) {
 const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 15);
 const districts = sortedData.map(d => d.district);
 const counts = sortedData.map(d => d.count);

 const option = {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' },
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#E2E8F0',
 borderWidth: 1,
 textStyle: { color: '#475569' },
 formatter: (params: any) => {
 const dataIndex = params[0].dataIndex;
 return `<div style="padding: 8px;">
 <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">${districts[dataIndex]}</div>
 <div style="color: #64748B; font-size: 12px;">Count: <strong style="color: #059669;">${counts[dataIndex].toLocaleString()}</strong></div>
 </div>`;
 }
 },
 grid: { left: '5%', right: '5%', bottom: '20%', top: '8%', containLabel: true },
 xAxis: {
 type: 'category',
 data: districts,
 axisLabel: { rotate: 35, fontSize: 9, color: '#64748B', interval: 0 },
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
 series: [{
 type: 'bar',
 data: counts.map((value: number, idx: number) => ({
 value,
 itemStyle: {
 color: districts[idx] === selectedDistrict
 ? CHART_COLORS.secondary
 : PASTEL_COLORS.skyBlue,
 borderRadius: [6, 6, 0, 0],
 borderWidth: districts[idx] === selectedDistrict ? 2 : 0,
 borderColor: CHART_COLORS.secondary
 }
 })),
 barMaxWidth: 45
 }]
 };

 const onEvents = {
 click: (params: any) => onDistrictClick(districts[params.dataIndex]),
 contextmenu: (params: any) => {
 if (params.componentType === 'series') {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 const district = districts[params.dataIndex];
 const count = counts[params.dataIndex];
 onContextMenu({
 name: district,
 value: count,
 event: params.event
 });
 }
 }
 };

 useEffect(() => {
 if (chartRef.current) {
 const chartInstance = chartRef.current.getEchartsInstance();
 const dom = chartInstance.getDom();

 const handleContextMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };

 dom.addEventListener('contextmenu', handleContextMenu);

 return () => {
 dom.removeEventListener('contextmenu', handleContextMenu);
 };
 }
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '100%', width: '100%', cursor: 'pointer' }}
 notMerge={true}
 />
 );
}

function DesignationFeedbackChart({ data, chartRef, onDesignationClick, onContextMenu, selectedDesignation }: any) {
 const sortedData = [...data].sort((a, b) => b.feedbackCount - a.feedbackCount).slice(0, 15);
 const designations = sortedData.map(d => d.forwardedToDesignation.length > 20 ? d.forwardedToDesignation.substring(0, 17) + '...' : d.forwardedToDesignation);
 const feedbackCounts = sortedData.map(d => d.feedbackCount);

 const option = {
 tooltip: {
 trigger: 'axis',
 axisPointer: { type: 'shadow' },
 backgroundColor: 'rgba(255, 255, 255, 0.95)',
 borderColor: '#E2E8F0',
 borderWidth: 1,
 textStyle: { color: '#475569' },
 formatter: (params: any) => {
 const dataIndex = params[0].dataIndex;
 const percentage = sortedData[dataIndex].feedbackPercentage;
 return `<div style="padding: 8px;">
 <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">${sortedData[dataIndex].forwardedToDesignation}</div>
 <div style="color: #64748B; font-size: 12px; margin-bottom: 2px;">Feedback: <strong style="color: #D97706;">${feedbackCounts[dataIndex].toLocaleString()}</strong></div>
 <div style="color: #64748B; font-size: 11px;">Rate: <strong>${percentage.toFixed(1)}%</strong></div>
 </div>`;
 }
 },
 grid: { left: '5%', right: '5%', bottom: '25%', top: '8%', containLabel: true },
 xAxis: {
 type: 'category',
 data: designations,
 axisLabel: { rotate: 35, fontSize: 9, color: '#64748B', interval: 0 },
 axisLine: { lineStyle: { color: '#E2E8F0' } }
 },
 yAxis: {
 type: 'value',
 name: 'Feedback',
 nameTextStyle: { fontSize: 11, color: '#64748B' },
 axisLabel: { fontSize: 10, color: '#64748B' },
 splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } }
 },
 dataZoom: [
 { type: 'inside', start: 0, end: 100 }
 ],
 series: [{
 type: 'bar',
 data: feedbackCounts.map((value: number, idx: number) => ({
 value,
 itemStyle: {
 color: sortedData[idx].forwardedToDesignation === selectedDesignation
 ? PASTEL_COLORS.peach
 : PASTEL_COLORS.yellow,
 borderRadius: [6, 6, 0, 0],
 borderWidth: sortedData[idx].forwardedToDesignation === selectedDesignation ? 2 : 0,
 borderColor: PASTEL_COLORS.peach
 }
 })),
 barMaxWidth: 45
 }]
 };

 const onEvents = {
 click: (params: any) => {
 const originalName = sortedData[params.dataIndex].forwardedToDesignation;
 onDesignationClick(originalName);
 },
 contextmenu: (params: any) => {
 if (params.componentType === 'series') {
 params.event.event.preventDefault();
 params.event.event.stopPropagation();
 const designation = sortedData[params.dataIndex].forwardedToDesignation;
 const count = feedbackCounts[params.dataIndex];
 onContextMenu({
 name: designation,
 value: count,
 event: params.event
 });
 }
 }
 };

 useEffect(() => {
 if (chartRef.current) {
 const chartInstance = chartRef.current.getEchartsInstance();
 const dom = chartInstance.getDom();

 const handleContextMenu = (e: MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 };

 dom.addEventListener('contextmenu', handleContextMenu);

 return () => {
 dom.removeEventListener('contextmenu', handleContextMenu);
 };
 }
 }, []);

 return (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '100%', width: '100%', cursor: 'pointer' }}
 notMerge={true}
 />
 );
}

function StickyMiniActiveFilters({ filters, globalFilters, clearFilters, updateFilter, dispatch }: any) {
 const [showSticky, setShowSticky] = React.useState(false);

 React.useEffect(() => {
 const full = document.getElementById('active-filters-pane');
 if (!full) return;

 const observer = new window.IntersectionObserver(
 ([entry]) => {
 setShowSticky(!entry.isIntersecting);
 },
 { root: null, threshold: 0 }
 );
 observer.observe(full);

 return () => observer.disconnect();
 }, []);

 if (!showSticky) return null;

 return (
 <div
 className="fixed top-0 left-0 w-full flex justify-center z-[9999] pointer-events-none"
 style={{ top: 70, paddingTop: 8 }} 
 >
 <div
 className="pointer-events-auto max-w-[700px] w-full bg-white/60 backdrop-blur-lg dark:bg-gray-900/60 border border-gray-200/40 dark:border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm"
 >
 <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 mr-2">Active Filters:</span>
 <div className="flex flex-wrap gap-1">
 {globalFilters.programTypes?.map((type: string) => (
 <FilterBadge
 key={type}
 label="Program"
 value={type}
 onClear={() => dispatch(setgSwagatData({ programTypes: globalFilters.programTypes.filter((t: string) => t !== type) }))}
 color="indigo"
 />
 ))}
 {globalFilters.districts?.map((district: string) => (
 <FilterBadge
 key={district}
 label="District"
 value={district}
 onClear={() => dispatch(setgSwagatData({ districts: globalFilters.districts.filter((d: string) => d !== district) }))}
 color="blue"
 />
 ))}
 {globalFilters.talukas?.map((taluka: string) => (
 <FilterBadge
 key={taluka}
 label="Taluka"
 value={taluka}
 onClear={() => dispatch(setgSwagatData({ talukas: globalFilters.talukas.filter((t: string) => t !== taluka) }))}
 color="cyan"
 />
 ))}
 {globalFilters.departments?.map((dept: string) => (
 <FilterBadge
 key={dept}
 label="Department"
 value={dept}
 onClear={() => dispatch(setgSwagatData({ departments: globalFilters.departments.filter((d: string) => d !== dept) }))}
 color="purple"
 />
 ))}
 {globalFilters.grievanceStatuses?.map((status: string) => (
 <FilterBadge
 key={status}
 label="Status"
 value={status}
 onClear={() => dispatch(setgSwagatData({ grievanceStatuses: globalFilters.grievanceStatuses.filter((s: string) => s !== status) }))}
 color="amber"
 />
 ))}
 {globalFilters.subStatuses?.map((subStatus: string) => (
 <FilterBadge
 key={subStatus}
 label="Sub-Status"
 value={subStatus}
 onClear={() => dispatch(setgSwagatData({ subStatuses: globalFilters.subStatuses.filter((s: string) => s !== subStatus) }))}
 color="rose"
 />
 ))}
 {globalFilters.disposeChannels?.map((channel: string) => (
 <FilterBadge
 key={channel}
 label="Dispose Channel"
 value={channel}
 onClear={() => dispatch(setgSwagatData({ disposeChannels: globalFilters.disposeChannels.filter((c: string) => c !== channel) }))}
 color="green"
 />
 ))}
 
 {/* Page-level Filters */}
 {filters.departmentName && (
 <FilterBadge
 label="Department"
 value={filters.departmentName}
 onClear={() => updateFilter('departmentName', null)}
 color="blue"
 />
 )}
 {filters.district && (
 <FilterBadge
 label="District"
 value={filters.district}
 onClear={() => updateFilter('district', null)}
 color="purple"
 />
 )}
 {filters.forwardedToDesignation && (
 <FilterBadge
 label="Designation"
 value={filters.forwardedToDesignation}
 onClear={() => updateFilter('forwardedToDesignation', null)}
 color="emerald"
 />
 )}
 {filters.subjectCategory && (
 <FilterBadge
 label="Subject"
 value={filters.subjectCategory}
 onClear={() => updateFilter('subjectCategory', null)}
 color="amber"
 />
 )}
 {filters.levelNo !== null && (
 <FilterBadge
 label="Level"
 value={`Level ${filters.levelNo}`}
 onClear={() => updateFilter('levelNo', null)}
 color="rose"
 />
 )}
 </div>
 <button
 onClick={clearFilters}
 className="ml-auto px-2 py-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-800 transition-all"
 >
 ✕ Clear
 </button>
 </div>
 </div>
 );
}