//@ts-nocheck
import KPIRosePieChart from "../../../../charts/KPIRosePieChart";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import React from "react";
import { motion } from "framer-motion";
import './kpicards.css'
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


interface TotalGrievancesCardInterface {
    title: string;
    total: number;
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
        <div className="dashboard-card-static p-6 animate-pulse">
            <div className="h-5 w-36 bg-gray-200/60 rounded-lg mb-4"></div>
            <div className="h-9 w-28 bg-gray-200/60 rounded-lg"></div>
        </div>
    );
    if (error) return <p className="p-4 text-error-500 text-sm">Error: {error.message}</p>;

    const statuses = data?.dashboardPage1?.grievanceStatuses || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="
        dashboard-card
        p-5
        grid grid-cols-1 md:grid-cols-[1.2fr_1fr]
        gap-4
        "
        >
            {/* LEFT SECTION */}
            <div className="flex flex-col justify-between gap-3">

                {/* TITLE + VALUE */}
                <div>
                    <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">
                        {title}
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="text-3xl font-bold text-gray-800 dark:text-white mt-1.5 tracking-tight"
                    >
                        {value.toLocaleString()}
                    </motion.div>
                </div>

                {/* STATUS LIST */}
                <div className="space-y-1">
                    {statuses.map((item: any, idx: number) => (
                        <motion.div
                            key={item.grievanceStatus}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: 0.05 * idx }}
                            className={`
                        flex justify-between items-center text-sm cursor-pointer
                        px-3 py-2 rounded-lg
                        transition-all duration-200
                        ${item.grievanceStatus === selectedGrievanceStatus
                                    ? "bg-brand-50/80 dark:bg-brand-900/20 ring-1 ring-brand-200/60 dark:ring-brand-600/40"
                                    : "hover:bg-white/50 dark:hover:bg-gray-700/40"
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
                            <span className="text-gray-600 dark:text-gray-300 font-medium text-[13px]">
                                {item.grievanceStatus}
                            </span>

                            <span className="font-semibold text-gray-800 dark:text-white text-sm tabular-nums">
                                {item.count.toLocaleString()}
                                <span className="text-gray-400 text-xs ml-1 font-normal">
                                    ({item.percentage.toFixed(1)}%)
                                </span>
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* RIGHT SECTION - CHART */}
            <div className="flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="w-[180px] h-[180px]"
                >
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
                </motion.div>
            </div>
        </motion.div>
    );

}