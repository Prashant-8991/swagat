//@ts-nocheck
import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAppSelector } from '../../../../redux/hooks';
import { CHART_COLORS } from '../../../../utils/colorPalette';
import { HiArrowLeft, HiChevronDown } from 'react-icons/hi2';

const GET_TALUKAS_BY_DEPARTMENT = gql`
  query GetTalukasByDepartment(
    $programTypes: [String!]
    $district: String
    $departmentName: String
    $taluka: String
    $disposeChnl: String
    $grievanceStatus: String
    $subStatusName: String
    $subjectCategory: String
    $aiCategory: String
    $month: String
    $fromDate: String
    $toDate: String
  ) {
    dashboardPage2WithForecast(
      programTypes: $programTypes
      district: $district
      departmentName: $departmentName
      taluka: $taluka
      disposeChnl: $disposeChnl
      grievanceStatus: $grievanceStatus
      subStatusName: $subStatusName
      subjectCategory: $subjectCategory
      aiCategory: $aiCategory
      month: $month
      fromDate: $fromDate
      toDate: $toDate
      includeForecast: false
    ) {
      talukas {
        taluka
        district
        count
        percentage
      }
    }
  }
`;

const GET_DEPARTMENTS_BY_TALUKA = gql`
  query GetDepartmentsByTaluka(
    $programTypes: [String!]
    $district: String
    $departmentName: String
    $taluka: String
    $disposeChnl: String
    $grievanceStatus: String
    $subStatusName: String
    $subjectCategory: String
    $aiCategory: String
    $month: String
    $fromDate: String
    $toDate: String
  ) {
    dashboardPage2WithForecast(
      programTypes: $programTypes
      district: $district
      departmentName: $departmentName
      taluka: $taluka
      disposeChnl: $disposeChnl
      grievanceStatus: $grievanceStatus
      subStatusName: $subStatusName
      subjectCategory: $subjectCategory
      aiCategory: $aiCategory
      month: $month
      fromDate: $fromDate
      toDate: $toDate
      includeForecast: false
    ) {
      departments {
        departmentName
        count
        percentage
      }
    }
  }
`;

interface DepartmentData {
    departmentName: string;
    count: number;
    percentage: number;
}

interface TalukaData {
    taluka: string;
    district: string;
    count: number;
    percentage: number;
}

interface DepartmentTalukaChartProps {
    departments: DepartmentData[];
    talukas: TalukaData[];
    onDepartmentClick: (key: string, value: string) => void;
    onDepartmentClear: () => void;
    onTalukaClick: (name: string) => void;
    onContextMenu: (params: any, filterKey: string) => void;
    selectedDepartment: string | null;
    selectedTaluka: string | null;
    baseFilters: {
        programTypes: string[] | null;
        district: string | null;
        subjectCategory: string | null;
        aiCategory: string | null;
        month: string | null;
    };
}

const COLOR_PALETTE = [
    "#2EC7C9", "#B6A2DE", "#5AB1EF", "#FFB980", "#D87A80",
    "#8D98B3", "#E5CF09", "#97B552", "#95706C", "#DC69AA"
];

