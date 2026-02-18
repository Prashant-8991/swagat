//@ts-nocheck
import TrendSparkline from './TrendSparkline';

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
            : 'text-gray-600 dark:text-gray-400';
    const trendIcon = trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→';
    const trendBg = trend === 'down'
        ? 'bg-green-50 dark:bg-green-900/20'
        : trend === 'up'
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-gray-50 dark:bg-gray-700/20';

    return (
        <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl border border-gray-200/40 dark:border-gray-700/30 p-5 shadow-sm transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">{title}</p>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {value.toFixed(2)}
                    </h3>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/40">
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-semibold ${trendColor} ${trendBg} flex items-center gap-1`}>
                        <span className="text-base">{trendIcon}</span>
                        {Math.abs(trendValue).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">vs baseline</span>
                </div>
                {targetValue > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Target: <span className="font-semibold text-gray-700 dark:text-gray-300">{targetValue.toFixed(1)}</span>
                    </div>
                )}
            </div>
            <div className="mt-4 h-12">
                <TrendSparkline trendValue={trendValue} trend={trend} />
            </div>
        </div>
    );
}
