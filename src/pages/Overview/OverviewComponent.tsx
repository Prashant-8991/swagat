//@ts-nocheck
import { useFilters } from './hooks/useFilters';
import { useContextMenu } from './hooks/useContextMenu';
import { useOverviewData } from './hooks/useOverviewData';
import { downloadCsv } from './utils/downloadCsv';
import { FilterState } from './types';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';
import { useAppSelector } from '../../redux/hooks';
import ContextMenu from '../../components/common/ContextMenu';
import GlobalFilterButton from '../../components/common/GlobalFilterButton';
import KPICard from './components/KPICards/KPICard';
import KPICardWithTrend from './components/KPICards/KPICardWithTrend';
import ChartCard from './components/Charts/ChartCard';
import DistrictTreeMap from './components/Charts/DistrictTreeMap';
import DepartmentTreeMap from './components/Charts/DepartmentTreeMap';
import StickyMiniActiveFilters from './components/Filters/StickyMiniActiveFilters';
import ProgramTypeFilter from './components/Filters/ProgramTypeFilter';
import ActiveFiltersPane from './components/Filters/ActiveFiltersPane';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import TalukaTreeMap from './components/Charts/TalukaTreeMap';
import DesignationTreeMap from './components/Charts/DesignationTreeMap';
import { useQuery } from '@apollo/client/react';
import { GET_TALUKA_DATA, GET_DESIGNATION_DATA } from './graphql/queries';
import { useState, useMemo } from 'react';

