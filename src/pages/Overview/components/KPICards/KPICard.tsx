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

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  const statuses = data?.dashboardPage1?.grievanceStatuses || [];

  return (
    <>
      <div className="relative">
        <span class="absolute top-0 -z-1 left-0 w-full h-full mt-1 ml-1 bg-green-500 rounded-lg"></span>
        <div
          className="
      transition-transform 
      duration-300 
      shadow-lg 
      dark:border dark:border-gray-700
      p-6 
      grid grid-cols-1 md:grid-cols-2 gap-6
      bg-white border-2 border-green-500 rounded-lg
      "
        >
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                {title}
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {value.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              {statuses.map((item: any) => (
                <div
                  key={item.grievanceStatus}
                  className={`
              flex justify-between items-center text-sm cursor-pointer
              p-2 rounded transition-colors
              ${item.grievanceStatus === selectedGrievanceStatus
                      ? "bg-gray-200 dark:bg-gray-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  <span className="text-black font-bold text-lg dark:text-gray-200">
                    {item.grievanceStatus}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">
                    {item.count} <span className="ml-2">({item.percentage.toFixed(2)}%)</span>
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
      </div>
    </>
  );
}
