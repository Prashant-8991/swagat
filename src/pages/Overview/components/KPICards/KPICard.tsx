//@ts-nocheck
import KPIRosePieChart from "../../../../charts/KPIRosePieChart";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import React from "react";

interface KPICardProps {
    title: string;
    value: number;
    onStatusClick: (status: string) => void;
    onChannelClick: (channel: string) => void;
    onContextMenu: (params: any) => void;
    onContextMenuForStatus: (params: any) => void;
    selectedGrievanceStatus: string | null;
    selectedDisposeChannel: string | null;
    district?: string | null;
    departmentName?: string | null;
    disposeChnl?: string | null;
    grievanceStatus?: string | null;
    programTypes?: string[] | null;
    fromDate?: string | null;
    toDate?: string | null;
}

const GrievanceStatusDataQuery = gql`
 query GrievanceStatuses(
 $departmentName: String,
 $disposeChnl: String,
 $district: String,
 $grievanceStatus: String,
 $programTypes: [String!],
 $fromDate: String,
 $toDate: String
 ) {
 dashboardPage1(
 departmentName: $departmentName,
 disposeChnl: $disposeChnl,
 district: $district,
 grievanceStatus: $grievanceStatus,
 programTypes: $programTypes,
 fromDate: $fromDate,
 toDate: $toDate
 ) {
 grievanceStatuses {
 count
 grievanceStatus
 percentage
 }
 }
 }
`;

export default function KPICard(props: KPICardProps) {
    const {
        title,
        value,
        onStatusClick,
        onChannelClick,
        onContextMenu,
        onContextMenuForStatus,
        selectedGrievanceStatus,
        selectedDisposeChannel,
        district,
        departmentName,
        disposeChnl,
        grievanceStatus,
        programTypes,
        fromDate,
        toDate
    } = props;

    const { loading, data, error } = useQuery(GrievanceStatusDataQuery, {
        variables: {
            departmentName,
            disposeChnl,
            district,
            grievanceStatus,
            programTypes,
            fromDate,
            toDate
        }
    });

    const handleChartContextMenu = (params: any) => {
        onContextMenu(params);
    };

    if (loading) return (
        <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl p-8 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    );
    if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

    const statuses = data?.dashboardPage1?.grievanceStatuses || [];

    return (
        <div
            className="
 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40
 rounded-2xl
 border border-gray-200/40 dark:border-gray-700/30
 shadow-sm
 transition-all duration-300
 p-5
 grid grid-cols-1 md:grid-cols-2 gap-4
 "
        >
            <div className="flex flex-col justify-between gap-4">
                <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                        {title}
                    </div>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {value.toLocaleString()}
                    </div>
                </div>

                <div className="space-y-1">
                    {statuses.map((item: any) => (
                        <div
                            key={item.grievanceStatus}
                            className={`
 flex justify-between items-center text-sm cursor-pointer
 px-3 py-2.5 rounded-xl transition-all duration-200
 ${item.grievanceStatus === selectedGrievanceStatus
                                    ? "bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-200 dark:ring-orange-700"
                                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }
 `}
                            onClick={() => onStatusClick(item.grievanceStatus)}
                            onContextMenu={(e: React.MouseEvent) => {
                                e.preventDefault();
                                onContextMenuForStatus({
                                    name: item.grievanceStatus,
                                    event: { event: e },
                                    value: item.count
                                });
                            }}
                        >
                            <span className="text-gray-700 font-semibold dark:text-gray-200">
                                {item.grievanceStatus}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {item.count.toLocaleString()} <span className="text-gray-400 font-normal text-xs ml-1">({item.percentage.toFixed(2)}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center items-center">
                <KPIRosePieChart
                    onChannelClick={onChannelClick}
                    onContextMenu={handleChartContextMenu}
                    selectedValue={selectedDisposeChannel}
                    departmentName={departmentName}
                    grievanceStatus={grievanceStatus}
                    district={district}
                    programTypes={programTypes}
                    fromDate={fromDate}
                    toDate={toDate}
                />
            </div>
        </div>
    );
}
