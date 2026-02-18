//@ts-nocheck
import KPIRosePieChart from "../../../../charts/KPIRosePieChart";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import React from "react";
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
        bg-white/70 dark:bg-gray-800/50
        backdrop-blur-md
        rounded-xl
        border border-gray-200/40 dark:border-gray-700/40
        shadow-sm hover:shadow-md
        transition-all duration-300 ease-in-out
        hover:-translate-y-1
        p-4
        grid grid-cols-1 md:grid-cols-[1.2fr_1fr]
        gap-3
        "
        >
            {/* LEFT SECTION */}
            <div className="flex flex-col justify-between gap-3">

                {/* TITLE + VALUE */}
                <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {title}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1 transition-all duration-300">
                        {value.toLocaleString()}
                    </div>
                </div>

                {/* STATUS LIST */}
                <div className="space-y-1">
                    {statuses.map((item: any) => (
                        <div
                            key={item.grievanceStatus}
                            className={`
                        flex justify-between items-center text-sm cursor-pointer
                        px-2.5 py-1.5 rounded-lg
                        transition-all duration-200
                        transform hover:scale-[1.02]
                        ${item.grievanceStatus === selectedGrievanceStatus
                                    ? "bg-orange-100/60 dark:bg-orange-900/30 ring-1 ring-orange-300 dark:ring-orange-600"
                                    : "hover:bg-gray-100/70 dark:hover:bg-gray-700/60"
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
                            <span className="text-gray-700 dark:text-gray-200 font-medium">
                                {item.grievanceStatus}
                            </span>

                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                {item.count.toLocaleString()}
                                <span className="text-gray-400 text-xs ml-1">
                                    ({item.percentage.toFixed(1)}%)
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT SECTION - CHART */}
            <div className="flex justify-center items-center animate-fadeIn">
                <div className="w-[180px] h-[180px] transition-transform duration-300 hover:scale-105">
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
        </div>
    );

}





// export function TotalGrievancesCard(props: KPICardProps) {

//     const {
//         title,
//         value,
//         onStatusClick,
//         onChannelClick,
//         onContextMenu,
//         onContextMenuForStatus,
//         selectedGrievanceStatus,
//         selectedDisposeChannel,
//         district,
//         departmentName,
//         disposeChnl,
//         grievanceStatus,
//         programTypes,
//         fromDate,
//         toDate
//     } = props;

//     const { loading, data, error } = useQuery(GrievanceStatusDataQuery, {
//         variables: {
//             departmentName,
//             disposeChnl,
//             district,
//             grievanceStatus,
//             programTypes,
//             fromDate,
//             toDate
//         }
//     });
//     const statuses = data?.dashboardPage1?.grievanceStatuses || [];
//     return (
//         <>
//             <div className="book">
//                 <div className="inner">
//                     <div className="space-y-1">
//                         {statuses.map((item: any) => (
//                             <div
//                                 key={item.grievanceStatus}
//                                 className={`
//  flex justify-between items-center text-sm cursor-pointer
//  px-3 py-2.5 rounded-xl transition-all duration-200
//  ${item.grievanceStatus === selectedGrievanceStatus
//                                         ? "bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-200 dark:ring-orange-700"
//                                         : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
//                                     }
//  `}
//                                 onClick={() => onStatusClick(item.grievanceStatus)}
//                                 onContextMenu={(e: React.MouseEvent) => {
//                                     e.preventDefault();
//                                     onContextMenuForStatus({
//                                         name: item.grievanceStatus,
//                                         event: { event: e },
//                                         value: item.count
//                                     });
//                                 }}
//                             >
//                                 <span className="text-gray-700 font-semibold dark:text-gray-200">
//                                     {item.grievanceStatus}
//                                 </span>
//                                 <span className="font-semibold text-gray-900 dark:text-white">
//                                     {item.count.toLocaleString()} <span className="text-gray-400 font-normal text-xs ml-1">({item.percentage.toFixed(2)}%)</span>
//                                 </span>
//                             </div>
//                         ))}
//                     </div>

//                 </div>
//                 <div className="cover">
//                     <div className="flex flex-col gap-2">
//                         <p className="font-extrabold">{props.title}</p>
//                         <p>{props.value.toLocaleString()}</p>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// };