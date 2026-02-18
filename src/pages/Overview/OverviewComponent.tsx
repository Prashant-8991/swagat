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
import OverviewMetrics from './components/KPICards/OverviewMetrics';
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
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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

    const programTypeColorMap: Record<string, string> = {
        'GS': 'from-blue-light-400 to-blue-light-500',
        'TS': 'from-success-500 to-success-600',
        'DS': 'from-[#7EAEC4] to-[#5E97B0]',
        'LF': 'from-brand-400 to-brand-500',
        'RLF': 'from-error-400 to-error-500',
        'WTC': 'from-[#C78D6B] to-[#A06B4A]'
    };

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
        <div className="p-3 md:p-4 lg:p-5 transition-colors duration-300" >
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
                        Overview
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <DateRangeFilter />
                </div>
            </div>

            {/* Program Type Filter Bar */}
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-white/80 via-white/60 to-white/80 dark:from-gray-800/60 dark:to-gray-900/60 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 shadow-sm p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-700 pr-4 py-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 size={32} strokeWidth={1.5} className="text-gray-400" />
                    </motion.div>
                </div>
            )}

            {!loading && dashboardData && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <OverviewMetrics
                            totalTitle="Total Grievances"
                            totalValue={dashboardData?.kpi?.totalCount || 0}
                            disposalTitle="Avg. Disposal Days"
                            disposalValue={dashboardData?.kpi?.disposalDaysKpi?.kpiValue || 0}
                            disposalTrend={dashboardData?.kpi?.disposalDaysKpi?.trendValue || 0}
                            disposalTarget={dashboardData?.kpi?.disposalDaysKpi?.targetValue || 0}
                            onStatusClick={(status) => updateLocalFilter('grievanceStatus', status)}
                            onChannelClick={(channel) => updateLocalFilter('disposeChnl', channel)}
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