const DepartmentTalukaChart: React.FC<DepartmentTalukaChartProps> = ({
    departments,
    talukas: talukasProp,
    onDepartmentClick,
    onDepartmentClear,
    onTalukaClick,
    onContextMenu,
    selectedDepartment,
    selectedTaluka,
    baseFilters
}) => {
    const [viewMode, setViewMode] = useState<'dept-taluka' | 'taluka-dept'>('dept-taluka');
    const [drillDownTaluka, setDrillDownTaluka] = useState<string | null>(null);
    const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

    const { data: talukaDataResponse, loading: talukaLoading } = useQuery(GET_TALUKAS_BY_DEPARTMENT, {
        variables: {
            programTypes: baseFilters.programTypes,
            district: baseFilters.district,
            departmentName: selectedDepartment,
            disposeChnl: baseFilters.disposeChnl,
            grievanceStatus: baseFilters.grievanceStatus,
            subStatusName: baseFilters.subStatusName,
            subjectCategory: baseFilters.subjectCategory,
            aiCategory: baseFilters.aiCategory,
            month: baseFilters.month,
            fromDate,
            toDate
        },
        skip: !selectedDepartment || viewMode !== 'dept-taluka'
    });
    const talukaData = talukaDataResponse?.dashboardPage2WithForecast?.talukas || [];

    const { data: departmentDataResponse, loading: departmentLoading } = useQuery(GET_DEPARTMENTS_BY_TALUKA, {
        variables: {
            programTypes: baseFilters.programTypes,
            district: baseFilters.district,
            taluka: drillDownTaluka,
            disposeChnl: baseFilters.disposeChnl,
            grievanceStatus: baseFilters.grievanceStatus,
            subStatusName: baseFilters.subStatusName,
            subjectCategory: baseFilters.subjectCategory,
            aiCategory: baseFilters.aiCategory,
            month: baseFilters.month,
            fromDate,
            toDate
        },
        skip: !drillDownTaluka || viewMode !== 'taluka-dept'
    });
    const departmentsByTaluka = departmentDataResponse?.dashboardPage2WithForecast?.departments || [];
    const sortedDepartments = useMemo(() => {
        return [...departments].sort((a, b) => b.count - a.count);
    }, [departments]);

    const sortedTalukas = useMemo(() => {
        const data = viewMode === 'dept-taluka' ? talukaData : talukasProp;
        return [...data]
            .filter((t) => t.taluka && t.taluka.trim() !== "" && t.taluka.toLowerCase() !== "null")
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }, [talukaData, talukasProp, viewMode]);

    const sortedDepartmentsByTaluka = useMemo(() => {
        return [...departmentsByTaluka].sort((a, b) => b.count - a.count);
    }, [departmentsByTaluka]);

    const departmentTreeMapOptions = useMemo(() => {
        const dataForTreeMap = sortedDepartments.map((item, index) => ({
            value: item.count,
            name: item.departmentName,
            percentage: item.percentage,
            itemStyle: {
                color: CHART_COLORS.multiCategory[index % CHART_COLORS.multiCategory.length],
                borderColor: '#ffffff',
                borderWidth: 2,
                gapWidth: 2
            }
        }));

        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                textStyle: {
                    color: '#475569'
                },
                formatter: (params: any) => {
                    return `
            <div style="padding:8px">
              <div style="font-weight:600; margin-bottom:4px; font-size:14px;">${params.name}</div>
              <div style="color:#64748b; font-size:12px;">Count: <span style="font-weight:600; color:#10B981;">${params.value.toLocaleString()}</span></div>
              <div style="color:#64748b; font-size:12px;">Percentage: <span style="font-weight:600;">${(params.data.percentage ?? 0).toFixed(2)}%</span></div>
              <div style="color:#94a3b8; font-size:11px; margin-top:4px;">Click to view Talukas</div>
            </div>
          `;
                }
            },
            series: [
                {
                    type: 'treemap',
                    name: 'Departments',
                    data: dataForTreeMap,
                    roam: false,
                    nodeClick: false,
                    breadcrumb: { show: false },
                    label: {
                        show: true,
                        formatter: '{b}\n{c}',
                        fontSize: 12,
                        color: '#fff',
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowBlur: 2
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1,
                        borderRadius: 4
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                            opacity: 0.9
                        }
                    },
                    width: '95%',
                    height: '90%',
                    top: 'center',
                    left: 'center'
                }
            ],
            animationDuration: 500,
            animationEasing: 'cubicOut'
        };
    }, [sortedDepartments]);

    const talukaTreeMapOptions = useMemo(() => {
        const dataForTreeMap = sortedTalukas.map((item, index) => {
            const baseColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
            return {
                value: item.count,
                name: item.taluka,
                district: item.district,
                percentage: item.percentage,
                itemStyle: {
                    color: baseColor,
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    borderRadius: 8
                }
            };
        });

        function fontApplier(): number {
            if (window.innerWidth < 640) return 8;
            else if (window.innerWidth < 768) return 10;
            else if (window.innerWidth < 1024) return 11;
            else if (window.innerWidth < 1280) return 12;
            else return 15;
        }
        return {
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "#E5E7EB",
                borderWidth: 1,
                textStyle: { color: "#374151" },
                formatter: (params: any) => {
                    return `
                      <div style="font-weight: 600; margin-bottom: 4px;">
                        ${params.name}
                      </div>
                      <div>Count: ${params.value.toLocaleString()}</div>
                    `;
                },
            },
            series: [
                {
                    name: "Taluka Distribution",
                    type: "treemap",
                    roam: true,
                    nodeClick: false,
                    breadcrumb: { show: false },
                    data: dataForTreeMap,
                    leafDepth: 1,
                    drillDownIcon: "",
                    label: {
                        cursor: "pointer",
                        show: true,
                        position: "inside",
                        formatter: "{b}\n{c}",
                        color: "white",
                        fontWeight: 600,
                        fontSize: fontApplier(),
                        overflow: "break",
                    },
                    itemStyle: {
                        gapWidth: 4,
                        borderRadius: 10,
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 20,
                            shadowColor: `${CHART_COLORS.skyBlue}80`,
                        },
                        label: {
                            fontSize: 14,
                            fontWeight: "bold",
                        },
                    },
                    animationDuration: 800,
                    animationEasing: "cubicOut",
                }
            ]
        };
    }, [sortedTalukas]);

    const departmentEvents = {
        click: (params: any) => {
            if (params.componentType === 'series' && params.name) {
                onDepartmentClick("departmentName", params.name);
            }
        },
        contextmenu: (params: any) => {
            if (params.componentType === 'series' && params.name) {
                params.event.event.preventDefault();
                params.event.event.stopPropagation();
                onContextMenu(params, 'departmentName');
            }
        }
    };

    const talukaEvents = {
        click: (params: any) => {
            if (params.componentType === 'series' && params.name) {
                if (viewMode === 'taluka-dept') {
                    // In taluka-dept mode, clicking taluka drills down AND applies filter
                    setDrillDownTaluka(params.name);
                    onTalukaClick(params.name);
                } else {
                    // In dept-taluka mode, clicking taluka applies filter
                    onTalukaClick(params.name);
                }
            }
        },
        contextmenu: (params: any) => {
            if (params.componentType === 'series' && params.name) {
                params.event.event.preventDefault();
                params.event.event.stopPropagation();
                onContextMenu(params, 'taluka');
            }
        }
    };

    const departmentByTalukaEvents = {
        click: (params: any) => {
            if (params.componentType === 'series' && params.name) {
                // In taluka-dept mode, clicking department applies filter
                onDepartmentClick("departmentName", params.name);
            }
        },
        contextmenu: (params: any) => {
            if (params.componentType === 'series' && params.name) {
                params.event.event.preventDefault();
                params.event.event.stopPropagation();
                onContextMenu(params, 'departmentName');
            }
        }
    };

    const ViewModeDropdown = () => (
        <div className="relative inline-block">
            <select
                value={viewMode}
                onChange={(e) => {
                    setViewMode(e.target.value as 'dept-taluka' | 'taluka-dept');
                    setDrillDownTaluka(null);
                }}
                className="appearance-none px-4 py-2 pr-8 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="dept-taluka">Department → Taluka</option>
                <option value="taluka-dept">Taluka → Department</option>
            </select>
            <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    );

    if ((selectedDepartment && talukaLoading && viewMode === 'dept-taluka') || (drillDownTaluka && departmentLoading && viewMode === 'taluka-dept')) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <ViewModeDropdown />
                    <span className="text-slate-600 font-medium">
                        Loading {viewMode === 'dept-taluka' ? 'talukas' : 'departments'}...
                    </span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (viewMode === 'dept-taluka' && selectedDepartment) {
        if (talukaData.length > 0) {
            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onDepartmentClear}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <span className="text-slate-600 font-medium text-sm">
                                Top Talukas in <span className="text-indigo-600 font-semibold">{selectedDepartment}</span>
                            </span>
                        </div>
                        <ViewModeDropdown />
                    </div>
                    <div className="flex-1">
                        <ReactECharts
                            option={talukaTreeMapOptions}
                            onEvents={talukaEvents}
                            style={{ height: '100%', width: '100%', cursor: 'pointer' }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </div>
                </div>
            );
        } else if (!talukaLoading) {
            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={onDepartmentClear}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                            <HiArrowLeft className="w-4 h-4" />
                            Back to Departments
                        </button>
                        <ViewModeDropdown />
                    </div>
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <div className="text-5xl mb-3">📍</div>
                            <p className="text-base">No taluka data available for {selectedDepartment}</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (viewMode === 'taluka-dept' && drillDownTaluka) {
        const departmentTreeMapOptions = useMemo(() => {
            const dataForTreeMap = sortedDepartmentsByTaluka.map((item, index) => ({
                value: item.count,
                name: item.departmentName,
                percentage: item.percentage,
                itemStyle: {
                    color: CHART_COLORS.multiCategory[index % CHART_COLORS.multiCategory.length],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    gapWidth: 2
                }
            }));

            return {
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    textStyle: { color: '#475569' },
                    formatter: (params: any) => {
                        return `
                            <div style="padding:8px">
                              <div style="font-weight:600; margin-bottom:4px; font-size:14px;">${params.name}</div>
                              <div style="color:#64748b; font-size:12px;">Count: <span style="font-weight:600; color:#10B981;">${params.value.toLocaleString()}</span></div>
                              <div style="color:#64748b; font-size:12px;">Percentage: <span style="font-weight:600;">${(params.data.percentage ?? 0).toFixed(2)}%</span></div>
                            </div>
                          `;
                    }
                },
                series: [{
                    type: 'treemap',
                    name: 'Departments',
                    data: dataForTreeMap,
                    roam: false,
                    nodeClick: false,
                    breadcrumb: { show: false },
                    label: {
                        show: true,
                        formatter: '{b}\n{c}',
                        fontSize: 12,
                        color: '#fff',
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(0,0,0,0.3)',
                        textShadowBlur: 2
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1,
                        borderRadius: 4
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                            opacity: 0.9
                        }
                    },
                    width: '95%',
                    height: '90%',
                    top: 'center',
                    left: 'center'
                }]
            };
        }, [sortedDepartmentsByTaluka]);

        if (departmentsByTaluka.length > 0) {
            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDrillDownTaluka(null)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <span className="text-slate-600 font-medium text-sm">
                                Departments in <span className="text-indigo-600 font-semibold">{drillDownTaluka}</span>
                            </span>
                        </div>
                        <ViewModeDropdown />
                    </div>
                    <div className="flex-1">
                        <ReactECharts
                            option={departmentTreeMapOptions}
                            onEvents={departmentByTalukaEvents}
                            style={{ height: '100%', width: '100%', cursor: 'pointer' }}
                            notMerge={true}
                            lazyUpdate={true}
                        />
                    </div>
                </div>
            );
        } else if (!departmentLoading) {
            return (
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setDrillDownTaluka(null)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                            <HiArrowLeft className="w-4 h-4" />
                            Back to Talukas
                        </button>
                        <ViewModeDropdown />
                    </div>
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <div className="text-5xl mb-3">🏢</div>
                            <p className="text-base">No department data available for {drillDownTaluka}</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 font-medium text-sm">
                    {viewMode === 'dept-taluka' ? 'Departments' : 'Talukas'}
                </span>
                <ViewModeDropdown />
            </div>
            <div className="flex-1">
                <ReactECharts
                    option={viewMode === 'dept-taluka' ? departmentTreeMapOptions : talukaTreeMapOptions}
                    onEvents={viewMode === 'dept-taluka' ? departmentEvents : talukaEvents}
                    style={{ height: '100%', width: '100%', cursor: 'pointer' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </div>
        </div>
    );
};

export default DepartmentTalukaChart;
