//@ts-nocheck
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setgSwagatData } from '../../redux/features/globalfilters';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart, HeatmapChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DatasetComponent,
    VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';
import { buildDrillThroughUrl } from '../../utils/drillthrough';
import { CHART_COLORS } from '../../utils/colorPalette';
import GlobalFilterButton from '../../components/common/GlobalFilterButton';

echarts.use([
    PieChart,
    HeatmapChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DatasetComponent,
    VisualMapComponent,
    CanvasRenderer
]);

const GET_PAGE4_DASHBOARD = gql`
 query GetPage4Dashboard(
 $programTypes: [String!]
 $district: String
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $levelNo: Int
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage4(
 programTypes: $programTypes
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 levelNo: $levelNo
 fromDate: $fromDate
 toDate: $toDate
 ) {
 kpi {
 totalGrievances
 avgDisposalDays
 selectedProgramTypes
 }
 pieChart {
 subStatusName
 totalCount
 avgDisposalDays
 percentage
 }
 levelDistribution {
 levelNo
 totalCount
 percentage
 }
 heatmap {
 district
 departmentName
 count
 avgDisposalDays
 }
 }
 }
`;

interface FilterState {
    programTypes: string[];
    subStatusName: string | null;
    district: string | null;
    departmentName: string | null;
    levelNo: number | null;
    disposedPending: 'disposed' | 'pending' | null;
}

interface SubStatusPieData {
    subStatusName: string;
    totalCount: number;
    avgDisposalDays: number;
    percentage: number;
}

interface LevelDistributionData {
    levelNo: number;
    totalCount: number;
    percentage: number;
}

interface HeatmapCell {
    district: string;
    departmentName: string;
    count: number;
    avgDisposalDays: number;
}

