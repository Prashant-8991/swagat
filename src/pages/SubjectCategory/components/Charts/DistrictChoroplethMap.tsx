//@ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';

import { ScatterChart } from 'echarts/charts';
import { VisualMapComponent } from 'echarts/components';
import { echarts } from '../../utils/chartConfig';
import { DistrictData } from '../../types';
import EmptyState from '../UI/EmptyState';

echarts.use([ScatterChart, VisualMapComponent]);

interface DistrictChoroplethMapProps {
  data: DistrictData[];
  onDistrictClick: (district: string) => void;
  onContextMenu: (params: any) => void;
  selectedDistrict: string | null;
}

let gujaratMapRegistered = false;
let gujaratMapLoading: Promise<void> | null = null;

const getCentroid = (coordinates: any[], type: string) => {
  let points: number[][] = [];

  const flatten = (coords: any[]) => {
    if (typeof coords[0] === 'number') {
      points.push(coords as number[]);
    } else {
      coords.forEach(flatten);
    }
  };

  flatten(coordinates);

  if (points.length === 0) return [0, 0];

  const x = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const y = points.reduce((sum, p) => sum + p[1], 0) / points.length;

  return [x, y];
};

async function loadGujaratMap(): Promise<void> {
  if (gujaratMapRegistered) return;
  if (gujaratMapLoading) {
    await gujaratMapLoading;
    return;
  }

  gujaratMapLoading = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}map/Guj_districts.geojson`);
      
      if (!res.ok) {
        throw new Error(`Failed to load GeoJSON: ${res.status}`);
      }
      
      const geo = await res.json();

      if (!geo) {
        throw new Error('Could not load GeoJSON from any location');
      }

      if (geo.features && Array.isArray(geo.features)) {
        geo.features.forEach((feature: any) => {
          if (feature.properties && feature.properties.District) {
            feature.properties.name = feature.properties.District;
          }
        });
      }

      echarts.registerMap('gujarat', geo);
      gujaratMapRegistered = true;
    } finally {
      gujaratMapLoading = null;
    }
  })();

  await gujaratMapLoading;
}

export default function DistrictChoroplethMap({
  data,
  onDistrictClick,
  onContextMenu,
  selectedDistrict
}: DistrictChoroplethMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [centroids, setCentroids] = useState<Record<string, number[]>>({});
  const chartRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        await loadGujaratMap();

        const mapData = echarts.getMap('gujarat');
        const newCentroids: Record<string, number[]> = {};

        if (mapData && mapData.geoJson && mapData.geoJson.features) {
          mapData.geoJson.features.forEach((f: any) => {
            const name = f.properties.name;
            if (name) {
              newCentroids[name] = getCentroid(f.geometry.coordinates, f.geometry.type);
            }
          });
        }

        if (mounted) {
          setCentroids(newCentroids);
          setMapReady(true);
        }
      } catch (e: any) {
        if (mounted) setMapError(e.message);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  if (mapError)
    return <EmptyState icon="⚠️" message={`Failed to load Gujarat map: ${mapError}`} />;

  if (!mapReady)
    return (
      <div className="h-[400px] md:h-[500px] w-full flex items-center justify-center">
        <div className="w-full h-full rounded-xl border border-black dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 animate-pulse"></div>
      </div>
    );

  const scatterData = data
    .filter(d => centroids[d.district])
    .map((d) => {
      return {
        name: d.district,
        value: [...centroids[d.district], d.count, d.percentage],
        selected: selectedDistrict === d.district
      };
    });

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const name = params.name;
        if (params.componentSubType === 'map') return name;

        const value = Array.isArray(params.value) ? params.value[2] : 0;
        const percentage = Array.isArray(params.value) ? params.value[3] : 0;

        return `
          <div style="padding:12px;max-width:320px">
            <div style="font-weight:700;margin-bottom:8px;color:#0c4a6e;font-size:15px;border-bottom:2px solid #e0f2fe;padding-bottom:6px;">${name}</div>
            <div style="margin-bottom:6px;"><span style="color:#64748b;font-size:12px;">Count: </span><span style="font-weight:700;color:#0ea5e9;font-size:14px;">${value.toLocaleString()}</span></div>
            <div><span style="color:#64748b;font-size:12px;">Percentage: </span><span style="font-weight:600;font-size:13px;">${percentage?.toFixed(2)}%</span></div>
          </div>
        `;
      }
    },
    
    visualMap: {
      min: 0,
      max: maxCount,
      dimension: 2, 
      inRange: {
        
        color: ['#22c55e', '#eab308', '#ef4444']
      },
      calculable: true,
      orient: 'vertical',
      left: 'left',
      bottom: 20,
      text: ['High', 'Low'],
      textStyle: { color: '#64748b' }
    },
    geo: {
      map: 'gujarat',
      roam: true,
      scaleLimit: { min: 0.8, max: 5 },
      label: { show: false },
      itemStyle: {
        areaColor: '#f1f5f9',
        borderColor: '#94a3b8',
        borderWidth: 1
      },
      emphasis: {
        label: { show: false },
        itemStyle: { areaColor: '#e2e8f0' }
      },
      select: {
        itemStyle: { areaColor: '#e2e8f0' },
        label: { show: false }
      }
    },
    series: [
      {
        name: 'District Counts',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: function (val: any[]) {
          const count = val[2];
          if (count === 0) return 0;
          
          return 10 + (count / maxCount) * 40;
        },
        symbol: 'circle',
        
        label: {
          show: false
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          opacity: 0.6
        },
        emphasis: {
          scale: true
        }
      }
    ]
  };

  const onEvents = {
    click: (params: any) => {
      if (params.name) {
        onDistrictClick(params.name);
      }
    },
    contextmenu: (params: any) => {
      if (params.name) {
        params.event.event.preventDefault();
        params.event.event.stopPropagation();
        onContextMenu(params);
      }
    }
  };

  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={option}
      onEvents={onEvents}
      style={{ height: '400px', width: '100%', cursor: 'pointer' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}