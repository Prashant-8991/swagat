//@ts-nocheck
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, RadarChart, HeatmapChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  RadarComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { buildDrillThroughUrl } from '../../utils/drillthrough';
import DownloadCsvButton from '../../components/common/DownloadCsvButton';
import ContextMenu from '../../components/common/ContextMenu';
import { CHART_COLORS, PASTEL_COLORS } from '../../utils/colorPalette';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setgSwagatData } from '../../redux/features/globalfilters';
import { useGlobalFilters } from '../../hooks/useGlobalFilters';
import ProgramTypeFilter from './components/Filters/ProgramTypeFilter';
import ActiveFiltersPane from './components/Filters/ActiveFiltersPane';
import StickyMiniActiveFilters from './components/Filters/StickyMiniActiveFilters';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import GlobalFilterButton from '../../components/common/GlobalFilterButton';
import DisposeChannelCountDonut from '../Overview/components/Charts/DisposeChannelCountDonut'
echarts.use([
  BarChart,
  LineChart,
  RadarChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  RadarComponent,
  CanvasRenderer
]);

const GET_DASHBOARD_PAGE7 = gql`
  query GetDashboardPage7(
    $programTypes: [String!]
    $district: String
    $taluka: String
    $departmentName: String
    $disposeChnl: String
    $grievanceStatus: String
    $subStatusName: String
    $subjectCategory: String
    $forwardedToDesignation: String
    $grievanceReviewType: String
    $fromDate: String
    $toDate: String
  ) {
    dashboardPage7(
      programTypes: $programTypes
      district: $district
      taluka: $taluka
      departmentName: $departmentName
      disposeChnl: $disposeChnl
      grievanceStatus: $grievanceStatus
      subStatusName: $subStatusName
      subjectCategory: $subjectCategory
      forwardedToDesignation: $forwardedToDesignation
      grievanceReviewType: $grievanceReviewType
      fromDate: $fromDate
      toDate: $toDate
    ) {
      kpi {
        totalCount
        selectedProgramTypes
      }
      districtSummary {
        district
        count
        percentage
      }
      departmentSummary {
        departmentName
        count
        percentage
      }
      talukaSummary {
        taluka
        count
        percentage
      }
      disposeChannelSummary {
        disposeChnl
        count
        percentage
      }
      subjectCategorySummary {
        subjectCategory
        count
        avgDisposalDays
        percentage
      }
      designationSummary {
        forwardedToDesignation
        count
        percentage
      }
      grievanceReviewTypeSummary {
        grievanceReviewType
        count
        percentage
      }
    }
  }
`;

const GET_HEATMAP_DATA = gql`
  query GetHeatmapData(
    $xDimension: String!
    $yDimension: String!
    $programTypes: [String!]
    $disposeChnl: String
    $subjectCategory: String
    $grievanceReviewType: String
    $fromDate: String
    $toDate: String
    $limit: Int
  ) {
    page7Heatmap(
      xDimension: $xDimension
      yDimension: $yDimension
      programTypes: $programTypes
      disposeChnl: $disposeChnl
      subjectCategory: $subjectCategory
      grievanceReviewType: $grievanceReviewType
      fromDate: $fromDate
      toDate: $toDate
      limit: $limit
    ) {
      xAxisData
      yAxisData
      cells {
        xValue
        yValue
        count
      }
    }
  }
`;

interface FilterState {
  programTypes: string[];
  district: string | null;
  taluka: string | null;
  departmentName: string | null;
  disposeChnl: string | null;
  subjectCategory: string | null;
  forwardedToDesignation: string | null;
  grievanceReviewType: string | null;
  grievanceStatus: string | null;
  subStatusName: string | null;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  data: {
    name: string;
    value: number;
  } | null;
  filterKey: keyof FilterState | null;
}

interface SubjectCategoryRow {
  subjectCategory: string;
  count: number;
  avgDisposalDays: number | null;
  percentage: number;
}

type SortField = 'subjectCategory' | 'count' | 'avgDisposalDays' | 'percentage';
type SortDirection = 'asc' | 'desc';

const COLORS = {
  district: { light: CHART_COLORS.primary, dark: PASTEL_COLORS.lavender },
  department: { light: CHART_COLORS.accent, dark: PASTEL_COLORS.purple },
  taluka: { light: CHART_COLORS.secondary, dark: PASTEL_COLORS.aqua },
  designation: { light: PASTEL_COLORS.peach, dark: PASTEL_COLORS.coral },
  green: PASTEL_COLORS.mint,
  yellow: PASTEL_COLORS.yellow,
  red: PASTEL_COLORS.rose
};

function downloadCsv({
  data,
  columns,
  filename
}: {
  data: any[],
  columns: { key: string, label: string }[],
  filename: string
}) {
  const BOM = '\uFEFF';
  const header = columns.map(col => `"${col.label}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => `"${(row[col.key] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  );
  const csvContent = [header, ...rows].join('\r\n');
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function KPICard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl  transition-transform duration-300 p-6 shadow-lg hover:shadow-xl">
      <div className="text-sm font-medium text-black">{title}</div>
      <div className="text-4xl font-bold text-black">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  downloadCsv
}: {
  title: string;
  children: React.ReactNode;
  downloadCsv?: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl  transition-transform duration-300 p-6 shadow-lg hover:shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {downloadCsv && <DownloadCsvButton onClick={downloadCsv} />}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  );
}