export default function PositiveDisposeComponent() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const globalFilters = useAppSelector((state) => state.gSwagat);
    const pieChartRef = useRef<any>(null);
    const heatmapChartRef = useRef<any>(null);


    const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);


    const { filters: globalFilterValues } = useGlobalFilters();

    const [filters, setFilters] = useState<FilterState>({
        programTypes: [],
        subStatusName: null,
        district: null,
        departmentName: null,
        levelNo: null,
        disposedPending: null
    });

    const [heatmapLimit, setHeatmapLimit] = useState<number>(-10);

    const mergedFilters = useMemo(() => ({
        ...globalFilterValues,
        ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) =>
                value !== null && (Array.isArray(value) ? value.length > 0 : true)
            )
        )
    }), [globalFilterValues, filters]);

    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        data: { name: string; value: number } | null;
        filterKey: 'subStatusName' | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        data: null,
        filterKey: null
    });

    const handleContextMenu = useCallback((params: any, filterKey: 'subStatusName') => {
        const event = params.event?.event || params.event;
        const x = event?.clientX || event?.pageX || 0;
        const y = event?.clientY || event?.pageY || 0;

        setContextMenu({
            visible: true,
            x,
            y,
            data: {
                name: params.name,
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
            sourcePage: 'sub-status-analysis',
        };

        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'disposedPending' && value) {
                drillThroughContext['grievanceStatus'] = value;
            } else if (value !== null && (Array.isArray(value) ? value.length > 0 : true)) {
                drillThroughContext[key] = value;
            }
        });

        const clickedValue = contextMenu.data.name;
        const clickedKey = contextMenu.filterKey;
        drillThroughContext[clickedKey] = clickedValue;

        const url = buildDrillThroughUrl(drillThroughContext);
        navigate(url);
        closeContextMenu();
    }, [contextMenu.data, contextMenu.filterKey, filters, closeContextMenu, navigate]);

    useEffect(() => {
        const handleContextMenuEvent = (e: MouseEvent) => {
            if (contextMenu.visible) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenuEvent, { passive: false });
        return () => document.removeEventListener('contextmenu', handleContextMenuEvent);
    }, [contextMenu.visible]);

    const { data, loading, error } = useQuery(GET_PAGE4_DASHBOARD, {
        variables: {
            programTypes: mergedFilters.programTypes && mergedFilters.programTypes.length > 0 ? mergedFilters.programTypes : null,
            district: mergedFilters.district,
            taluka: mergedFilters.taluka,
            departmentName: mergedFilters.departmentName,
            disposeChnl: mergedFilters.disposeChnl,
            grievanceStatus: filters.disposedPending || mergedFilters.grievanceStatus,
            subStatusName: mergedFilters.subStatusName || null,
            levelNo: filters.levelNo,
            fromDate,
            toDate
        },
        fetchPolicy: 'cache-and-network'
    });

    const processedHeatmapData = useMemo(() => {
        const rawData = data?.dashboardPage4?.heatmap || [];
        if (rawData.length === 0) return [];

        const districtTotals = new Map<string, number>();
        const departmentTotals = new Map<string, number>();

        rawData.forEach((cell: HeatmapCell) => {
            districtTotals.set(
                cell.district,
                (districtTotals.get(cell.district) || 0) + cell.count
            );
            departmentTotals.set(
                cell.departmentName,
                (departmentTotals.get(cell.departmentName) || 0) + cell.count
            );
        });

        const sortedDistricts = Array.from(districtTotals.entries())
            .sort((a, b) => b[1] - a[1]);
        const sortedDepartments = Array.from(departmentTotals.entries())
            .sort((a, b) => b[1] - a[1]);


        let selectedDistricts: Set<string>;
        let selectedDepartments: Set<string>;

        if (heatmapLimit < 0) {

            selectedDistricts = new Set(sortedDistricts.slice(0, 10).map(d => d[0]));
            selectedDepartments = new Set(sortedDepartments.slice(0, 10).map(d => d[0]));
        } else {

            selectedDistricts = new Set(sortedDistricts.slice(-10).map(d => d[0]));
            selectedDepartments = new Set(sortedDepartments.slice(-10).map(d => d[0]));
        }

        return rawData.filter((cell: HeatmapCell) =>
            selectedDistricts.has(cell.district) && selectedDepartments.has(cell.departmentName)
        );
    }, [data?.dashboardPage4?.heatmap, heatmapLimit]);

    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const toggleProgramTypes = (type: string) => {
        const currentTypes = [...filters.programTypes];
        const index = currentTypes.indexOf(type);

        if (index > -1) {
            currentTypes.splice(index, 1);
        } else {
            currentTypes.push(type);
        }

        updateFilter('programTypes', currentTypes);
    };

    const handleSubStatusClick = (subStatus: string) => {
        if (filters.subStatusName === subStatus) {
            updateFilter('subStatusName', null);
        } else {
            updateFilter('subStatusName', subStatus);
        }
    };

    const handleHeatmapClick = (district: string, departmentName: string) => {
        const isDistrictActive = filters.district === district;
        const isDepartmentActive = filters.departmentName === departmentName;

        if (isDistrictActive && isDepartmentActive) {

            setFilters({ ...filters, district: null, departmentName: null });
        } else {

            setFilters({ ...filters, district, departmentName });
        }
    };

    const handleLevelClick = (levelNo: number) => {
        if (filters.levelNo === levelNo) {
            updateFilter('levelNo', null);
        } else {
            updateFilter('levelNo', levelNo);
        }
    };

    const handleDisposedPendingChange = (value: 'disposed' | 'pending' | null) => {
        updateFilter('disposedPending', value);
    };

    const clearFilters = () => {
        setFilters({
            programTypes: [],
            subStatusName: null,
            district: null,
            departmentName: null,
            levelNo: null,
            disposedPending: null
        });

        // Also clear global filters
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

    if (error) {
        return (
            <div className="min-h-screen bg-white/80 backdrop-blur-sm dark:bg-gray-900 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                            Error Loading Dashboard
                        </h2>
                        <p className="text-red-600 dark:text-red-400">{error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-white/80 backdrop-blur-sm dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const dashboardData = data?.dashboardPage4;

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-white/80 backdrop-blur-sm dark:bg-gray-900 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                        <p className="text-yellow-800 dark:text-yellow-200">No data available</p>
                    </div>
                </div>
            </div>
        );
    }

    const kpi = dashboardData.kpi;
    const pieChartData: SubStatusPieData[] = dashboardData.pieChart || [];
    const heatmapData = processedHeatmapData;

    const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
        key === 'programTypes' ? (Array.isArray(value) && value.length > 0) : value !== null
    ) ||
        globalFilters?.programTypes?.length > 0 ||
        globalFilters?.districts?.length > 0 ||
        globalFilters?.talukas?.length > 0 ||
        globalFilters?.departments?.length > 0 ||
        globalFilters?.grievanceStatuses?.length > 0 ||
        globalFilters?.subStatuses?.length > 0 ||
        globalFilters?.disposeChannels?.length > 0;

    return (
        <div className="min-h-screen bg-white/80 backdrop-blur-sm dark:bg-gray-900 p-4">
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium transition-all border border-red-200 dark:border-red-800 shadow-sm"
                        >
                            ✕ Clear All Filters
                        </button>
                    )}
                </div>
                <div className="mb-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-white/80 via-white/60 to-white/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Program Type
                        </span>
                        {['GS', 'TS', 'DS', 'LF', 'RLF', 'WTC'].map((type) => {
                            const colorMap = {
                                'GS': 'from-blue-500 to-indigo-600 shadow-blue-500/25',
                                'TS': 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
                                'DS': 'from-cyan-400 to-blue-500 shadow-cyan-500/25',
                                'LF': 'from-orange-500 to-amber-600 shadow-orange-500/25',
                                'RLF': 'from-rose-500 to-pink-600 shadow-rose-500/25',
                                'WTC': 'from-violet-500 to-purple-600 shadow-violet-500/25'
                            };
                            const isActive = (filters.programTypes || []).includes(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleProgramTypes(type)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden shadow-sm ${isActive
                                        ? `bg-gradient-to-r ${colorMap[type]} text-white shadow-lg transform scale-105`
                                        : 'bg-white/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 backdrop-blur-sm'
                                        }`}
                                >
                                    <div className={`absolute inset-0 bg-white/20 dark:bg-white/10 translate-y-full transition-transform duration-300 ${isActive ? 'group-hover:translate-y-0' : ''}`} />
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                    <DateRangeFilter />
                </div>

                {hasActiveFilters && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-white/80 via-white/60 to-white/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-gray-700/50 shadow-sm">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-semibold">Active Filters:</p>
                            <div className="flex flex-wrap gap-2">
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
                                {filters.programTypes && filters.programTypes.length > 0 && filters.programTypes.map((type: string) => (
                                    <FilterBadge
                                        key={type}
                                        label="Program Type"
                                        value={type}
                                        onClear={() => {
                                            const newTypes = filters.programTypes.filter((t: string) => t !== type);
                                            updateFilter('programTypes', newTypes.length > 0 ? newTypes : []);
                                        }}
                                        color="purple"
                                    />
                                ))}
                                {filters.subStatusName && (
                                    <FilterBadge
                                        label="Sub Status"
                                        value={filters.subStatusName}
                                        onClear={() => updateFilter('subStatusName', null)}
                                        color="orange"
                                    />
                                )}
                                {filters.district && (
                                    <FilterBadge
                                        label="District"
                                        value={filters.district}
                                        onClear={() => updateFilter('district', null)}
                                        color="green"
                                    />
                                )}
                                {filters.departmentName && (
                                    <FilterBadge
                                        label="Department"
                                        value={filters.departmentName}
                                        onClear={() => updateFilter('departmentName', null)}
                                        color="blue"
                                    />
                                )}
                                {filters.levelNo !== null && (
                                    <FilterBadge
                                        label="Level"
                                        value={`Level ${filters.levelNo}`}
                                        onClear={() => updateFilter('levelNo', null)}
                                        color="purple"
                                    />
                                )}
                                {filters.disposedPending && (
                                    <FilterBadge
                                        label="Status"
                                        value={filters.disposedPending}
                                        onClear={() => updateFilter('disposedPending', null)}
                                        color="green"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="relative group overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-600 dark:text-blue-400">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Total Grievances
                            </p>
                            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {kpi.totalGrievances.toLocaleString()}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                                All sub-status records
                            </p>
                        </div>
                    </div>

                    <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-600 dark:text-emerald-400">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Avg Disposal Days
                            </p>
                            <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                {kpi.avgDisposalDays.toFixed(1)}
                            </h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                                Average time to resolve
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="relative bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Sub-Status Distribution
                        </h2>

                        <div className="mb-4 flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDisposedPendingChange(filters.disposedPending === 'Disposed' ? null : 'Disposed')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.disposedPending === 'Disposed'
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : 'bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Disposed
                                </button>
                                <button
                                    onClick={() => handleDisposedPendingChange(filters.disposedPending === 'Pending' ? null : 'Pending')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filters.disposedPending === 'Pending'
                                        ? 'bg-orange-600 text-white shadow-sm'
                                        : 'bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Pending
                                </button>
                            </div>
                        </div>

                        <div style={{ height: '500px' }} className="chart-container">
                            <SubStatusPieChart
                                data={pieChartData}
                                chartRef={pieChartRef}
                                onSubStatusClick={handleSubStatusClick}
                                selectedSubStatus={filters.subStatusName}
                                onContextMenu={handleContextMenu}
                            />
                        </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Level Distribution
                        </h2>
                        <div className="overflow-y-auto" style={{ maxHeight: '560px' }}>
                            <LevelDistributionTable
                                data={dashboardData.levelDistribution || []}
                                onLevelClick={handleLevelClick}
                                selectedLevel={filters.levelNo}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">

                    <div className="relative bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {heatmapLimit > 0 ? 'Bottom' : 'Top'} 10 District × Department
                                {filters.subStatusName && (
                                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                                        (Filtered by: {filters.subStatusName})
                                    </span>
                                )}
                            </h2>
                            <select
                                value={heatmapLimit}
                                onChange={(e) => setHeatmapLimit(Number(e.target.value))}
                                className="px-3 py-1.5 text-sm bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900 dark:text-white"
                            >
                                <option value={-10}>Top 10</option>
                                <option value={10}>Bottom 10</option>
                            </select>
                        </div>
                        <div style={{ height: '500px' }} className="chart-container">
                            <DistrictDepartmentHeatmap
                                data={heatmapData}
                                chartRef={heatmapChartRef}
                                onHeatmapClick={handleHeatmapClick}
                                selectedDistrict={filters.district}
                                selectedDepartment={filters.departmentName}
                                onContextMenu={handleContextMenu}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <GlobalFilterButton />
        </div>
    );
}

function FilterBadge({ label, value, onClear, color }: any) {
    const colorClasses = {
        indigo: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700',
        purple: 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700',
        amber: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
        rose: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700',
        orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${colorClasses[color]}`}>
            <span className="font-semibold">{label}:</span>
            <span>{value}</span>
            <button
                onClick={onClear}
                className="ml-1 hover:bg-white/50 dark:hover:bg-black/20 rounded-full p-0.5 transition-colors"
            >
                ✕
            </button>
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
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [visible, onClose]);

    if (!visible || !data) return null;

    const menuWidth = 220;
    const menuHeight = 160;
    const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
    const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                left: `${adjustedX}px`,
                top: `${adjustedY}px`,
                zIndex: 9999
            }}
            className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[220px]"
        >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 backdrop-blur-sm dark:bg-gray-900/50">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {filterKey?.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={data.name}>
                    {data.name}
                </div>
            </div>

            <div className="py-1">
                <button
                    onClick={onDrillThrough}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                >
                    <span className="text-blue-500">🔍</span>
                    <span>Drill Through Details</span>
                </button>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                    <span>✕</span>
                    <span>Close</span>
                </button>
            </div>
        </div>
    );
});

