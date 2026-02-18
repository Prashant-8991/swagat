//@ts-nocheck
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLazyQuery, useQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate, useLocation } from 'react-router-dom';
import GlobalFilterButton from '../../components/common/GlobalFilterButton';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { TreeNode } from 'primereact/treenode';
import { buildDrillThroughUrl } from '../../utils/drillthrough';
import { CHART_COLORS, PASTEL_COLORS } from '../../utils/colorPalette';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setgSwagatData } from '../../redux/features/globalfilters';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import HierarchySankeyChart from './HierarchySankeyChart';
import OfficerEscalationTable from '../../components/common/OfficerEscalationTable';

echarts.use([
    BarChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DatasetComponent,
    CanvasRenderer
]);

const GET_DASHBOARD_DATA = gql`
 query GetPage3Dashboard(
 $page: Int!
 $pageSize: Int!
 $programTypes: [String!]
 $departmentName: String
 $district: String
 $taluka: String
 $forwardedToDesignation: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $subject: String
 $levelNo: Int
 $escalationBaseLevel: Int
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage3(
 page: $page
 pageSize: $pageSize
 programTypes: $programTypes
 departmentName: $departmentName
 district: $district
 taluka: $taluka
 forwardedToDesignation: $forwardedToDesignation
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 subject: $subject
 levelNo: $levelNo
 escalationBaseLevel: $escalationBaseLevel
 fromDate: $fromDate
 toDate: $toDate
 ) {
 kpi {
 totalCount
 selectedProgramTypes
 avgDisposalDays
 }
 waterfallChart {
 levelNo
 count
 percentage
 }
 subjectTable {
 data {
 subject
 departmentName
 disposeChnl
 daysTakenToDisposeGrievance
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

const GET_DEPARTMENTS = gql`
 query GetDepartments(
 $programTypes: [String!]
 $disposeChnl: String
 $subject: String
 $levelNo: Int
 $fromDate: String
 $toDate: String
 ) {
 hierarchyDepartments(
 programTypes: $programTypes
 disposeChnl: $disposeChnl
 subject: $subject
 levelNo: $levelNo
 fromDate: $fromDate
 toDate: $toDate
 ) {
 levelType
 levelValue
 count
 avgDisposalDays
 hasChildren
 parentValue
 }
 }
`;

const GET_DISTRICTS = gql`
 query GetDistricts(
 $departmentName: String!
 $programTypes: [String!]
 $disposeChnl: String
 $subject: String
 $levelNo: Int
 $fromDate: String
 $toDate: String
 ) {
 hierarchyDistricts(
 departmentName: $departmentName
 programTypes: $programTypes
 disposeChnl: $disposeChnl
 subject: $subject
 levelNo: $levelNo
 fromDate: $fromDate
 toDate: $toDate
 ) {
 levelType
 levelValue
 count
 avgDisposalDays
 hasChildren
 parentValue
 }
 }
`;

const GET_TALUKAS = gql`
 query GetTalukas(
 $departmentName: String!
 $district: String!
 $programTypes: [String!]
 $disposeChnl: String
 $subject: String
 $levelNo: Int
 $fromDate: String
 $toDate: String
 ) {
 hierarchyTalukas(
 departmentName: $departmentName
 district: $district
 programTypes: $programTypes
 disposeChnl: $disposeChnl
 subject: $subject
 levelNo: $levelNo
 fromDate: $fromDate
 toDate: $toDate
 ) {
 levelType
 levelValue
 count
 avgDisposalDays
 hasChildren
 parentValue
 }
 }
`;

const GET_DESIGNATIONS = gql`
 query GetDesignations(
 $departmentName: String!
 $district: String!
 $taluka: String!
 $programTypes: [String!]
 $disposeChnl: String
 $subject: String
 $levelNo: Int
 $fromDate: String
 $toDate: String
 ) {
 hierarchyDesignations(
 departmentName: $departmentName
 district: $district
 taluka: $taluka
 programTypes: $programTypes
 disposeChnl: $disposeChnl
 subject: $subject
 levelNo: $levelNo
 fromDate: $fromDate
 toDate: $toDate
 ) {
 levelType
 levelValue
 count
 avgDisposalDays
 hasChildren
 parentValue
 }
 }
`;

const LEVEL_NAMES: Record<number, string> = {
    0: 'Level 1',
    1: 'Level 1',
    2: 'Level 2',
    3: 'Level 3',
    4: 'Level 4',
    5: 'Level 5',
    6: 'Level 6',
};

const PROGRAM_TYPES = ['GS', 'DS', 'TS', 'LF', 'RLF', 'WTC'];

function ContextMenu({
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
                        <span className="font-semibold text-black dark:text-white">
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
                        <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-200/60 dark:border-gray-600 rounded shadow-sm">
                            ESC
                        </kbd>
                        <span>to close</span>
                    </div>
                </div>
            </div>
        </>
    );
}

function FilterBadge({ label, value, onClear, color }: any) {
    const colorClasses = {
        purple: 'bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
        indigo: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700',
        teal: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
    };

    return (
        <span className={`px-3 py-1.5 rounded-lg text-sm border flex items-center gap-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
            <span className="font-medium">{label}:</span> {value}
            <button
                onClick={onClear}
                className="hover:opacity-75 font-bold ml-1"
            >
                ✕
            </button>
        </span>
    );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
    return (
        <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
                <div className="text-6xl mb-4">{icon}</div>
                <p className="text-lg">{message}</p>
            </div>
        </div>
    );
}

