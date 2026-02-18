//@ts-nocheck
import TrendSparkline from './TrendSparkline';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';

interface KPICardWithTrendProps {
    title: string;
    value: number;
    trendValue: number;
    targetValue: number;
}

export default function KPICardWithTrend({
    title,
    value,
    trendValue,
    targetValue,
}: KPICardWithTrendProps) {

    const trend = trendValue < 0 ? 'down' : trendValue > 0 ? 'up' : 'neutral';
    const trendColor = trend === 'down'
        ? 'text-green-600 dark:text-green-400'
        : trend === 'up'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400';
    const trendBg = trend === 'down'
        ? 'bg-green-50/80 dark:bg-green-900/20'
        : trend === 'up'
            ? 'bg-red-50/80 dark:bg-red-900/20'
            : 'bg-gray-50/80 dark:bg-gray-700/20';

    const TrendIcon = trend === 'down' ? TrendingDown : trend === 'up' ? TrendingUp : ArrowRight;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="dashboard-card p-5"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-[0.08em]">{title}</p>
                    <motion.h3
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight"
                    >
                        {value.toFixed(2)}
                    </motion.h3>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100/60 dark:border-gray-700/40">
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${trendColor} ${trendBg} flex items-center gap-1.5`}>
                        <TrendIcon size={14} strokeWidth={2} />
                        {Math.abs(trendValue).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">vs baseline</span>
                </div>
                {targetValue > 0 && (
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        Target: <span className="font-semibold text-gray-600 dark:text-gray-300">{targetValue.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <div className="mt-4 h-12">
                <TrendSparkline trendValue={trendValue} trend={trend} />
            </div>
        </motion.div>
    );
}