function SubStatusPieChart({ data, chartRef, onSubStatusClick, selectedSubStatus, onContextMenu }: any) {
    const pieData = data.map((item: SubStatusPieData) => ({
        name: item.subStatusName,
        value: item.totalCount,
        percentage: item.percentage,
        avgDays: item.avgDisposalDays
    }));

    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#000000',
            borderWidth: 1,
            textStyle: { color: '#475569' },
            formatter: (params: any) => {
                return `
                <div style="padding: 8px;">
                    <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #1e293b;">
                        ${params.name}
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 4px;">
                        <span style="color: #64748b;">Count:</span>
                        <span style="font-weight: 600; color: #0f172a;">${params.value.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 4px;">
                        <span style="color: #64748b;">Percentage:</span>
                        <span style="font-weight: 600; color: #0f172a;">${params.data.percentage.toFixed(1)}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 20px;">
                        <span style="color: #64748b;">Avg Days:</span>
                        <span style="font-weight: 600; color: #0f172a;">${params.data.avgDays.toFixed(1)}</span>
                    </div>
                </div>
                `;
            }
        },
        legend: {
            orient: 'vertical',
            right: '5%',
            show: false,
            top: 'center',
            textStyle: {
                color: '#64748b',
                fontSize: 11
            },
            formatter: (name: string) => {
                const item = pieData.find((d: any) => d.name === name);
                return `${name} (${item?.percentage?.toFixed(1)}%)`;
            }
        },
        series: [
            {
                name: 'Sub Status',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: (params: any) => {
                        const name = params.name;
                        const percentage = params.percent.toFixed(1);
                        // Truncate long names to prevent wrapping
                        const maxLength = 20;
                        const truncatedName = name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
                        return `{name | ${truncatedName}}\n{percent | ${percentage}%}`;
                    },
                    fontSize: 11,
                    lineHeight: 16,
                    rich: {
                        name: {
                            color: '#475569',
                            fontSize: 11,
                            fontWeight: 500
                        },
                        percent: {
                            color: '#64748b',
                            fontSize: 10,
                            fontWeight: 600
                        }
                    },
                    overflow: 'truncate',
                    width: 100
                },
                labelLine: {
                    show: true,
                    length: 15,
                    length2: 10,
                    smooth: true,
                    lineStyle: {
                        width: 1.5
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 13,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                data: pieData.map((item: any, index: number) => ({
                    ...item,
                    itemStyle: {
                        color: item.name === selectedSubStatus ? CHART_COLORS.primaryHover : CHART_COLORS.multiCategory[index % CHART_COLORS.multiCategory.length],
                        borderWidth: item.name === selectedSubStatus ? 4 : 2,
                        shadowBlur: item.name === selectedSubStatus ? 15 : 0,
                        shadowColor: item.name === selectedSubStatus ? `${CHART_COLORS.primary}80` : 'transparent'
                    }
                }))
            }
        ]
    };

    const onEvents = {
        click: (params: any) => {
            onSubStatusClick(params.name);
        },
        contextmenu: (params: any) => {
            params.event.event.preventDefault();
            onContextMenu(params, 'subStatusName');
        }
    };

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
}