function downloadCsv({ data, columns, filename }: { data: any[], columns: { key: string, label: string }[], filename: string }) {
    const BOM = '\uFEFF';
    const header = columns.map(col => `"${col.label}"`).join(',');
    const rows = data.map(row =>
        columns.map(col => `"${(row[col.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [header, ...rows].join('\r\n');
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function DownloadCsvButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            title="Download CSV"
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            style={{ lineHeight: 0 }}
        >
            <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                <path d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

function KPICards({ kpi, waterfallData, filters }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white relative bg-gradient-to-br dark:from-slate-900/20 dark:to-slate-800/20 transition-transform duration-300 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm">
                <div className="text-sm font-semibold text-black dark:text-white mb-2">
                    Total Grievances
                </div>
                <div className=" text-4xl font-bold text-black dark:text-white mb-1">
                    {kpi.totalCount.toLocaleString()}
                </div>
                <div className="text-xs text-black dark:white">
                    {filters.programTypes.length > 0 ? `Across ${filters.programTypes.length} program types` : 'All program types'}
                </div>
            </div>

            <div className="relative bg-white dark:from-teal-900/20 dark:to-teal-800/20 transition-transform duration-300 dark:border-teal-700/50 rounded-2xl p-5 shadow-sm">
                <div className="text-sm font-semibold text-black dark:text-white mb-2">
                    Avg Disposal Days
                </div>
                <div className="text-4xl font-bold text-black dark:text-white mb-1">
                    {kpi.avgDisposalDays?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-xs  text-black dark:text-white">
                    Days to resolve grievances
                </div>
            </div>

            <div className="relative bg-gradient-to-br bg-white dark:from-blue-900/20 dark:to-blue-800/20 transition-transform duration-300 dark:border-blue-700/50 rounded-2xl p-5 shadow-sm">
                <div className="text-sm font-semibold text-black dark:text-white mb-2">
                    Hierarchy Levels
                </div>
                <div className="text-4xl font-bold text-black dark:text-white mb-1">
                    {waterfallData.length}
                </div>
                <div className="text-xs text-black dark:text-white ">
                    Active processing levels
                </div>
            </div>
        </div>
    );
}

function WaterfallChart({ data, chartRef, onLevelClick, onContextMenu, selectedLevel }: any) {

    const filteredData = [...data].filter(item => {
        const levelName = LEVEL_NAMES[item.levelNo];
        return levelName && levelName.trim() !== '' && item.levelNo !== 0;
    });

    const sortedData = filteredData.sort((a, b) => a.levelNo - b.levelNo);

    const totalCount = sortedData.reduce((sum, item) => sum + item.count, 0);

    let cumulativeSum = 0;
    const waterfallData = sortedData.map((item) => {
        const start = cumulativeSum;
        cumulativeSum += item.count;
        return {
            ...item,
            start,
            end: cumulativeSum
        };
    });

    const categories = [
        ...waterfallData.map(d => `Level ${d.levelNo}`),
        'Total'
    ];

    const helperData = [
        ...waterfallData.map((d, idx) => idx === 0 ? 0 : d.start),
        0
    ];

    const actualData = [
        ...waterfallData.map(d => d.count),
        totalCount
    ];

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#000000',
            borderWidth: 1,
            textStyle: { color: '#475569' },
            formatter: (params: any) => {
                const dataIndex = params[0].dataIndex;

                if (dataIndex === waterfallData.length) {
                    return `<div style="padding: 10px;">
 <div style="font-weight: 700; margin-bottom: 6px; font-size: 15px; color: #059669;">
 Total
 </div>
 <div style="color: #64748b; font-size: 13px;">
 Count: <span style="font-weight: 700; color: #059669;">${totalCount.toLocaleString()}</span>
 </div>
 </div>`;
                }

                const levelData = sortedData[dataIndex];
                return `<div style="padding: 10px;">
 <div style="font-weight: 700; margin-bottom: 6px; font-size: 15px; color: #6D28D9;">
 ${LEVEL_NAMES[levelData.levelNo]}
 </div>
 <div style="color: #64748b; font-size: 13px; margin-bottom: 4px;">
 Count: <span style="font-weight: 700; color: #8B5CF6;">${levelData.count.toLocaleString()}</span>
 </div>
 <div style="color: #64748b; fontSize: 13px; margin-bottom: 4px;">
 Percentage: <span style="font-weight: 600;">${levelData.percentage.toFixed(2)}%</span>
 </div>
 <div style="color: #8B5CF6; font-size: 11px; margin-top: 6px; font-style: italic;">
 Right-click to drill through
 </div>
 </div>`;
            }
        },
        legend: {
            data: ['Count'],
            bottom: 10,
            textStyle: { color: '#64748b', fontSize: 12 }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '12%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                fontSize: 11,
                color: '#64748b',
                rotate: 20,
                fontWeight: 500
            },
            axisLine: { lineStyle: { color: '#e2e8f0' } }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                fontSize: 11,
                color: '#64748b',
                formatter: (value: number) => value.toLocaleString()
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(226, 232, 240, 0.5)',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                name: 'Helper',
                type: 'bar',
                stack: 'total',
                itemStyle: {
                    borderColor: 'transparent',
                    color: 'transparent'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: 'transparent',
                        color: 'transparent'
                    }
                },
                data: helperData,
                silent: true
            },
            {
                name: 'Count',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true,
                    position: 'top',
                    formatter: (params: any) => {
                        const dataIndex = params.dataIndex;
                        if (dataIndex === waterfallData.length) {
                            return `${totalCount.toLocaleString()}\n(100%)`;
                        }
                        const levelData = sortedData[dataIndex];
                        return `${levelData.count.toLocaleString()}\n(${levelData.percentage.toFixed(1)}%)`;
                    },
                    fontSize: 11,
                    color: (params: any) => params.dataIndex === waterfallData.length ? PASTEL_COLORS.mint : PASTEL_COLORS.purple,
                    fontWeight: 700,
                    lineHeight: 14
                },
                data: actualData.map((value, idx) => {
                    const isTotal = idx === waterfallData.length;
                    const isSelected = !isTotal && sortedData[idx].levelNo === selectedLevel;

                    return {
                        value,
                        itemStyle: {
                            color: isTotal
                                ? PASTEL_COLORS.mint
                                : isSelected
                                    ? CHART_COLORS.accent
                                    : [PASTEL_COLORS.purple, PASTEL_COLORS.lavender, CHART_COLORS.primary, PASTEL_COLORS.periwinkle, PASTEL_COLORS.lilac][idx % 5],
                            borderRadius: [6, 6, 0, 0],
                            borderWidth: isSelected ? 3 : 2,
                            borderColor: isSelected ? CHART_COLORS.accent : '#ffffff',
                            shadowBlur: isSelected ? 10 : 0,
                            shadowColor: isSelected ? `${CHART_COLORS.accent}80` : 'transparent'
                        }
                    };
                }),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: `${CHART_COLORS.accent}80`
                    }
                },
                barMaxWidth: 80
            }
        ]
    };

    const onEvents = {
        click: (params: any) => {
            const dataIndex = params.dataIndex;
            if (dataIndex < waterfallData.length) {
                const levelNo = sortedData[dataIndex].levelNo;
                onLevelClick(levelNo);
            }
        },
        contextmenu: (params: any) => {
            const dataIndex = params.dataIndex;
            if (dataIndex < waterfallData.length && params.componentType === 'series') {
                params.event.event.preventDefault();
                params.event.event.stopPropagation();
                const levelData = sortedData[dataIndex];
                onContextMenu({
                    name: LEVEL_NAMES[levelData.levelNo],
                    value: levelData.count,
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
            lazyUpdate={true}
        />
    );
}

function HierarchyTreeTable({
    treeData,
    expandedKeys,
    setExpandedKeys,
    onExpand,
    onNodeClick,
    onContextMenu,
    filters,
    loading
}: any) {
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-500"></div>
            </div>
        );
    }

    if (treeData.length === 0) {
        return <EmptyState icon="🌳" message="No hierarchy data available for selected filters" />;
    }

    return (
        <div className="overflow-x-auto hierarchy-table">
            <TreeTable
                value={treeData}
                expandedKeys={expandedKeys}
                onToggle={(e) => setExpandedKeys(e.value)}
                onExpand={onExpand}
                className="p-treetable-sm"
                scrollable
                scrollHeight="900px"
                style={{ minWidth: '500px' }}
            >
                <Column
                    field="name"
                    header="Name"
                    expander
                    style={{ width: '300px' }}
                    body={(node) => {
                        const isSelected =
                            (node.data.name === filters.departmentName) ||
                            (node.data.name === filters.district) ||
                            (node.data.name === filters.taluka) ||
                            (node.data.name === filters.forwardedToDesignation);

                        let filterKey: any = 'departmentName';
                        const key = node.key;
                        if (key.includes('-dist-') && !key.includes('-tal-')) {
                            filterKey = 'district';
                        } else if (key.includes('-tal-') && !key.includes('-desig-')) {
                            filterKey = 'taluka';
                        } else if (key.includes('-desig-')) {
                            filterKey = 'forwardedToDesignation';
                        }

                        return (
                            <span
                                onClick={() => onNodeClick(node)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    onContextMenu({
                                        name: node.data.name,
                                        value: node.data.count,
                                        event: { event: e }
                                    }, filterKey);
                                }}
                                className={`font-semibold cursor-pointer hover:text-red-600 transition-colors ${isSelected
                                    ? 'text-red-600 dark:text-slate-300 underline'
                                    : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                title="Click to filter, right-click to drill through"
                            >
                                {node.data.name}
                            </span>
                        );
                    }}
                />
                <Column
                    field="count"
                    header="Count"
                    style={{ width: '150px', textAlign: 'right' }}
                    body={(node) => (
                        <span className="font-bold text-black dark:text-white">
                            {node.data.count.toLocaleString()}
                        </span>
                    )}
                />
                <Column
                    field="avgDisposalDays"
                    header="Avg Disposal Days"
                    style={{ width: '200px', textAlign: 'right' }}
                    body={(node) => (
                        <span className="text-gray-700 dark:text-gray-300">
                            {node.data.avgDisposalDays !== null && node.data.avgDisposalDays !== undefined
                                ? node.data.avgDisposalDays.toFixed(1)
                                : 'N/A'}
                        </span>
                    )}
                />
            </TreeTable>
        </div>
    );
}

