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
    ? 'bg-green-100 dark:bg-green-900/30'
    : trend === 'up'
      ? 'bg-red-100 dark:bg-red-900/30'
      : 'bg-gray-100 dark:bg-gray-700/30';

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 hover:scale-105 transition-transform duration-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <h3 className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-black dark:text-white">
            {value.toFixed(2)}
          </h3>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br opacity-10"></div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-4 pt-4">
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