export default function OverviewComponent() {
    const [selectedGrievancesDropdown, setSelectedGrievancesDropdown] = useState<string>("District");
    const [selectedDistrictForDrillDown, setSelectedDistrictForDrillDown] = useState<string | null>(null);
    const [selectedTalukaForDrillDown, setSelectedTalukaForDrillDown] = useState<string | null>(null);
    const [selectedDepartmentForDrillDown, setSelectedDepartmentForDrillDown] = useState<string | null>(null);

    const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

    const { filters: globalFilterValues, hasGlobalFilters } = useGlobalFilters();

    const {
        filters: localFilters,
        activeProgramTypes: localActiveProgramTypes,
        updateFilter: updateLocalFilter,
        handleProgramTypeClick: handleLocalProgramTypeClick,
        clearAllFilters: clearLocalFilters,
        hasActiveFilters: hasLocalFilters,
    } = useFilters();

    const mergedFilters = useMemo(() => ({
        ...globalFilterValues,
        ...Object.fromEntries(
            Object.entries(localFilters).filter(([_, value]) => value !== null)
        )
    }), [globalFilterValues, localFilters]);

    const { data: talukaData, loading: talukaLoading } = useQuery(GET_TALUKA_DATA, {
        variables: {
            ...mergedFilters,
            district: selectedDistrictForDrillDown || "",
            fromDate,
            toDate
        },
        skip: !selectedDistrictForDrillDown
    });

    const { data: designationByTalukaData, loading: designationByTalukaLoading } = useQuery(GET_DESIGNATION_DATA, {
        variables: {
            ...mergedFilters,
            taluka: selectedTalukaForDrillDown || "",
            fromDate,
            toDate
        },
        skip: !selectedTalukaForDrillDown
    });

    const { data: designationData, loading: designationLoading } = useQuery(GET_DESIGNATION_DATA, {
        variables: {
            ...mergedFilters,
            departmentName: selectedDepartmentForDrillDown || "",
            fromDate,
            toDate
        },
        skip: !selectedDepartmentForDrillDown
    });

    const activeProgramTypes = hasGlobalFilters
        ? (globalFilterValues.programTypes || [])
        : localActiveProgramTypes;

    const hasActiveFilters = hasGlobalFilters || hasLocalFilters;

    const {
        contextMenu,
        handleContextMenu,
        closeContextMenu,
        handleDrillThrough
    } = useContextMenu(mergedFilters);

    const { dashboardData, loading, error } = useOverviewData(mergedFilters);

    const handleChartClick = (filterKey: keyof FilterState, value: string) => {
        if (localFilters[filterKey] === value) {
            updateLocalFilter(filterKey, null);
        } else {
            updateLocalFilter(filterKey, value);
        }
    };

    const handleDistrictCsv = () => {
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
    };

    const handleDepartmentCsv = () => {
        const columns = [
            { key: 'departmentName', label: 'Department' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' }
        ];
        downloadCsv({
            data: dashboardData?.departments || [],
            columns,
            filename: 'departments.csv'
        });
    };

    const handleDisposeChannelCsv = () => {
        const columns = [
            { key: 'disposeChnl', label: 'Channel' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' }
        ];
        downloadCsv({
            data: dashboardData?.disposeChannels || [],
            columns,
            filename: 'dispose_channels.csv'
        });
    };

    const handleStatusCsv = () => {
        const columns = [
            { key: 'grievanceStatus', label: 'Status' },
            { key: 'count', label: 'Count' },
            { key: 'percentage', label: 'Percentage' }
        ];
        downloadCsv({
            data: dashboardData?.grievanceStatus || [],
            columns,
            filename: 'statuses.csv'
        });
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
                    <h3 className="text-red-800 dark:text-red-300 font-semibold text-lg mb-2">
                        Error Loading Dashboard
                    </h3>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 md:p-4 lg:p-5 transition-colors duration-300" >
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
                        const isActive = activeProgramTypes.includes(type);
                        return (
                            <button
                                key={type}
                                onClick={() => handleLocalProgramTypeClick(type)}
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
                activeProgramTypes={activeProgramTypes}
                onProgramTypeClick={handleLocalProgramTypeClick}
                selectedDistrict={mergedFilters.district}
                onDistrictClick={(district) => updateLocalFilter('district', district)}
                selectedDepartment={mergedFilters.departmentName}
                onDepartmentClick={(dept) => updateLocalFilter('departmentName', dept)}
                selectedGrievanceStatus={mergedFilters.grievanceStatus}
                onGrievanceStatusClick={(status) => updateLocalFilter('grievanceStatus', status)}
                selectedDisposeChannel={mergedFilters.disposeChnl}
                onDisposeChannelClick={(channel) => updateLocalFilter('disposeChnl', channel)}
                hasActiveFilters={hasActiveFilters}
                onClearAllFilters={clearLocalFilters}
            />

            {hasActiveFilters && (
                <div className="mb-4">
                    <ActiveFiltersPane
                        filters={mergedFilters}
                        activeProgramTypes={activeProgramTypes}
                        updateFilter={updateLocalFilter}
                        setActiveProgramTypes={() => { }}
                        handleProgramTypeClick={handleLocalProgramTypeClick}
                        clearAllFilters={clearLocalFilters}
                    />
                </div>
            )}

            <StickyMiniActiveFilters
                filters={mergedFilters}
                clearAllFilters={clearLocalFilters}
                updateFilter={updateLocalFilter}
                activeProgramTypes={activeProgramTypes}
                handleProgramTypeClick={handleLocalProgramTypeClick}
            />

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {!loading && dashboardData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <KPICard
                            title="Total Grievances"
                            value={dashboardData?.kpi?.totalCount || 0}
                            onStatusClick={(status) => handleChartClick('grievanceStatus', status)}
                            onChannelClick={(channel) => handleChartClick('disposeChnl', channel)}
                            onContextMenu={(params) => handleContextMenu(params, "disposeChnl")}
                            onContextMenuForStatus={(params) => handleContextMenu(params, "grievanceStatus")}
                            selectedGrievanceStatus={mergedFilters.grievanceStatus}
                            selectedDisposeChannel={mergedFilters.disposeChnl}
                            district={mergedFilters.district}
                            departmentName={mergedFilters.departmentName}
                            disposeChnl={mergedFilters.disposeChnl}
                            grievanceStatus={mergedFilters.grievanceStatus}
                            programTypes={mergedFilters.programTypes}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                        <KPICardWithTrend
                            title="Avg. Disposal Days"
                            value={dashboardData?.kpi?.disposalDaysKpi?.kpiValue || 0}
                            trendValue={dashboardData?.kpi?.disposalDaysKpi?.trendValue || 0}
                            targetValue={dashboardData?.kpi?.disposalDaysKpi?.targetValue || 0}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">

                        {
                            selectedGrievancesDropdown === "District" && (
                                <>
                                    <ChartCard title={
                                        selectedTalukaForDrillDown
                                            ? `Designations in ${selectedTalukaForDrillDown}`
                                            : selectedDistrictForDrillDown
                                                ? `Grievances in ${selectedDistrictForDrillDown}`
                                                : "Grievances by District"
                                    } downloadCsv={handleDistrictCsv} dropdownOptions={[
                                        { label: "Grievances by District", value: "District" },
                                        { label: "Grievances by Department", value: "30" },
                                    ]}
                                        onDropdownChange={(value) => setSelectedGrievancesDropdown("Department")}>
                                        {selectedTalukaForDrillDown ? (
                                            <DesignationTreeMap
                                                data={designationByTalukaData?.dashboardPage1?.designations || []}
                                                onBack={() => {
                                                    setSelectedTalukaForDrillDown(null);
                                                    updateLocalFilter('taluka', null);
                                                }}
                                                onContextMenu={(params) => handleContextMenu(params, 'forwardedToDesignation')}
                                            />
                                        ) : selectedDistrictForDrillDown ? (
                                            <TalukaTreeMap
                                                data={talukaData?.dashboardPage1?.talukas || []}
                                                onBack={() => {
                                                    updateLocalFilter("district", null)
                                                    setSelectedDistrictForDrillDown(null);
                                                }}
                                                onTileClick={(taluka) => {
                                                    setSelectedTalukaForDrillDown(taluka);
                                                    updateLocalFilter('taluka', taluka);
                                                }}
                                                onContextMenu={(params) => handleContextMenu(params, 'taluka')}
                                            />
                                        ) : (
                                            <DistrictTreeMap
                                                data={dashboardData?.districts || []}

                                                onTileClick={(district) => {
                                                    setSelectedDistrictForDrillDown(district);
                                                    handleChartClick("district", district);
                                                }}
                                                onContextMenu={(params) => handleContextMenu(params, 'district')}
                                                selectedValue={mergedFilters.district}
                                            />
                                        )}
                                    </ChartCard>
                                </>
                            )
                        }

                        {
                            selectedGrievancesDropdown === "Department" && (
                                <>
                                    <ChartCard
                                        title={selectedDepartmentForDrillDown ? `Grievances in ${selectedDepartmentForDrillDown}` : "Grievances by Department"}
                                        downloadCsv={handleDepartmentCsv}
                                        dropdownOptions={[
                                            { label: "Grievances by Department", value: "30" },
                                            { label: "Grievances by District", value: "7" },
                                        ]}
                                        onDropdownChange={(value) => setSelectedGrievancesDropdown("District")}
                                    >
                                        {selectedDepartmentForDrillDown ? (
                                            <DesignationTreeMap
                                                data={designationData?.dashboardPage1?.designations || []}
                                                onBack={() => setSelectedDepartmentForDrillDown(null)}
                                                onContextMenu={(params) => handleContextMenu(params, 'forwardedToDesignation')}
                                            />
                                        ) : (
                                            <DepartmentTreeMap
                                                data={dashboardData?.departments || []}
                                                selectedValue={mergedFilters.departmentName}
                                                onTileClick={(dept) => {
                                                    setSelectedDepartmentForDrillDown(dept);
                                                    handleChartClick("departmentName", dept);
                                                }}
                                                onContextMenu={(params) =>
                                                    handleContextMenu(params, "departmentName")
                                                }
                                            />
                                        )}

                                    </ChartCard>
                                </>
                            )
                        }



                        <div className="grid grid-cols-2 gap-4">
                        </div>
                    </div>
                </>
            )}

            <GlobalFilterButton />
        </div>
    );
}