function SubjectTable({
    subjects,
    currentPage,
    pageSize,
    subjectTable,
    filters,
    onSubjectClick,
    onContextMenu,
    setCurrentPage
}: any) {
    return (
        <div>
            <div className="overflow-x-auto subject-table">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700/50 border-b-2 border-gray-200/30 dark:border-gray-600 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Department</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Disposal Channel</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Disposal Days</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Count</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {subjects.length > 0 ? (
                            subjects.map((subject, idx) => (
                                <tr
                                    key={`${subject.subject}-${idx}`}
                                    onClick={() => onSubjectClick(subject.subject)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        onContextMenu({
                                            name: subject.subject,
                                            value: subject.count,
                                            event: { event: e }
                                        }, 'subject');
                                    }}
                                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${filters.subject === subject.subject
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                                        : ''
                                        }`}
                                    title="Click to filter, right-click to drill through"
                                >
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">
                                        {(currentPage - 1) * pageSize + idx + 1}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                                        {subject.subject}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {subject.departmentName}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {subject.disposeChnl}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-semibold">
                                        {subject.daysTakenToDisposeGrievance}
                                    </td>
                                    <td className="px-4 py-3 text-right text-black dark:text-white font-bold">
                                        {subject.count.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center">
                                    <EmptyState icon="📋" message="No subjects found for selected filters" />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {subjectTable && subjectTable.totalCount > pageSize && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200/40 dark:border-gray-700 pt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, subjectTable.totalCount)} of {subjectTable.totalCount} subjects
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={!subjectTable.hasPreviousPage}
                            className="px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            ← Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            Page {currentPage} of {Math.ceil(subjectTable.totalCount / pageSize)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={!subjectTable.hasNextPage}
                            className="px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 border border-gray-200/60 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LevelWiseComponent() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const globalFilters = useAppSelector((state) => state.gSwagat);
    const waterfallRef = useRef<any>(null);

    const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

    const { filters: globalFilterValues, hasGlobalFilters } = useGlobalFilters();

    const [filters, setFilters] = useState<any>({
        programTypes: [],
        departmentName: null,
        district: null,
        taluka: null,
        forwardedToDesignation: null,
        disposeChnl: null,
        subject: null,
        levelNo: null
    });

    const mergedFilters = useMemo(() => ({
        ...globalFilterValues,
        ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) =>
                value !== null && (Array.isArray(value) ? value.length > 0 : true)
            )
        )
    }), [globalFilterValues, filters]);

    const [currentPage, setCurrentPage] = useState(1);
    const [escalationBaseLevel, setEscalationBaseLevel] = useState(1);
    const pageSize = 10;

    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});

    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        data: { name: string; value: number; parentDept?: string; parentDist?: string; parentTal?: string } | null;
        filterKey: 'departmentName' | 'district' | 'taluka' | 'forwardedToDesignation' | 'subject' | 'levelNo' | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        data: null,
        filterKey: null
    });

    const [viewMode, setViewMode] = useState<'table' | 'sankey'>('sankey');

    const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_DATA, {
        variables: {
            page: currentPage,
            pageSize,
            programTypes: mergedFilters.programTypes && mergedFilters.programTypes.length > 0 ? mergedFilters.programTypes : null,
            departmentName: mergedFilters.departmentName,
            district: mergedFilters.district,
            taluka: mergedFilters.taluka,
            forwardedToDesignation: mergedFilters.forwardedToDesignation,
            disposeChnl: mergedFilters.disposeChnl,
            grievanceStatus: mergedFilters.grievanceStatus,
            subStatusName: mergedFilters.subStatusName && mergedFilters.subStatusName.length > 0 ? mergedFilters.subStatusName : null,
            subject: mergedFilters.subject,
            levelNo: mergedFilters.levelNo,
            escalationBaseLevel: escalationBaseLevel,
            fromDate,
            toDate
        },
        fetchPolicy: 'cache-and-network'
    });

    const apolloClient = useApolloClient();
    const [getDepartments, { data: deptData, loading: deptLoading }] = useLazyQuery(GET_DEPARTMENTS);
    const [getDistricts] = useLazyQuery(GET_DISTRICTS);
    const [getTalukas] = useLazyQuery(GET_TALUKAS);
    const [getDesignations] = useLazyQuery(GET_DESIGNATIONS);


    const isLoadingHierarchyRef = useRef(false);

    useEffect(() => {
        refetch();
    }, [filters, currentPage, refetch, fromDate, toDate]);

    useEffect(() => {
        loadDepartments();
    }, [filters.programTypes, filters.disposeChnl, filters.subject, filters.levelNo, fromDate, toDate]);

    useEffect(() => {
        const handleContextMenuEvent = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.chart-container, .hierarchy-table, .subject-table')) {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleContextMenuEvent);
        return () => document.removeEventListener('contextmenu', handleContextMenuEvent);
    }, []);

    const updateFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };

        if (key === 'departmentName') {
            newFilters.district = null;
            newFilters.taluka = null;
            newFilters.forwardedToDesignation = null;
        }
        if (key === 'district') {
            newFilters.taluka = null;
            newFilters.forwardedToDesignation = null;
        }
        if (key === 'taluka') {
            newFilters.forwardedToDesignation = null;
        }

        setFilters(newFilters);
        setCurrentPage(1);
    };

    const toggleProgramType = (type: string) => {
        const currentTypes = [...filters.programTypes];
        const index = currentTypes.indexOf(type);

        if (index > -1) {
            currentTypes.splice(index, 1);
        } else {
            currentTypes.push(type);
        }

        updateFilter('programTypes', currentTypes);
    };

    const clearFilters = () => {
        setFilters({
            programTypes: [],
            departmentName: null,
            district: null,
            taluka: null,
            forwardedToDesignation: null,
            disposeChnl: null,
            subject: null,
            levelNo: null
        });
        setCurrentPage(1);

        // Clear global filters properly
        dispatch(setgSwagatData({
            ...globalFilters,
            programTypes: [],
            districts: [],
            talukas: [],
            departments: [],
            grievanceStatuses: [],
            subStatuses: [],
            disposeChannels: []
        }));
        setExpandedKeys({});
    };

    const handleContextMenu = (params: any, filterKey: any) => {
        const event = params.event?.event || params.event?.nativeEvent || params.event;
        const x = event?.clientX || event?.pageX || 100;
        const y = event?.clientY || event?.pageY || 100;

        setContextMenu({
            visible: true,
            x,
            y,
            data: {
                name: params.name,
                value: params.value || params.data?.value || params.data || 0,

                parentDept: params.parentDept,
                parentDist: params.parentDist,
                parentTal: params.parentTal
            },
            filterKey
        });
    };

    const closeContextMenu = () => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            data: null,
            filterKey: null
        });
    };

    const handleDrillThrough = () => {
        if (!contextMenu.data || !contextMenu.filterKey) return;

        const drillThroughContext: Record<string, any> = {
            sourcePage: 'hierarchical-pivot',
        };

        Object.entries(mergedFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'programTypes' && Array.isArray(value) && value.length > 0) {
                    drillThroughContext.programTypes = value;
                } else if (key !== 'programTypes') {
                    drillThroughContext[key] = value;
                }
            }
        });

        const clickedValue = contextMenu.data.name;
        const clickedKey = contextMenu.filterKey;

        if (clickedKey === 'levelNo') {
            const levelName = clickedValue;
            let levelNo: number;

            if (levelName === 'District Level' || levelName.includes('District Level')) {
                levelNo = 0;
            } else if (levelName === 'Taluka Level' || levelName.includes('Taluka Level')) {
                levelNo = 1;
            } else if (levelName === 'State Level' || levelName.includes('State Level')) {
                levelNo = 2;
            } else if (levelName === 'Central Level' || levelName.includes('Central Level')) {
                levelNo = 3;
            } else if (levelName === 'Others' || levelName.includes('Others')) {
                levelNo = 4;
            } else {
                const match = levelName.match(/Level\s*(\d+)/i);
                if (match) {
                    levelNo = parseInt(match[1]);
                } else {
                    const numMatch = levelName.match(/\d+/);
                    levelNo = numMatch ? parseInt(numMatch[0]) : 0;
                }
            }

            drillThroughContext.levelNo = levelNo;
        } else if (clickedKey === 'subject') {
            drillThroughContext.subject = clickedValue;
        } else if (clickedKey === 'forwardedToDesignation') {

            const contextDataWithParent = contextMenu.data as any;
            if (contextDataWithParent?.parentDept) {
                drillThroughContext.departmentName = contextDataWithParent.parentDept;
                drillThroughContext.district = contextDataWithParent.parentDist;
                drillThroughContext.taluka = contextDataWithParent.parentTal;
                drillThroughContext.forwardedToDesignation = clickedValue;
            } else {

                const findNodeByName = (nodes: TreeNode[], name: string): TreeNode | null => {
                    for (const node of nodes) {
                        if (node.data.name === name && node.key.includes('-desig-')) {
                            return node;
                        }
                        if (node.children) {
                            const found = findNodeByName(node.children, name);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const designationNode = findNodeByName(treeData, clickedValue);
                if (designationNode) {
                    const parentTalukaKey = designationNode.key.split('-desig-')[0];
                    const findTalukaNode = (nodes: TreeNode[], targetKey: string): TreeNode | null => {
                        for (const n of nodes) {
                            if (n.key === targetKey) return n;
                            if (n.children) {
                                const found = findTalukaNode(n.children, targetKey);
                                if (found) return found;
                            }
                        }
                        return null;
                    };
                    const talukaNode = findTalukaNode(treeData, parentTalukaKey);

                    if (talukaNode) {
                        drillThroughContext.departmentName = talukaNode.data.parentDept;
                        drillThroughContext.district = talukaNode.data.parentDist;
                        drillThroughContext.taluka = talukaNode.data.name;
                        drillThroughContext.forwardedToDesignation = clickedValue;
                    }
                }
            }
        } else if (clickedKey === 'taluka') {


            const contextDataWithParent = contextMenu.data as any;
            if (contextDataWithParent?.parentDept) {
                drillThroughContext.departmentName = contextDataWithParent.parentDept;
                drillThroughContext.district = contextDataWithParent.parentDist;
                drillThroughContext.taluka = clickedValue;
            } else {

                const findNodeByName = (nodes: TreeNode[], name: string): TreeNode | null => {
                    for (const node of nodes) {
                        if (node.data.name === name && node.key.includes('-tal-') && !node.key.includes('-desig-')) {
                            return node;
                        }
                        if (node.children) {
                            const found = findNodeByName(node.children, name);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const talukaNode = findNodeByName(treeData, clickedValue);
                if (talukaNode) {
                    drillThroughContext.departmentName = talukaNode.data.parentDept;
                    drillThroughContext.district = talukaNode.data.parentDist;
                    drillThroughContext.taluka = clickedValue;
                }
            }
        } else if (clickedKey === 'district') {

            const contextDataWithParent = contextMenu.data as any;
            if (contextDataWithParent?.parentDept) {
                drillThroughContext.departmentName = contextDataWithParent.parentDept;
                drillThroughContext.district = clickedValue;
            } else {

                const findNodeByName = (nodes: TreeNode[], name: string): TreeNode | null => {
                    for (const node of nodes) {
                        if (node.data.name === name && node.key.includes('-dist-') && !node.key.includes('-tal-')) {
                            return node;
                        }
                        if (node.children) {
                            const found = findNodeByName(node.children, name);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const districtNode = findNodeByName(treeData, clickedValue);
                if (districtNode) {
                    drillThroughContext.departmentName = districtNode.data.parentDept;
                    drillThroughContext.district = clickedValue;
                }
            }
        } else if (clickedKey === 'departmentName') {
            drillThroughContext.departmentName = clickedValue;
        }

        const url = buildDrillThroughUrl(drillThroughContext);
        navigate(url);
        closeContextMenu();
    };

    const loadDepartments = async () => {
        try {
            const result = await getDepartments({
                variables: {
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                }
            });

            if (result.data?.hierarchyDepartments) {
                const nodes: TreeNode[] = result.data.hierarchyDepartments.map((dept: any) => ({
                    key: `dept-${dept.levelValue}`,
                    data: {
                        name: dept.levelValue,
                        count: dept.count,
                        avgDisposalDays: dept.avgDisposalDays,
                        _dept: dept.levelValue
                    },
                    leaf: !dept.hasChildren,
                    children: []
                }));
                setTreeData(nodes);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('❌ Error loading departments:', err);
        }
    };

    const loadDistricts = async (node: TreeNode) => {
        const departmentName = node.data._dept;

        try {
            const result = await getDistricts({
                variables: {
                    departmentName,
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                }
            });

            if (result.data?.hierarchyDistricts) {
                const children: TreeNode[] = result.data.hierarchyDistricts.map((dist: any) => ({
                    key: `${node.key}-dist-${dist.levelValue}`,
                    data: {
                        name: dist.levelValue,
                        count: dist.count,
                        avgDisposalDays: dist.avgDisposalDays,
                        parentDept: departmentName,
                        _dept: departmentName,
                        _dist: dist.levelValue
                    },
                    leaf: !dist.hasChildren,
                    children: []
                }));

                node.children = children;
                setTreeData([...treeData]);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('❌ Error loading districts:', err);
        }
    };

    const loadTalukas = async (node: TreeNode) => {
        const departmentName = node.data._dept;
        const districtName = node.data._dist;

        try {
            const result = await getTalukas({
                variables: {
                    departmentName,
                    district: districtName,
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                }
            });

            if (result.data?.hierarchyTalukas) {
                const children: TreeNode[] = result.data.hierarchyTalukas.map((tal: any) => ({
                    key: `${node.key}-tal-${tal.levelValue}`,
                    data: {
                        name: tal.levelValue,
                        count: tal.count,
                        avgDisposalDays: tal.avgDisposalDays,
                        parentDept: departmentName,
                        parentDist: districtName,
                        _dept: departmentName,
                        _dist: districtName,
                        _tal: tal.levelValue
                    },
                    leaf: !tal.hasChildren,
                    children: []
                }));

                node.children = children;
                setTreeData([...treeData]);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('❌ Error loading talukas:', err);
        }
    };

    const loadDesignations = async (node: TreeNode) => {
        const departmentName = node.data._dept;
        const districtName = node.data._dist;
        const talukaName = node.data._tal;

        try {
            const result = await getDesignations({
                variables: {
                    departmentName,
                    district: districtName,
                    taluka: talukaName,
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                }
            });

            if (result.data?.hierarchyDesignations) {
                const children: TreeNode[] = result.data.hierarchyDesignations.map((desig: any) => ({
                    key: `${node.key}-desig-${desig.levelValue}`,
                    data: {
                        name: desig.levelValue,
                        count: desig.count,
                        avgDisposalDays: desig.avgDisposalDays
                    },
                    leaf: true,
                    children: []
                }));

                node.children = children;
                setTreeData([...treeData]);
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.error('❌ Error loading designations:', err);
        }
    };

    const onExpand = (event: any) => {
        const node = event.node;

        if (!node.children || node.children.length === 0) {
            const key = node.key;

            if (key.startsWith('dept-') && !key.includes('-dist-')) {
                loadDistricts(node);
            } else if (key.includes('-dist-') && !key.includes('-tal-')) {
                loadTalukas(node);
            } else if (key.includes('-tal-') && !key.includes('-desig-')) {
                loadDesignations(node);
            }
        }
    };

    const loadDistrictsForSankey = useCallback(async (deptName: string): Promise<any[]> => {
        try {
            const result = await apolloClient.query({
                query: GET_DISTRICTS,
                variables: {
                    departmentName: deptName,
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                },
                fetchPolicy: 'network-only'
            });
            return result.data?.hierarchyDistricts || [];
        } catch (err) {
            console.error('Error loading districts:', err);
            return [];
        }
    }, [apolloClient, filters.programTypes, filters.disposeChnl, filters.subject, filters.levelNo, fromDate, toDate]);

    const loadTalukasForSankey = useCallback(async (deptName: string, distName: string): Promise<any[]> => {
        try {
            const result = await apolloClient.query({
                query: GET_TALUKAS,
                variables: {
                    departmentName: deptName,
                    district: distName,
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                },
                fetchPolicy: 'network-only'
            });
            return result.data?.hierarchyTalukas || [];
        } catch (err) {
            console.error('Error loading talukas:', err);
            return [];
        }
    }, [apolloClient, filters.programTypes, filters.disposeChnl, filters.subject, filters.levelNo, fromDate, toDate]);

    const loadDesignationsForSankey = useCallback(async (deptName: string, distName: string, talName: string): Promise<any[]> => {
        try {
            const result = await apolloClient.query({
                query: GET_DESIGNATIONS,
                variables: {
                    departmentName: deptName,
                    district: distName,
                    taluka: talName,
                    programTypes: filters.programTypes.length > 0 ? filters.programTypes : null,
                    disposeChnl: filters.disposeChnl,
                    subject: filters.subject,
                    levelNo: filters.levelNo,
                    fromDate,
                    toDate
                },
                fetchPolicy: 'network-only'
            });
            return result.data?.hierarchyDesignations || [];
        } catch (err) {
            console.error('Error loading designations:', err);
            return [];
        }
    }, [apolloClient, filters.programTypes, filters.disposeChnl, filters.subject, filters.levelNo, fromDate, toDate]);

    const handleHierarchyClick = (node: TreeNode) => {
        const key = node.key;
        const name = node.data.name;

        if (key.startsWith('dept-') && !key.includes('-dist-')) {
            if (filters.departmentName === name) {
                updateFilter('departmentName', null);
            } else {
                updateFilter('departmentName', name);
            }
        } else if (key.includes('-dist-') && !key.includes('-tal-')) {
            if (filters.district === name) {
                updateFilter('district', null);
            } else {
                const deptKey = key.split('-dist-')[0];
                const deptNode = treeData.find(n => n.key === deptKey);
                if (deptNode) {
                    setFilters({
                        ...filters,
                        departmentName: deptNode.data.name,
                        district: name,
                        taluka: null,
                        forwardedToDesignation: null
                    });
                }
            }
        } else if (key.includes('-tal-') && !key.includes('-desig-')) {
            if (filters.taluka === name) {
                updateFilter('taluka', null);
            } else {
                const parentDept = node.data.parentDept;
                const parentDist = node.data.parentDist;
                setFilters({
                    ...filters,
                    departmentName: parentDept,
                    district: parentDist,
                    taluka: name,
                    forwardedToDesignation: null
                });
            }
        } else if (key.includes('-desig-')) {
            if (filters.forwardedToDesignation === name) {
                updateFilter('forwardedToDesignation', null);
            } else {
                const parentTalukaKey = key.split('-desig-')[0];
                const findTalukaNode = (nodes: TreeNode[], targetKey: string): TreeNode | null => {
                    for (const n of nodes) {
                        if (n.key === targetKey) return n;
                        if (n.children) {
                            const found = findTalukaNode(n.children, targetKey);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                const talukaNode = findTalukaNode(treeData, parentTalukaKey);
                if (talukaNode) {
                    setFilters({
                        ...filters,
                        departmentName: talukaNode.data.parentDept,
                        district: talukaNode.data.parentDist,
                        taluka: talukaNode.data.name,
                        forwardedToDesignation: name
                    });
                }
            }
        }
    };

    const handleSubjectClick = (subject: string) => {
        if (filters.subject === subject) {
            updateFilter('subject', null);
        } else {
            updateFilter('subject', subject);
        }
    };

    const handleWaterfallClick = (levelNo: number) => {
        if (filters.levelNo === levelNo) {
            updateFilter('levelNo', null);
        } else {
            updateFilter('levelNo', levelNo);
        }
    };

    const handleWaterfallCsv = () => {
        if (!waterfallData?.length) return;
        const columns = [
            { key: 'levelNo', label: 'Level No' },
            { key: 'levelName', label: 'Level Name' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' }
        ];
        const rows = waterfallData.map(d => ({
            ...d,
            levelName: LEVEL_NAMES[d.levelNo] || d.levelNo
        }));
        downloadCsv({ data: rows, columns, filename: 'levelwise_waterfall.csv' });
    };

    const handleHierarchyCsv = () => {
        const flatten = (nodes: TreeNode[], parent: any = {}) => {
            let rows: any[] = [];
            for (const node of nodes) {
                const row = {
                    Name: node.data.name,
                    Count: node.data.count,
                    'Avg Disposal Days': node.data.avgDisposalDays,
                    Department: node.data._dept || parent.Department || '',
                    District: node.data._dist || parent.District || '',
                    Taluka: node.data._tal || parent.Taluka || '',
                    Designation: node.key.includes('-desig-') ? node.data.name : ''
                };
                rows.push(row);
                if (node.children && node.children.length > 0) {
                    rows = rows.concat(flatten(node.children, row));
                }
            }
            return rows;
        };
        const columns = [
            { key: 'Name', label: 'Name' },
            { key: 'Department', label: 'Department' },
            { key: 'District', label: 'District' },
            { key: 'Taluka', label: 'Taluka' },
            { key: 'Designation', label: 'Designation' },
            { key: 'Count', label: 'Count' },
            { key: 'Avg Disposal Days', label: 'Avg Disposal Days' }
        ];
        const rows = flatten(treeData);
        downloadCsv({ data: rows, columns, filename: 'levelwise_hierarchy.csv' });
    };

    const handleSubjectCsv = () => {
        if (!subjects?.length) return;
        const columns = [
            { key: 'subject', label: 'Subject' },
            { key: 'departmentName', label: 'Department' },
            { key: 'disposeChnl', label: 'Disposal Channel' },
            { key: 'daysTakenToDisposeGrievance', label: 'Disposal Days' },
            { key: 'count', label: 'Count' }
        ];
        downloadCsv({ data: subjects, columns, filename: 'levelwise_subjects.csv' });
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900">
                <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl shadow-sm">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Failed to Load Data
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        {error.message}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    const dashboardData = data?.dashboardPage3;

    if (!dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900">
            </div>
        );
    }

    const kpi = dashboardData.kpi;
    const waterfallData = dashboardData.waterfallChart || [];
    const subjectTable = dashboardData.subjectTable;
    const subjects = subjectTable?.data || [];

    const hasActiveFilters = filters.programTypes.length !== 0 ||
        Object.entries(filters).some(([key, value]) => key !== 'programTypes' && value !== null) ||
        globalFilters.programTypes.length > 0 ||
        globalFilters.districts.length > 0 ||
        globalFilters.talukas.length > 0 ||
        globalFilters.departments.length > 0 ||
        globalFilters.grievanceStatuses.length > 0 ||
        globalFilters.subStatuses.length > 0 ||
        globalFilters.disposeChannels.length > 0;

    return (
        <div className="min-h-screen  backdrop-blur-sm dark:bg-gray-900 p-4">
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

                <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mr-1">Program Type:</span>
                        {PROGRAM_TYPES.map((type) => {
                            const colorMap = {
                                'GS': 'from-sky-600 to-sky-700',
                                'TS': 'from-emerald-600 to-emerald-700',
                                'DS': 'from-teal-600 to-teal-700',
                                'LF': 'from-orange-500 to-orange-600',
                                'RLF': 'from-red-500 to-red-600',
                                'WTC': 'from-rose-500 to-rose-600'
                            };
                            const isActive = filters.programTypes.includes(type);
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
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl">
                            <LoadingSpinner />
                        </div>
                    )}
                </div>

                {hasActiveFilters && (
                    <>
                        <div id="active-filters-pane" className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters:</span>
                            {/* Global Filters */}
                            {globalFilters.programTypes?.map((type: string) => (
                                <FilterBadge
                                    key={`global-prog-${type}`}
                                    label="Program"
                                    value={type}
                                    color="indigo"
                                    onClear={() => dispatch(setgSwagatData({ programTypes: globalFilters.programTypes.filter((t: string) => t !== type) }))}
                                />
                            ))}
                            {globalFilters.districts?.map((district: string) => (
                                <FilterBadge
                                    key={`global-dist-${district}`}
                                    label="District"
                                    value={district}
                                    color="blue"
                                    onClear={() => dispatch(setgSwagatData({ districts: globalFilters.districts.filter((d: string) => d !== district) }))}
                                />
                            ))}
                            {globalFilters.talukas?.map((taluka: string) => (
                                <FilterBadge
                                    key={`global-tal-${taluka}`}
                                    label="Taluka"
                                    value={taluka}
                                    color="cyan"
                                    onClear={() => dispatch(setgSwagatData({ talukas: globalFilters.talukas.filter((t: string) => t !== taluka) }))}
                                />
                            ))}
                            {globalFilters.departments?.map((dept: string) => (
                                <FilterBadge
                                    key={`global-dept-${dept}`}
                                    label="Department"
                                    value={dept}
                                    color="purple"
                                    onClear={() => dispatch(setgSwagatData({ departments: globalFilters.departments.filter((d: string) => d !== dept) }))}
                                />
                            ))}
                            {globalFilters.grievanceStatuses?.map((status: string) => (
                                <FilterBadge
                                    key={`global-status-${status}`}
                                    label="Status"
                                    value={status}
                                    color="amber"
                                    onClear={() => dispatch(setgSwagatData({ grievanceStatuses: globalFilters.grievanceStatuses.filter((s: string) => s !== status) }))}
                                />
                            ))}
                            {globalFilters.subStatuses?.map((subStatus: string) => (
                                <FilterBadge
                                    key={`global-substatus-${subStatus}`}
                                    label="Sub-Status"
                                    value={subStatus}
                                    color="rose"
                                    onClear={() => dispatch(setgSwagatData({ subStatuses: globalFilters.subStatuses.filter((s: string) => s !== subStatus) }))}
                                />
                            ))}
                            {globalFilters.disposeChannels?.map((channel: string) => (
                                <FilterBadge
                                    key={`global-channel-${channel}`}
                                    label="Channel"
                                    value={channel}
                                    color="green"
                                    onClear={() => dispatch(setgSwagatData({ disposeChannels: globalFilters.disposeChannels.filter((c: string) => c !== channel) }))}
                                />
                            ))}

                            {/* Page-level Filters */}
                            {filters.programTypes.map((type: string) => (
                                <FilterBadge
                                    key={`page-prog-${type}`}
                                    label="Program"
                                    value={type}
                                    color="indigo"
                                    onClear={() => toggleProgramType(type)}
                                />
                            ))}
                            {filters.departmentName && (
                                <FilterBadge
                                    label="Department"
                                    value={filters.departmentName}
                                    color="purple"
                                    onClear={() => updateFilter('departmentName', null)}
                                />
                            )}
                            {filters.district && (
                                <FilterBadge
                                    label="District"
                                    value={filters.district}
                                    color="blue"
                                    onClear={() => updateFilter('district', null)}
                                />
                            )}
                            {filters.taluka && (
                                <FilterBadge
                                    label="Taluka"
                                    value={filters.taluka}
                                    color="cyan"
                                    onClear={() => updateFilter('taluka', null)}
                                />
                            )}
                            {filters.forwardedToDesignation && (
                                <FilterBadge
                                    label="Designation"
                                    value={filters.forwardedToDesignation}
                                    color="orange"
                                    onClear={() => updateFilter('forwardedToDesignation', null)}
                                />
                            )}
                            {filters.disposeChnl && (
                                <FilterBadge
                                    label="Channel"
                                    value={filters.disposeChnl}
                                    color="green"
                                    onClear={() => updateFilter('disposeChnl', null)}
                                />
                            )}
                            {filters.subject && (
                                <FilterBadge
                                    label="Subject"
                                    value={filters.subject}
                                    color="amber"
                                    onClear={() => updateFilter('subject', null)}
                                />
                            )}
                            {filters.levelNo !== null && (
                                <FilterBadge
                                    label="Level"
                                    value={LEVEL_NAMES[filters.levelNo] || `Level ${filters.levelNo}`}
                                    color="rose"
                                    onClear={() => updateFilter('levelNo', null)}
                                />
                            )}
                        </div>
                        <StickyMiniActiveFilters
                            filters={filters}
                            globalFilters={globalFilters}
                            clearFilters={clearFilters}
                            updateFilter={updateFilter}
                            dispatch={dispatch}
                            toggleProgramType={toggleProgramType}
                        />
                    </>
                )}

                <KPICards kpi={kpi} waterfallData={waterfallData} filters={filters} />
                <div className='grid lg:grid-cols-1 grid-cols-1 gap-2'>
                    <div className="relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 transition-transform duration-300 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Hierarchical Pivot
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${viewMode === 'table'
                                            ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <span>Table</span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('sankey')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${viewMode === 'sankey'
                                            ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <span>Chart</span>
                                    </button>
                                </div>
                                <DownloadCsvButton onClick={handleHierarchyCsv} />
                            </div>
                        </div>
                        {viewMode === 'table' ? (
                            <HierarchyTreeTable
                                treeData={treeData}
                                expandedKeys={expandedKeys}
                                setExpandedKeys={setExpandedKeys}
                                onExpand={onExpand}
                                onNodeClick={handleHierarchyClick}
                                onContextMenu={handleContextMenu}
                                filters={filters}
                                loading={deptLoading}
                            />
                        ) : (
                            <HierarchySankeyChart
                                treeData={treeData}
                                onLoadDistricts={loadDistrictsForSankey}
                                onLoadTalukas={loadTalukasForSankey}
                                onLoadDesignations={loadDesignationsForSankey}
                                onContextMenu={handleContextMenu}
                                loading={deptLoading}
                            />
                        )}
                    </div>

                    <div className="relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 transition-transform duration-300 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm mt-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                Level-wise Distribution
                            </h2>
                            <DownloadCsvButton onClick={handleWaterfallCsv} />
                        </div>
                        <div className="h-[400px] md:h-[500px] chart-container">
                            <WaterfallChart
                                data={waterfallData}
                                chartRef={waterfallRef}
                                onLevelClick={handleWaterfallClick}
                                onContextMenu={(params) => handleContextMenu(params, 'levelNo')}
                                selectedLevel={filters.levelNo}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
                        <div className="lg:col-span-2 relative bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 transition-transform duration-300 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    Subject Breakdown
                                </h2>
                                <DownloadCsvButton onClick={handleSubjectCsv} />
                            </div>
                            <SubjectTable
                                subjects={subjects}
                                currentPage={currentPage}
                                pageSize={pageSize}
                                subjectTable={subjectTable}
                                filters={filters}
                                onSubjectClick={handleSubjectClick}
                                onContextMenu={handleContextMenu}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>
                        <OfficerEscalationTable
                            title="Top 10 Officers"
                            ranks={dashboardData?.officerEscalationRanks || []}
                            baseLevel={escalationBaseLevel}
                            onBaseLevelChange={setEscalationBaseLevel}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
            <GlobalFilterButton />
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-500"></div>
        </div>
    );
}

function StickyMiniActiveFilters({ filters, globalFilters, clearFilters, updateFilter, dispatch, toggleProgramType }: any) {
    const [showSticky, setShowSticky] = useState(false);

    useEffect(() => {
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
                className="pointer-events-auto max-w-[800px] w-full bg-white/60 backdrop-blur-lg dark:bg-gray-900/60 border border-gray-200/40 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Filters:</span>
                    <div className="flex flex-wrap gap-1">
                        {/* Global Filters */}
                        {globalFilters.programTypes?.map((type: string) => (
                            <FilterBadge key={`global-prog-${type}`} label="Program" value={type} color="indigo" onClear={() => dispatch(setgSwagatData({ programTypes: globalFilters.programTypes.filter((t: string) => t !== type) }))} />
                        ))}
                        {globalFilters.districts?.map((d: string) => (
                            <FilterBadge key={`global-dist-${d}`} label="District" value={d} color="blue" onClear={() => dispatch(setgSwagatData({ districts: globalFilters.districts.filter((dist: string) => dist !== d) }))} />
                        ))}
                        {globalFilters.talukas?.map((t: string) => (
                            <FilterBadge key={`global-tal-${t}`} label="Taluka" value={t} color="cyan" onClear={() => dispatch(setgSwagatData({ talukas: globalFilters.talukas.filter((tal: string) => tal !== t) }))} />
                        ))}
                        {globalFilters.departments?.map((d: string) => (
                            <FilterBadge key={`global-dept-${d}`} label="Department" value={d} color="purple" onClear={() => dispatch(setgSwagatData({ departments: globalFilters.departments.filter((dept: string) => dept !== d) }))} />
                        ))}
                        {globalFilters.grievanceStatuses?.map((s: string) => (
                            <FilterBadge key={`global-status-${s}`} label="Status" value={s} color="amber" onClear={() => dispatch(setgSwagatData({ grievanceStatuses: globalFilters.grievanceStatuses.filter((st: string) => st !== s) }))} />
                        ))}
                        {globalFilters.subStatuses?.map((s: string) => (
                            <FilterBadge key={`global-substatus-${s}`} label="Sub-Status" value={s} color="rose" onClear={() => dispatch(setgSwagatData({ subStatuses: globalFilters.subStatuses.filter((st: string) => st !== s) }))} />
                        ))}
                        {globalFilters.disposeChannels?.map((c: string) => (
                            <FilterBadge key={`global-channel-${c}`} label="Channel" value={c} color="green" onClear={() => dispatch(setgSwagatData({ disposeChannels: globalFilters.disposeChannels.filter((ch: string) => ch !== c) }))} />
                        ))}

                        {/* Page-level Filters */}
                        {filters.programTypes && filters.programTypes.length > 0 && filters.programTypes.map((type: string) => (
                            <FilterBadge key={`page-prog-${type}`} label="Program" value={type} color="indigo" onClear={() => toggleProgramType(type)} />
                        ))}
                        {filters.departmentName && (
                            <FilterBadge label="Department" value={filters.departmentName} color="purple" onClear={() => updateFilter('departmentName', null)} />
                        )}
                        {filters.district && (
                            <FilterBadge label="District" value={filters.district} color="blue" onClear={() => updateFilter('district', null)} />
                        )}
                        {filters.taluka && (
                            <FilterBadge label="Taluka" value={filters.taluka} color="cyan" onClear={() => updateFilter('taluka', null)} />
                        )}
                        {filters.forwardedToDesignation && (
                            <FilterBadge label="Designation" value={filters.forwardedToDesignation} color="orange" onClear={() => updateFilter('forwardedToDesignation', null)} />
                        )}
                        {filters.disposeChnl && (
                            <FilterBadge label="Channel" value={filters.disposeChnl} color="green" onClear={() => updateFilter('disposeChnl', null)} />
                        )}
                        {filters.subject && (
                            <FilterBadge label="Subject" value={filters.subject} color="amber" onClear={() => updateFilter('subject', null)} />
                        )}
                        {filters.levelNo !== null && (
                            <FilterBadge label="Level" value={LEVEL_NAMES[filters.levelNo] || `Level ${filters.levelNo}`} color="rose" onClear={() => updateFilter('levelNo', null)} />
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
        </div>
    );
}