function DistrictDepartmentHeatmap({ data, chartRef, onHeatmapClick, selectedDistrict, selectedDepartment, onContextMenu }: any) {

    const districts = [...new Set(data.map((d: HeatmapCell) => d.district))].sort();
    const departments = [...new Set(data.map((d: HeatmapCell) => d.departmentName))].sort();


    const heatmapData = data.map((cell: HeatmapCell) => {
        const districtIndex = districts.indexOf(cell.district);
        const departmentIndex = departments.indexOf(cell.departmentName);
        return [departmentIndex, districtIndex, cell.count];
    });

    const maxCount = Math.max(...heatmapData.map((d: any) => d[2]), 1);

    const option = {
        tooltip: {
            position: 'top',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#000000',
            borderWidth: 1,
            textStyle: { color: '#475569' },
            formatter: (params: any) => {
                const cell = data.find(
                    (d: HeatmapCell) =>
                        d.district === districts[params.value[1]] &&
                        d.departmentName === departments[params.value[0]]
                );
                return `
                <div style="padding: 8px;">
                    <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; color: #1e293b;">
                        ${departments[params.value[0]]}
                    </div>
                    <div style="font-size: 12px; margin-bottom: 6px; color: #475569;">
                        ${districts[params.value[1]]}
                    </div>
                    <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 4px;">
                        <span style="color: #64748b;">Count:</span>
                        <span style="font-weight: 600; color: #0f172a;">${params.value[2].toLocaleString()}</span>
                    </div>
                    ${cell ? `
 <div style="display: flex; justify-content: space-between; gap: 20px;">
 <span style="color: #64748b;">Avg Days:</span>
 <span style="font-weight: 600; color: #0f172a;">${cell.avgDisposalDays.toFixed(1)}</span>
 </div>
 ` : ''}
                </div>
                `;
            }
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '12%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: departments,
            splitArea: {
                show: true
            },
            axisLabel: {
                fontSize: 9,
                color: '#64748b',
                rotate: 45,
                interval: 0
            }
        },
        yAxis: {
            type: 'category',
            data: districts,
            splitArea: {
                show: true
            },
            axisLabel: {
                fontSize: 10,
                color: '#64748b'
            }
        },
        visualMap: {
            min: 0,
            max: maxCount,
            show: false,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '2%',
            inRange: {
                color: ['#e0f2fe', '#7dd3fc', '#0ea5e9', '#0369a1', '#0c4a6e']
            },
            textStyle: {
                color: '#64748b',
                fontSize: 10
            }
        },
        series: [
            {
                name: 'Grievance Count',
                type: 'heatmap',
                data: heatmapData.map((item: any) => {
                    const district = districts[item[1]];
                    const department = departments[item[0]];
                    const isSelected = selectedDistrict === district && selectedDepartment === department;

                    return {
                        value: item,
                        itemStyle: {
                            borderWidth: isSelected ? 4 : 1,
                            borderColor: isSelected ? '#000000' : '#ffffff',
                            shadowBlur: isSelected ? 15 : 0,
                            shadowColor: isSelected ? 'rgba(0, 0, 0, 0.8)' : 'transparent'
                        }
                    };
                }),
                label: {
                    show: true,
                    fontSize: 10,
                    fontWeight: 'bold',
                    formatter: (params: any) => {
                        const value = params.value[2];
                        const intensity = value / maxCount;
                        // Use dark text for light backgrounds (intensity < 0.5), white text for dark backgrounds
                        const textColor = intensity < 0.5 ? '#1e293b' : '#ffffff';
                        return `{${intensity < 0.5 ? 'dark' : 'light'}|${value}}`;
                    },
                    rich: {
                        dark: {
                            color: '#1e293b',
                            fontSize: 10,
                            fontWeight: 'bold'
                        },
                        light: {
                            color: '#ffffff',
                            fontSize: 10,
                            fontWeight: 'bold'
                        }
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    const onEvents = {
        click: (params: any) => {
            const district = districts[params.value[1]];
            const department = departments[params.value[0]];
            onHeatmapClick(district, department);
        },
        contextmenu: (params: any) => {
            params.event.event.preventDefault();

            const modifiedParams = {
                ...params,
                name: districts[params.value[1]],
                value: params.value[2]
            };
            onContextMenu(modifiedParams, 'district');
        }
    };

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
}

function LevelDistributionTable({ data, onLevelClick, selectedLevel }: {
    data: LevelDistributionData[];
    onLevelClick: (levelNo: number) => void;
    selectedLevel: number | null;
}) {
    return (
        <div className="overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Level</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Count</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">%</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={item.levelNo}
                            onClick={() => onLevelClick(item.levelNo)}
                            className={`border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 ${selectedLevel === item.levelNo ? 'bg-blue-100 dark:bg-blue-900/30 font-semibold' : ''
                                }`}
                        >
                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                Level {item.levelNo}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-800 dark:text-gray-200 font-medium">
                                {item.totalCount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                {item.percentage.toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