function SortButton({ label, field, currentField, direction, onClick }: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: (field: SortField) => void;
}) {
  const isActive = currentField === field;
  return (
    <button
      onClick={() => onClick(field)}
      className="flex items-center gap-1 hover:text-purple-600 transition-colors group"
    >
      {label}
      <span className={`text-xs transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
        {isActive && direction === 'asc' ? '↑' : '↓'}
      </span>
    </button>
  );
}

type RadarViewType = 'district' | 'department' | 'taluka' | 'designation';
type HeatmapViewType = 'department-district' | 'taluka-designation';

function TopTenRadarChart({
  districtData,
  departmentData,
  talukaData,
  designationData,
  selectedView,
  onViewChange,
  onItemClick,
  onContextMenu,
  selectedValue
}: {
  districtData: any[];
  departmentData: any[];
  talukaData: any[];
  designationData: any[];
  selectedView: RadarViewType;
  onViewChange: (view: RadarViewType) => void;
  onItemClick: (type: RadarViewType, value: string) => void;
  onContextMenu: (params: any, type: RadarViewType) => void;
  selectedValue: string | null;
}) {
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    let sourceData: any[] = [];
    let dataKey = '';
    let filterKey: RadarViewType = selectedView;

    switch (selectedView) {
      case 'district':
        sourceData = districtData;
        dataKey = 'district';
        break;
      case 'department':
        sourceData = departmentData;
        dataKey = 'departmentName';
        break;
      case 'taluka':
        sourceData = talukaData;
        dataKey = 'taluka';
        break;
      case 'designation':
        sourceData = designationData;
        dataKey = 'forwardedToDesignation';
        break;
    }

    const top10 = [...sourceData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxValue = Math.max(...top10.map(d => d.count));

    const indicator = top10.map(d => ({
      name: d[dataKey],
      max: maxValue * 1.2
    }));

    const values = top10.map(d => d.count);

    return { indicator, values, top10, dataKey, filterKey };
  }, [selectedView, districtData, departmentData, talukaData, designationData]);

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: any) => {
        const dataIndex = params.data?.value?.findIndex((v: number, i: number) =>
          Math.abs(v - params.value) < 0.01 && i === params.dimensionNames?.indexOf(params.name)
        ) ?? 0;
        const item = chartData.top10[dataIndex];
        const name = item?.[chartData.dataKey] || params.name;
        const value = params.value || 0;
        return `
          <div style="font-weight: bold; margin-bottom: 4px;">${name}</div>
          <div>Count: ${value.toLocaleString()}</div>
          <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">💡 Click to filter • Right-click for details</div>
        `;
      }
    },
    radar: {
      indicator: chartData.indicator,
      shape: 'polygon',
      splitNumber: 4,
      name: {
        textStyle: {
          color: '#374151',
          fontSize: 11,
          fontWeight: 'bold'
        },
        formatter: (value: string) =>
          value && value.length > 15 ? value.substring(0, 15) + '…' : value,
        triggerEvent: true
      },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(147, 51, 234, 0.05)', 'rgba(147, 51, 234, 0.1)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#D1D5DB'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: chartData.values,
            name: `Top 10 ${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)}`,
            areaStyle: {
              color: 'rgba(147, 51, 234, 0.3)'
            },
            lineStyle: {
              color: '#9333EA',
              width: 2
            },
            itemStyle: {
              color: '#9333EA',
              borderWidth: 2,
              borderColor: '#fff'
            }
          }
        ],
        emphasis: {
          lineStyle: {
            width: 3
          },
          itemStyle: {
            borderWidth: 3
          }
        }
      }
    ]
  };

  const onEvents = {
    click: (params: any) => {
      console.log('Radar chart click event:', params);
      
      if (params.componentType === 'radar' && (params.targetType === 'axisName' || params.targetType === 'axisLabel')) {
        if (params.name && chartData.top10.some(item => item[chartData.dataKey] === params.name)) {
          onItemClick(chartData.filterKey, params.name);
        }
      }
    },
    contextmenu: (params: any) => {
      if (params.componentType === 'radar' && (params.targetType === 'axisName' || params.targetType === 'axisLabel')) {
        params.event.event.preventDefault();
        params.event.event.stopPropagation();
        const item = chartData.top10.find(i => i[chartData.dataKey] === params.name);
        if (item) {
          onContextMenu({ ...params, name: item[chartData.dataKey], value: item.count }, chartData.filterKey);
        }
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = (chartRef.current as any).getEchartsInstance();

      
      const zr = chartInstance.getZr();

      const handleZrClick = (params: any) => {
        
        if (params.target && params.target.style && params.target.style.text) {
          const labelText = params.target.style.text;
          console.log('ZRender click on text:', labelText);

          if (labelText && chartData.top10.some(item => {
            const itemName = item[chartData.dataKey];
            
            return itemName === labelText || itemName.startsWith(labelText.replace('…', ''));
          })) {
            const item = chartData.top10.find(i => {
              const name = i[chartData.dataKey];
              return name === labelText || name.startsWith(labelText.replace('…', ''));
            });
            if (item) {
              console.log('Found matching item via ZRender:', item);
              onItemClick(chartData.filterKey, item[chartData.dataKey]);
            }
          }
        }
      };

      zr.on('click', handleZrClick);

      return () => {
        zr.off('click', handleZrClick);
      };
    }
  }, [chartData, onItemClick]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">View:</label>
        <select
          value={selectedView}
          onChange={(e) => onViewChange(e.target.value as RadarViewType)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
        >
          <option value="district">Top 10 Districts</option>
          <option value="department">Top 10 Departments</option>
          <option value="taluka">Top 10 Talukas</option>
          <option value="designation">Top 10 Designations</option>
        </select>
      </div>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={option}
        onEvents={onEvents}
        style={{ height: '500px', width: '100%' }}
      />
    </div>
  );
}

function DepartmentDistrictHeatmap({
  departmentData,
  districtData,
  talukaData,
  designationData,
  selectedView,
  onViewChange,
  onItemClick,
  onContextMenu,
  filters,
  fromDate,
  toDate,
}: {
  departmentData: any[];
  districtData: any[];
  talukaData: any[];
  designationData: any[];
  selectedView: HeatmapViewType;
  onViewChange: (view: HeatmapViewType) => void;
  onItemClick: (xType: string, xValue: string, yType: string, yValue: string) => void;
  onContextMenu: (params: any, xType: string, yType: string, resolvedXValue: string, resolvedYValue: string) => void;
  filters: any;
  fromDate: string;
  toDate: string;
}) {
  const chartRef = useRef<any>(null);

  const { xDimension, yDimension, xType, yType } = useMemo(() => {
    if (selectedView === 'department-district') {
      return {
        xDimension: 'departmentName',
        yDimension: 'district',
        xType: 'departmentName',
        yType: 'district'
      };
    } else {
      return {
        xDimension: 'taluka',
        yDimension: 'forwardedToDesignation',
        xType: 'taluka',
        yType: 'forwardedToDesignation'
      };
    }
  }, [selectedView]);

  const { data: heatmapQueryData, loading } = useQuery(GET_HEATMAP_DATA, {
    variables: {
      xDimension,
      yDimension,
      programTypes: filters.programTypes && filters.programTypes.length > 0 ? filters.programTypes : null,
      disposeChnl: filters.disposeChnl || null,
      subjectCategory: filters.subjectCategory || null,
      grievanceReviewType: filters.grievanceReviewType || null,
      fromDate,
      toDate,
      limit: 10
    },
    fetchPolicy: 'cache-and-network'
  });

  const { xAxisData, yAxisData, heatmapData } = useMemo(() => {
    if (!heatmapQueryData?.page7Heatmap) {
      return {
        xAxisData: [],
        yAxisData: [],
        heatmapData: []
      };
    }

    const { xAxisData: xData, yAxisData: yData, cells } = heatmapQueryData.page7Heatmap;

    const data: [number, number, number][] = cells.map((cell: any) => {
      const xIdx = xData.indexOf(cell.xValue);
      const yIdx = yData.indexOf(cell.yValue);
      return [xIdx, yIdx, cell.count];
    });

    return {
      xAxisData: xData,
      yAxisData: yData,
      heatmapData: data
    };
  }, [heatmapQueryData]);

  const option = useMemo(() => {
    const maxValue = Math.max(...heatmapData.map(d => d[2]));

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const xLabel = xAxisData[params.data[0]];
          const yLabel = yAxisData[params.data[1]];
          const value = params.data[2];
          return `${xLabel} × ${yLabel}<br/>Count: <strong>${value}</strong>`;
        }
      },
      grid: {
        left: '15%',
        right: '5%',
        top: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        splitArea: {
          show: true
        },
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        splitArea: {
          show: true
        },
        axisLabel: {
          fontSize: 11
        }
      },
      visualMap: {
        min: 0,
        show: false,
        max: maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#f0f9ff', '#7dd3fc', '#0ea5e9', '#0369a1', '#1e3a8a']
        }
      },
      series: [
        {
          name: 'Heatmap',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
            fontSize: 10
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }, [xAxisData, yAxisData, heatmapData]);

  const onEvents = {
    click: (params: any) => {
      console.log('Heatmap click event:', params);
      if (params.componentType === 'series' && params.data && Array.isArray(params.data) && params.data.length >= 2) {
        const xIdx = params.data[0];
        const yIdx = params.data[1];
        if (xIdx >= 0 && xIdx < xAxisData.length && yIdx >= 0 && yIdx < yAxisData.length) {
          const xValue = xAxisData[xIdx];
          const yValue = yAxisData[yIdx];
          console.log('Heatmap cell clicked:', { xType, xValue, yType, yValue });
          onItemClick(xType, xValue, yType, yValue);
        }
      }
    },
    contextmenu: (params: any) => {
      if (params.componentType === 'series' && params.data && Array.isArray(params.data) && params.data.length >= 2) {
        params.event.event.preventDefault();
        const xIdx = params.data[0];
        const yIdx = params.data[1];
        if (xIdx >= 0 && xIdx < xAxisData.length && yIdx >= 0 && yIdx < yAxisData.length) {
          const xValue = xAxisData[xIdx];
          const yValue = yAxisData[yIdx];
          onContextMenu(params, xType, yType, xValue, yValue);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          value={selectedView}
          onChange={(e) => onViewChange(e.target.value as HeatmapViewType)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="department-district">Department × District</option>
          <option value="taluka-designation">Taluka × Designation</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-gray-600">Loading heatmap data...</div>
        </div>
      )}

      {!loading && (
        <ReactEChartsCore
          ref={chartRef}
          echarts={echarts}
          option={option}
          onEvents={onEvents}
          style={{ height: '500px', width: '100%' }}
          notMerge={true}
        />
      )}
    </div>
  );
}

function BarChartComponent({
  data,
  dataKey,
  onBarClick,
  onContextMenu,
  selectedValue,
  colorLight,
  colorDark
}: {
  data: any[];
  dataKey: string;
  onBarClick: (value: string) => void;
  onContextMenu: (params: any) => void;
  selectedValue: string | null;
  colorLight: string;
  colorDark: string;
}) {
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const chartRef = useRef(null);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: any) => {
        const param = params[0];
        const fullName = sortedData[param.dataIndex][dataKey];
        return `
          <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
          <div>Count: ${param.value.toLocaleString()}</div>
          <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">💡 Tip: Right-click for detailed analysis</div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      top: '5%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'slider',
        show: false,
        xAxisIndex: [0],
        start: 0,
        end: sortedData.length > 10 ? (10 / sortedData.length) * 100 : 100,
        bottom: '5%',
        height: 20,
        borderColor: '#E5E7EB',
        fillerColor: `${colorLight}33`,
        handleStyle: {
          color: colorLight,
          borderColor: colorDark
        },
        moveHandleSize: 8,
        textStyle: {
          color: '#6B7280',
          fontSize: 10
        }
      },
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: sortedData.length > 10 ? (10 / sortedData.length) * 100 : 100
      }
    ],
    xAxis: {
      type: 'category',
      data: sortedData.map((d) => d[dataKey]),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        color: '#6B7280',
        interval: 0,
        formatter: (value: string) =>
          value && value.length > 15 ? value.substring(0, 15) + '…' : value
      },
      axisLine: { lineStyle: { color: '#E5E7EB' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#6B7280',
        formatter: (value: number) => value.toLocaleString()
      },
      splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } }
    },
    series: [
      {
        type: 'bar',
        data: sortedData.map((d) => ({
          value: d.count,
          itemStyle: {
            color: d[dataKey] === selectedValue ? colorDark : colorLight,
            borderRadius: [8, 8, 0, 0],
            borderWidth: d[dataKey] === selectedValue ? 3 : 0,
            borderColor: '#1F2937'
          }
        })),
        emphasis: {
          itemStyle: {
            color: colorDark,
            shadowBlur: 10,
            shadowColor: `${colorLight}80`
          }
        },
        barMaxWidth: 40
      }
    ]
  };

  const onEvents = {
    click: (params: any) => {
      if (params.componentType === 'series') {
        const originalName = sortedData[params.dataIndex][dataKey];
        onBarClick(originalName);
      }
    },
    contextmenu: (params: any) => {
      if (params.componentType === 'series') {
        params.event.event.preventDefault();
        params.event.event.stopPropagation();
        const originalName = sortedData[params.dataIndex][dataKey];
        onContextMenu({ ...params, name: originalName });
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      const dom = chartInstance.getDom();
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      dom.addEventListener('contextmenu', handleContextMenu);
      return () => {
        dom.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={option}
      onEvents={onEvents}
      style={{ height: '400px', width: '100%' }}
    />
  );
}

function DisposeChannelChart({
  data,
  onBarClick,
  onContextMenu,
  selectedValue
}: {
  data: any[];
  onBarClick: (value: string) => void;
  onContextMenu: (params: any) => void;
  selectedValue: string | null;
}) {
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const chartRef = useRef(null);

  const getChannelColor = (channel: string) => {
    const lowerChannel = channel.toLowerCase();
    if (lowerChannel.includes('green')) {
      return COLORS.green;
    } else if (lowerChannel.includes('yellow')) {
      return COLORS.yellow;
    } else if (lowerChannel.includes('red')) {
      return COLORS.red;
    }
    return '#6B7280';
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      formatter: (params: any) => {
        const param = params[0];
        const fullName = sortedData[param.dataIndex].disposeChnl;
        return `
          <div style="font-weight: bold; margin-bottom: 4px;">${fullName}</div>
          <div>Count: ${param.value.toLocaleString()}</div>
          <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">💡 Tip: Right-click for detailed analysis</div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedData.map((d) => d.disposeChnl),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        interval: 0,
        formatter: (value: string) =>
          value && value.length > 15 ? value.substring(0, 15) + '…' : value,
        color: '#6B7280',
        fontWeight: 'bold'
      },
      axisLine: { lineStyle: { color: '#E5E7EB' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#6B7280',
        formatter: (value: number) => value.toLocaleString()
      },
      splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } }
    },
    series: [
      {
        type: 'bar',
        data: sortedData.map((d) => ({
          value: d.count,
          itemStyle: {
            color: getChannelColor(d.disposeChnl),
            borderRadius: [8, 8, 0, 0],
            borderWidth: d.disposeChnl === selectedValue ? 3 : 0,
            borderColor: '#1F2937',
            opacity: d.disposeChnl === selectedValue ? 1 : 0.85
          }
        })),
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        barMaxWidth: 50
      }
    ]
  };

  const onEvents = {
    click: (params: any) => {
      if (params.componentType === 'series') {
        const originalName = sortedData[params.dataIndex].disposeChnl;
        onBarClick(originalName);
      }
    },
    contextmenu: (params: any) => {
      if (params.componentType === 'series') {
        params.event.event.preventDefault();
        params.event.event.stopPropagation();
        const originalName = sortedData[params.dataIndex].disposeChnl;
        onContextMenu({ ...params, name: originalName });
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      const dom = chartInstance.getDom();
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      dom.addEventListener('contextmenu', handleContextMenu);
      return () => {
        dom.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={option}
      onEvents={onEvents}
      style={{ height: '400px', width: '100%' }}
    />
  );
}

function GrievanceReviewTypePieChart({
  data,
  onSliceClick,
  onContextMenu,
  selectedValue
}: {
  data: any[];
  onSliceClick: (value: string) => void;
  onContextMenu: (params: any) => void;
  selectedValue: string | null;
}) {
  const chartRef = useRef(null);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%)'
    },
    legend: {
      top: 'bottom',
      show: false
    },
    series: [
      {
        name: 'Grievance Review Type',
        type: 'pie',
        radius: '70%',
        center: ['50%', '50%'],
        itemStyle: {
          borderRadius: 10
        },
        data: data.map(item => ({
          value: item.count,
          name: item.grievanceReviewType,
          itemStyle: {
            color: item.grievanceReviewType === selectedValue ? '#9333EA' : undefined,
            borderColor: item.grievanceReviewType === selectedValue ? '#000' : undefined,
            borderWidth: item.grievanceReviewType === selectedValue ? 2 : 0
          }
        }))
      }
    ]
  };

  const onEvents = {
    click: (params: any) => {
      onSliceClick(params.name);
    },
    contextmenu: (params: any) => {
      params.event.event.preventDefault();
      onContextMenu(params);
    }
  };

  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={option}
      onEvents={onEvents}
      style={{ height: '400px', width: '100%' }}
    />
  );
}

export default function ReviewedGrievancesPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { fromDate, toDate } = useAppSelector((state) => state.dateFilter);

  const { filters: globalFilterValues, hasGlobalFilters } = useGlobalFilters();

  const [localFilters, setLocalFilters] = useState<FilterState>({
    programTypes: [],
    district: null,
    taluka: null,
    departmentName: null,
    disposeChnl: null,
    subjectCategory: null,
    forwardedToDesignation: null,
    grievanceReviewType: null,
    grievanceStatus: null,
    subStatusName: null
  });

  const filters = useMemo(() => ({
    ...globalFilterValues,
    ...Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) =>
        value !== null && (Array.isArray(value) ? value.length > 0 : true)
      )
    )
  }), [globalFilterValues, localFilters]);

  const activeProgramTypes = useMemo(() =>
    Array.isArray(filters.programTypes) ? filters.programTypes : [],
    [filters.programTypes]
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
    filterKey: null
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('count');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [allSubjects, setAllSubjects] = useState<SubjectCategoryRow[] | null>(null);
  const [radarView, setRadarView] = useState<RadarViewType>('district');
  const [heatmapView, setHeatmapView] = useState<HeatmapViewType>('department-district');
  const pageSize = 10;

  const { data, loading, error } = useQuery(GET_DASHBOARD_PAGE7, {
    variables: {
      ...filters,
      programTypes: filters.programTypes && filters.programTypes.length > 0 ? filters.programTypes : null,
      fromDate,
      toDate
    },
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchAllSubjects() {
      try {
        const result = await fetch(import.meta.env.VITE_GRAPHQL_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetPage7Dashboard($programTypes: [String!], $district: String, $taluka: String, $departmentName: String, $disposeChnl: String, $grievanceStatus: String, $subStatusName: String, $forwardedToDesignation: String, $grievanceReviewType: String, $fromDate: String, $toDate: String) {
                dashboardPage7(
                  programTypes: $programTypes
                  district: $district
                  taluka: $taluka
                  departmentName: $departmentName
                  disposeChnl: $disposeChnl
                  grievanceStatus: $grievanceStatus
                  subStatusName: $subStatusName
                  forwardedToDesignation: $forwardedToDesignation
                  grievanceReviewType: $grievanceReviewType
                  fromDate: $fromDate
                  toDate: $toDate
                ) {
                  subjectCategorySummary {
                    subjectCategory
                    count
                    avgDisposalDays
                    percentage
                  }
                }
              }
            `,
            variables: {
              programTypes: filters.programTypes && filters.programTypes.length > 0 ? filters.programTypes : null,
              district: filters.district,
              taluka: filters.taluka,
              departmentName: filters.departmentName,
              disposeChnl: filters.disposeChnl,
              grievanceStatus: filters.grievanceStatus,
              subStatusName: filters.subStatusName || null,
              forwardedToDesignation: filters.forwardedToDesignation,
              grievanceReviewType: filters.grievanceReviewType,
              fromDate,
              toDate
            },
          }),
        });

        if (!result.ok) {
          console.error('Failed to fetch subjects:', result.status, await result.text());
          if (isMounted) setAllSubjects([]);
          return;
        }

        const json = await result.json();
        const allData = json.data?.dashboardPage7?.subjectCategorySummary;
        if (isMounted) setAllSubjects(allData || []);
      } catch (error) {
        console.error('Error fetching all subjects:', error);
        if (isMounted) setAllSubjects([]);
      }
    }

    setAllSubjects(null);
    fetchAllSubjects();

    return () => {
      isMounted = false;
    };
  }, [filters.programTypes, filters.district, filters.taluka, filters.departmentName, filters.disposeChnl, filters.forwardedToDesignation, fromDate, toDate]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.chart-container, .subject-table')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const updateFilter = (key: keyof FilterState, value: string | string[] | null) => {
    console.log('updateFilter called:', { key, value });
    setLocalFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      console.log('New local filters:', newFilters);
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleProgramTypeClick = (type: string | null) => {
    if (type === null) {
      updateFilter('programTypes', []);
      return;
    }

    const currentTypes = Array.isArray(filters.programTypes) ? filters.programTypes : [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    updateFilter('programTypes', newTypes);
  };

  const handleChartClick = (filterKey: keyof FilterState, value: string) => {
    console.log('handleChartClick called:', { filterKey, value, currentValue: filters[filterKey] });
    if (filters[filterKey] === value) {
      console.log('Clearing filter');
      updateFilter(filterKey, null);
    } else {
      console.log('Setting filter');
      updateFilter(filterKey, value);
    }
  };

  const handleContextMenu = useCallback((params: any, filterKey: keyof FilterState) => {
    const event = params.event?.event || params.event;
    const x = event?.clientX || event?.pageX || 0;
    const y = event?.clientY || event?.pageY || 0;

    setContextMenu({
      visible: true,
      x,
      y,
      data: {
        name: params.name,
        value: params.value || params.data?.value || params.data || 0
      },
      filterKey
    });
  }, []);

  const handleTableContextMenu = (e: React.MouseEvent, name: string, count: number, filterKey: keyof FilterState) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      data: { name, value: count },
      filterKey
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      data: null,
      filterKey: null
    });
  }, []);

  const handleDrillThrough = useCallback(() => {
    if (!contextMenu.data || !contextMenu.filterKey) return;

    const drillThroughContext: Record<string, any> = {
      sourcePage: 'reviewed',
      IsReviewed: 1
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'programTypes' && Array.isArray(value) && value.length > 0) {
          drillThroughContext['programTypes'] = value;
        } else if (key === 'disposeChnl') {
          drillThroughContext['disposeChannel'] = value;
        } else if (key !== 'programTypes') {
          drillThroughContext[key] = value;
        }
      }
    });

    const clickedValue = contextMenu.data.name;
    const clickedKey = contextMenu.filterKey;
    if (clickedKey === 'disposeChnl') {
      drillThroughContext['disposeChannel'] = clickedValue;
    } else if (clickedKey === 'forwardedToDesignation') {
      drillThroughContext['forwardedToDesignation'] = clickedValue;
    } else if (clickedKey !== 'programTypes') {
      drillThroughContext[clickedKey] = clickedValue;
    }

    if (filters.grievanceReviewType) {
      drillThroughContext['grievanceReviewType'] = filters.grievanceReviewType;
    }
    if (clickedKey === 'grievanceReviewType') {
      drillThroughContext['grievanceReviewType'] = clickedValue;
    }

    const url = buildDrillThroughUrl(drillThroughContext);
    navigate(url);
    closeContextMenu();
  }, [contextMenu.data, contextMenu.filterKey, filters, closeContextMenu, navigate]);

  const clearAllFilters = () => {
    setLocalFilters({
      programTypes: [],
      district: null,
      taluka: null,
      departmentName: null,
      disposeChnl: null,
      subjectCategory: null,
      forwardedToDesignation: null,
      grievanceReviewType: null,
      grievanceStatus: null,
      subStatusName: null
    });
    setCurrentPage(1);
    setSearchQuery('');

    dispatch(setgSwagatData({
      programTypes: [],
      districts: [],
      talukas: [],
      departments: [],
      grievanceStatuses: [],
      subStatuses: [],
      disposeChannels: []
    }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const hasActiveFilters = hasGlobalFilters || Object.values(localFilters).some(v =>
    v !== null && (Array.isArray(v) ? v.length > 0 : true)
  );

  const handleDistrictCsv = () => {
    downloadCsv({
      data: dashboardData?.districtSummary || [],
      columns: [
        { key: 'district', label: 'District' },
        { key: 'count', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_districts.csv'
    });
  };

  const handleDepartmentCsv = () => {
    downloadCsv({
      data: dashboardData?.departmentSummary || [],
      columns: [
        { key: 'departmentName', label: 'Department' },
        { key: 'count', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_departments.csv'
    });
  };

  const handleTalukaCsv = () => {
    downloadCsv({
      data: dashboardData?.talukaSummary || [],
      columns: [
        { key: 'taluka', label: 'Taluka' },
        { key: 'count', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_talukas.csv'
    });
  };

  const handleDisposeChannelCsv = () => {
    downloadCsv({
      data: dashboardData?.disposeChannelSummary || [],
      columns: [
        { key: 'disposeChnl', label: 'Dispose Channel' },
        { key: 'count', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_channels.csv'
    });
  };

  const handleSubjectCsv = () => {
    downloadCsv({
      data: (allSubjects !== null && allSubjects !== undefined) ? allSubjects : (dashboardData?.subjectCategorySummary || []),

      columns: [
        { key: 'subjectCategory', label: 'Subject Category' },
        { key: 'count', label: 'Count' },
        { key: 'avgDisposalDays', label: 'Avg Disposal Days' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_subjects.csv'
    });
  };

  const handleDesignationCsv = () => {
    downloadCsv({
      data: dashboardData?.designationSummary || [],
      columns: [
        { key: 'forwardedToDesignation', label: 'Designation' },
        { key: 'count', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_designations.csv'
    });
  };

  const handleGrievanceReviewTypeCsv = () => {
    downloadCsv({
      data: dashboardData?.grievanceReviewTypeSummary || [],
      columns: [
        { key: 'grievanceReviewType', label: 'Review Type' },
        { key: 'count', label: 'Count' },
        { key: 'percentage', label: 'Percentage' }
      ],
      filename: 'reviewed_review_types.csv'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-500 p-8 max-w-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </div>
    );
  }

  const dashboardData = data?.dashboardPage7;

  let subjects: SubjectCategoryRow[] = [];
  let showPagination = false;
  let totalResults = 0;

  if (searchQuery.trim() && allSubjects) {
    let filteredSubjects = allSubjects.filter((s) =>
      s.subjectCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredSubjects = filteredSubjects.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    totalResults = filteredSubjects.length;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    subjects = filteredSubjects.slice(startIndex, endIndex);
    showPagination = totalResults > pageSize;
  } else {
    if (allSubjects) {
      let sortedSubjects = [...allSubjects].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });

      totalResults = sortedSubjects.length;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      subjects = sortedSubjects.slice(startIndex, endIndex);
      showPagination = totalResults > pageSize;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        data={contextMenu.data}
        filterKey={contextMenu.filterKey}
        filters={filters}
        onClose={closeContextMenu}
        onDrillThrough={handleDrillThrough}
      />

      <div className="mb-6 flex justify-between items-center gap-4">
        <ProgramTypeFilter
          activeProgramTypes={activeProgramTypes}
          onProgramTypeClick={handleProgramTypeClick}
          hasActiveFilters={hasActiveFilters}
          onClearAllFilters={clearAllFilters}
        />
        <DateRangeFilter />
      </div>

      {hasActiveFilters && (
        <div className="mb-6">
          <ActiveFiltersPane
            filters={filters}
            activeProgramTypes={activeProgramTypes}
            updateFilter={updateFilter}
            handleProgramTypeClick={handleProgramTypeClick}
          />
        </div>
      )}

      <StickyMiniActiveFilters
        filters={filters}
        activeProgramTypes={activeProgramTypes}
        clearAllFilters={clearAllFilters}
        updateFilter={updateFilter}
        handleProgramTypeClick={handleProgramTypeClick}
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-2xl text-gray-600">Loading...</div>
        </div>
      )}

      {!loading && dashboardData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <KPICard
              title="Total Reviewed Grievances"
              value={dashboardData.kpi.totalCount}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <ChartCard
                title="Top 10 Analysis (Radar View)"
                downloadCsv={() => {
                  let currentData: any[] = [];
                  let currentLabel = '';
                  let currentKey = '';

                  switch (radarView) {
                    case 'district':
                      currentData = dashboardData.districtSummary;
                      currentLabel = 'District';
                      currentKey = 'district';
                      break;
                    case 'department':
                      currentData = dashboardData.departmentSummary;
                      currentLabel = 'Department';
                      currentKey = 'departmentName';
                      break;
                    case 'taluka':
                      currentData = dashboardData.talukaSummary;
                      currentLabel = 'Taluka';
                      currentKey = 'taluka';
                      break;
                    case 'designation':
                      currentData = dashboardData.designationSummary;
                      currentLabel = 'Designation';
                      currentKey = 'forwardedToDesignation';
                      break;
                  }

                  const top10 = [...currentData].sort((a, b) => b.count - a.count).slice(0, 10);
                  downloadCsv({
                    data: top10.map((d: any) => ({
                      name: d[currentKey],
                      count: d.count,
                      percentage: d.percentage
                    })),
                    columns: [
                      { key: 'name', label: currentLabel },
                      { key: 'count', label: 'Count' },
                      { key: 'percentage', label: 'Percentage' }
                    ],
                    filename: `reviewed_top10_${radarView}.csv`
                  });
                }}
              >
                <TopTenRadarChart
                  districtData={dashboardData.districtSummary}
                  departmentData={dashboardData.departmentSummary}
                  talukaData={dashboardData.talukaSummary}
                  designationData={dashboardData.designationSummary}
                  selectedView={radarView}
                  onViewChange={setRadarView}
                  onItemClick={(type, value) => {
                    console.log('Parent onItemClick called:', { type, value });
                    const filterMap: Record<RadarViewType, keyof FilterState> = {
                      district: 'district',
                      department: 'departmentName',
                      taluka: 'taluka',
                      designation: 'forwardedToDesignation'
                    };
                    const filterKey = filterMap[type];
                    console.log('Mapped to filterKey:', filterKey);
                    handleChartClick(filterKey, value);
                  }}
                  onContextMenu={(params, type) => {
                    const filterMap: Record<RadarViewType, keyof FilterState> = {
                      district: 'district',
                      department: 'departmentName',
                      taluka: 'taluka',
                      designation: 'forwardedToDesignation'
                    };
                    handleContextMenu(params, filterMap[type]);
                  }}
                  selectedValue={
                    radarView === 'district' ? filters.district :
                      radarView === 'department' ? filters.departmentName :
                        radarView === 'taluka' ? filters.taluka :
                          filters.forwardedToDesignation
                  }
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard
                title={`Cross-Dimensional Heatmap${filters.grievanceReviewType ? ` (Filtered by: ${filters.grievanceReviewType})` : ''}`}
                downloadCsv={() => {
                  const xLabel = heatmapView === 'department-district' ? 'Department' : 'Taluka';
                  const yLabel = heatmapView === 'department-district' ? 'District' : 'Designation';

                  const xData = heatmapView === 'department-district'
                    ? dashboardData.departmentSummary.slice(0, 10)
                    : dashboardData.talukaSummary.slice(0, 10);

                  const yData = heatmapView === 'department-district'
                    ? dashboardData.districtSummary.slice(0, 10)
                    : dashboardData.designationSummary.slice(0, 10);

                  downloadCsv({
                    data: [
                      ...xData.map((d: any) => ({
                        dimension: xLabel,
                        name: heatmapView === 'department-district' ? d.departmentName : d.taluka,
                        count: d.count
                      })),
                      ...yData.map((d: any) => ({
                        dimension: yLabel,
                        name: heatmapView === 'department-district' ? d.district : d.forwardedToDesignation,
                        count: d.count
                      }))
                    ],
                    columns: [
                      { key: 'dimension', label: 'Dimension' },
                      { key: 'name', label: 'Name' },
                      { key: 'count', label: 'Count' }
                    ],
                    filename: `reviewed_heatmap_${heatmapView}.csv`
                  });
                }}
              >
                <DepartmentDistrictHeatmap
                  departmentData={dashboardData.departmentSummary}
                  districtData={dashboardData.districtSummary}
                  talukaData={dashboardData.talukaSummary}
                  designationData={dashboardData.designationSummary}
                  selectedView={heatmapView}
                  onViewChange={setHeatmapView}
                  filters={filters}
                  fromDate={fromDate}
                  toDate={toDate}
                  onItemClick={(xType, xValue, yType, yValue) => {
                    console.log('Heatmap parent onItemClick called:', { xType, xValue, yType, yValue });
                    updateFilter(xType as keyof FilterState, xValue);
                    updateFilter(yType as keyof FilterState, yValue);
                  }}
                  onContextMenu={(params, xType, yType, resolvedXValue, resolvedYValue) => {
                    setContextMenu({
                      visible: true,
                      x: params.event.event.clientX,
                      y: params.event.event.clientY,
                      data: { name: resolvedXValue, value: params.data[2] },
                      filterKey: xType as keyof FilterState
                    });
                  }}
                />
              </ChartCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Count by Dispose Channel" downloadCsv={handleDisposeChannelCsv}>
              <DisposeChannelCountDonut
                data={dashboardData.disposeChannelSummary}
                onBarClick={(channel) => handleChartClick('disposeChnl', channel)}
                onContextMenu={(params) => handleContextMenu(params, 'disposeChnl')}
                selectedValue={filters.disposeChnl}
              />
            </ChartCard>

            <ChartCard title="Grievance Review Type" downloadCsv={handleGrievanceReviewTypeCsv}>
              <GrievanceReviewTypePieChart
                data={dashboardData.grievanceReviewTypeSummary}
                onSliceClick={(value) => handleChartClick('grievanceReviewType', value)}
                onContextMenu={(params) => handleContextMenu(params, 'grievanceReviewType')}
                selectedValue={filters.grievanceReviewType}
              />
            </ChartCard>
          </div>
        </>
      )}
      <GlobalFilterButton />
    </div>
  );
}
