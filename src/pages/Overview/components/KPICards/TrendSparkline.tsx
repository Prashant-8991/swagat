//@ts-nocheck
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { echarts } from '../../utils/chartConfig';
import { PASTEL_COLORS } from '../../../../utils/colorPalette';

interface TrendSparklineProps {
  trendValue: number;
  trend: string;
}

export default function TrendSparkline({
  trendValue,
  trend
}: TrendSparklineProps) {
  const option = {
    grid: { top: 0, right: 0, bottom: 0, left: 0 },
    xAxis: {
      type: 'category',
      show: false,
      data: ['', '', '', '', '', '', '']
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: trend === 'up'
          ? [20, 25, 30, 28, 35, 40, 45]
          : trend === 'down'
            ? [45, 40, 35, 38, 30, 25, 20]
            : [30, 32, 31, 33, 32, 31, 30],
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: trend === 'up'
            ? PASTEL_COLORS.coral
            : trend === 'down'
              ? PASTEL_COLORS.mint
              : PASTEL_COLORS.powder,
          width: 2
        },
        areaStyle: {
          color: trend === 'up'
            ? `${PASTEL_COLORS.coral}50`
            : trend === 'down'
              ? `${PASTEL_COLORS.mint}50`
              : `${PASTEL_COLORS.powder}50`
        }
      }
    ]
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
