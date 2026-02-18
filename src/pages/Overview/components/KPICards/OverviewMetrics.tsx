//@ts-nocheck
import React from 'react';
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { motion } from "framer-motion";
import KPIRosePieChart from "../../../../charts/KPIRosePieChart";
import TrendSparkline from './TrendSparkline';
import { TrendingUp, TrendingDown, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Clock, Ban, CheckCheck } from 'lucide-react';

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

interface OverviewMetricsProps {
    totalTitle: string;
    totalValue: number;
    disposalTitle: string;
    disposalValue: number;
    disposalTrend: number;
    disposalTarget: number;

    // Callbacks & Filter State
    onStatusClick: (status: string) => void;
    onChannelClick: (channel: string) => void;
    onContextMenu: (params: any) => void;
    onContextMenuForStatus: (params: any) => void;

    selectedGrievanceStatus: string | null;
    selectedDisposeChannel: string | null;

    // Filters
    district?: string | null;
    departmentName?: string | null;
    disposeChnl?: string | null;
    grievanceStatus?: string | null;
    programTypes?: string[] | null;
    fromDate?: string | null;
    toDate?: string | null;
}

const statusIcons: Record<string, React.ReactNode> = {
    'Total': <RefreshCw size={18} />,
    'Pending': <Clock size={18} />,
    'Resolved': <CheckCircle2 size={18} />,
    'Disposed': <CheckCheck size={18} />,
    'Rejected': <Ban size={18} />,
    'In Process': <RefreshCw size={18} />,
    'New': <AlertCircle size={18} />,
};

const statusColors: Record<string, string> = {
    'Total': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    'Pending': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    'Resolved': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Disposed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    'Rejected': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    'In Process': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'New': 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export default function OverviewMetrics({
    totalTitle,
    totalValue,
    disposalTitle,
    disposalValue,
    disposalTrend,
    disposalTarget,
    onStatusClick,
    onChannelClick,
    onContextMenu,
    onContextMenuForStatus,
    selectedGrievanceStatus,
    selectedDisposeChannel,
    departmentName,
    disposeChnl,
    district,
    grievanceStatus,
    programTypes,
    fromDate,
    toDate
}: OverviewMetricsProps) {

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

    const statuses = data?.dashboardPage1?.grievanceStatuses || [];

    const trend = disposalTrend < 0 ? 'down' : disposalTrend > 0 ? 'up' : 'neutral';
    const trendColor = trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'up' ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500';
    const TrendIcon = trend === 'down' ? TrendingDown : trend === 'up' ? TrendingUp : ArrowRight;

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-48 bg-gray-200/50 rounded-3xl col-span-2"></div>
            <div className="h-48 bg-gray-200/50 rounded-3xl col-span-1"></div>
        </div>
    );

    if (error) return <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">Error loading metrics</div>;

    return (
        <div className="flex flex-col gap-6">

            {/* Top Row: Main KPI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Total Grievances + Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-2 relative group overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                >
                    {/* Decorative Corner Orbs (Balls) */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-soft"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-soft" style={{ animationDelay: '1s' }}></div>

                    <div className="flex-1 space-y-2 z-10 w-full md:w-auto text-center md:text-left">
                        <h3 className="section-subtitle">
                            {totalTitle}
                        </h3>
                        <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                            {totalValue.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground font-medium pt-2">
                            All time registered grievances across selected regions.
                        </p>
                    </div>

                    <div className="w-full md:w-64 h-64 md:h-56 relative z-10 flex-shrink-0 flex justify-center">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl scale-90 rounded-full"></div>
                        <KPIRosePieChart
                            onChannelClick={onChannelClick}
                            onContextMenu={onContextMenu}
                            selectedValue={selectedDisposeChannel}
                            departmentName={departmentName}
                            grievanceStatus={grievanceStatus}
                            district={district}
                            programTypes={programTypes}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </div>
                </motion.div>

                {/* Avg Disposal Days */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative group overflow-hidden bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
                >
                    {/* Decorative Corner Orbs (Balls) */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-soft"></div>
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="section-subtitle">{disposalTitle}</h3>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-background shadow-sm border border-border ${trendColor}`}>
                                <TrendIcon size={14} />
                                {Math.abs(disposalTrend).toFixed(1)}%
                            </div>
                        </div>

                        <div className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter mb-1">
                            {disposalValue.toFixed(1)}
                            <span className="text-lg text-muted-foreground font-medium ml-1">days</span>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-auto relative z-10 w-full">
                        <div className="h-16 w-full opacity-60">
                            <TrendSparkline trendValue={disposalTrend} trend={trend} />
                        </div>

                        {disposalTarget > 0 && (
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mt-3 pt-3 border-t border-border">
                                <span>Target</span>
                                <span className="text-foreground font-bold">{disposalTarget.toFixed(1)} days</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row: Status Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statuses.map((item: any, idx: number) => {
                    const isSelected = item.grievanceStatus === selectedGrievanceStatus;
                    const Icon = statusIcons[item.grievanceStatus] || statusIcons['Total'];

                    return (
                        <motion.button
                            key={item.grievanceStatus}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.15 + (idx * 0.05) }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onStatusClick(item.grievanceStatus)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                onContextMenuForStatus({
                                    name: item.grievanceStatus,
                                    event: { event: e },
                                    value: item.count
                                });
                            }}
                            className={`
                                relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border backdrop-blur-sm
                                ${isSelected
                                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20 border-transparent transform scale-105'
                                    : 'bg-white/70 dark:bg-gray-800/60 border-white/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-700/80 hover:shadow-md'
                                }
                            `}
                        >
                            {/* Decorative Orb */}
                            {!isSelected && (
                                <div className="absolute -top-8 -right-8 w-20 h-20 bg-secondary/50 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    {Icon}
                                </div>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse"></div>}
                            </div>

                            <div>
                                <div className={`text-2xl font-bold tracking-tight mb-1 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {item.count.toLocaleString()}
                                </div>
                                <div className={`text-[10px] uppercase tracking-widest font-semibold truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                    {item.grievanceStatus}
                                </div>
                            </div>

                            {/* Mini Progress Bar Effect */}
                            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20" style={{ width: `${item.percentage}%` }}></div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
