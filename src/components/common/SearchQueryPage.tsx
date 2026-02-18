//@ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import {
 ColDef,
 AllCommunityModule,
 ModuleRegistry,
 GridReadyEvent,
 IDatasource,
 IGetRowsParams,
 GridApi,
 RowClickedEvent
} from 'ag-grid-community';
import Modal from 'react-modal';
import { IoMdClose } from 'react-icons/io';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { echarts } from '../../pages/SubjectCategory/utils/chartConfig';
import { ScatterChart } from 'echarts/charts';
import { VisualMapComponent } from 'echarts/components';

echarts.use([ScatterChart, VisualMapComponent]);

ModuleRegistry.registerModules([AllCommunityModule]);

interface SearchResult {
 Subject: string;
 Subject_Category: string;
 App_Name: string;
 Inward_No: string;
 Mobile_No: string;
 Question_District: string;
 similarity_score: number;
}

interface DistrictData {
 district: string;
 count: number;
 percentage: number;
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
 const res = await fetch('/map/Guj_districts.geojson');
 
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

const SearchQueryPage = () => {
 const { searchQuery } = useParams();
 const [gridApi, setGridApi] = useState<GridApi | null>(null);
 const [selectedRow, setSelectedRow] = useState<SearchResult | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [districtData, setDistrictData] = useState<DistrictData[]>([]);
 const [mapReady, setMapReady] = useState(false);
 const [mapError, setMapError] = useState<string | null>(null);
 const [centroids, setCentroids] = useState<Record<string, number[]>>({});
 const [allResults, setAllResults] = useState<SearchResult[]>([]);
 const chartRef = useRef<any>(null);

 const [colDefs] = useState<ColDef<SearchResult>[]>([
 { field: "Subject", headerName: "Subject", flex: 2, filter: true },
 { field: "Subject_Category", headerName: "Category", flex: 1, filter: true },
 { field: "App_Name", headerName: "Applicant Name", flex: 1, filter: true },
 { field: "Inward_No", headerName: "Inward No", flex: 1, filter: true },
 { field: "Mobile_No", headerName: "Mobile No", flex: 1, filter: true },
 { field: "Question_District", headerName: "District", flex: 1, filter: true },
 {
 field: "similarity_score",
 headerName: "Score",
 flex: 0.5,
 valueFormatter: (params) => params.value ? params.value.toFixed(4) : '',
 sortable: true
 }
 ]);

 const onGridReady = (params: GridReadyEvent) => {
 setGridApi(params.api);
 };

 const onRowClicked = (params: RowClickedEvent<SearchResult>) => {
 if (params.data) {
 setSelectedRow(params.data);
 setIsModalOpen(true);
 }
 };

 const closeModal = () => {
 setIsModalOpen(false);
 setTimeout(() => setSelectedRow(null), 200); 
 };

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

 useEffect(() => {
 if (allResults.length === 0) {
 setDistrictData([]);
 return;
 }

 const districtCounts: Record<string, number> = {};
 let total = 0;

 allResults.forEach(result => {
 if (result.Question_District) {
 const district = result.Question_District.trim();
 districtCounts[district] = (districtCounts[district] || 0) + 1;
 total++;
 }
 });

 const processedData: DistrictData[] = Object.entries(districtCounts).map(([district, count]) => ({
 district,
 count,
 percentage: total > 0 ? (count / total) * 100 : 0
 }));

 processedData.sort((a, b) => b.count - a.count);
 setDistrictData(processedData);
 }, [allResults]);

 useEffect(() => {
 if (!gridApi || !searchQuery) return;

 const dataSource: IDatasource = {
 getRows: async (params: IGetRowsParams) => {
 const { startRow, endRow } = params;
 const blockSize = endRow - startRow;
 const page = Math.floor(startRow / blockSize) + 1;

 try {
 const response = await fetch(import.meta.env.VITE_SEARCH_API_URL, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 query: searchQuery,
 top_k: blockSize,
 page: page
 }),
 });

 if (!response.ok) {
 throw new Error(`Error: ${response.status} ${response.statusText}`);
 }

 const data = await response.json();

 let lastRow = -1;
 if (data.results && data.results.length < blockSize) {
 lastRow = startRow + data.results.length;
 }

 if (data.results) {
 params.successCallback(data.results, lastRow);
 setAllResults(prev => {
 const existing = new Set(prev.map(r => r.Inward_No));
 const newResults = data.results.filter((r: SearchResult) => !existing.has(r.Inward_No));
 return [...prev, ...newResults];
 });
 } else {
 params.successCallback([], 0);
 }

 } catch (err) {
 console.error("Search API Error:", err);
 params.failCallback();
 }
 }
 };

 gridApi.setGridOption('datasource', dataSource);
 setAllResults([]);
 }, [gridApi, searchQuery]);

 const getMapOption = () => {
 if (!mapReady || districtData.length === 0) return {};

 const maxCount = Math.max(...districtData.map(d => d.count), 1);

 const scatterData = districtData
 .filter(d => centroids[d.district])
 .map((d) => ({
 name: d.district,
 value: [...centroids[d.district], d.count, d.percentage]
 }));

 return {
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
 label: { show: false },
 itemStyle: {
 shadowBlur: 10,
 shadowColor: 'rgba(0, 0, 0, 0.3)',
 opacity: 0.8
 },
 emphasis: {
 scale: true,
 itemStyle: {
 opacity: 1
 }
 }
 }
 ]
 };
 };

 return (
 <div className="p-6 h-full flex flex-col relative">
 <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
 Search Results for: <span className="text-blue-600 dark:text-blue-400">"{searchQuery}"</span>
 </h1>


 <div className="ag-theme-quartz h-[600px] w-full shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
 <AgGridReact
 columnDefs={colDefs}
 rowModelType="infinite"
 pagination={true}
 paginationPageSize={10}
 paginationPageSizeSelector={[5, 10, 15, 20]}
 cacheBlockSize={100}
 onGridReady={onGridReady}
 maxBlocksInCache={100}
 onRowClicked={onRowClicked}
 rowSelection="single"
 rowClass="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
 />
 </div>

 <Modal
 isOpen={isModalOpen}
 onRequestClose={closeModal}
 contentLabel="Row Details"
 className="fixed inset-0 flex items-center justify-center p-4 z-50 outline-none"
 overlayClassName="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
 ariaHideApp={false} 
 >
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
 <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/50">
 <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
 Grievance Details
 </h2>
 <button
 onClick={closeModal}
 className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-all"
 >
 <IoMdClose size={24} />
 </button>
 </div>

 <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
 {selectedRow && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="col-span-1 md:col-span-2 space-y-1">
 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</label>
 <p className="text-lg text-gray-900 dark:text-white font-medium leading-relaxed bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
 {selectedRow.Subject}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
 <p className="text-base text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-700 pb-1">
 {selectedRow.Subject_Category}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicant Name</label>
 <p className="text-base text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-700 pb-1">
 {selectedRow.App_Name}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inward No</label>
 <p className="text-base text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-700 pb-1">
 {selectedRow.Inward_No}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mobile No</label>
 <p className="text-base text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-700 pb-1">
 {selectedRow.Mobile_No}
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">District</label>
 <p className="text-base text-gray-800 dark:text-gray-200 font-medium border-b border-gray-100 dark:border-gray-700 pb-1">
 {selectedRow.Question_District}
 </p>
 </div>
 </div>
 )}
 </div>

 <div className="px-6 py-4 bg-white/80 backdrop-blur-sm dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
 <button
 onClick={closeModal}
 className="px-5 py-2.5 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-200"
 >
 Close
 </button>
 <button
 className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
 onClick={() => alert("Action triggered for " + selectedRow?.Inward_No)}
 >
 View Full Report
 </button>
 </div>
 </div>
 </Modal>

 {mapReady && districtData.length > 0 && (
 <div className="mb-6">
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
 <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
 District Distribution
 </h2>
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={getMapOption()}
 style={{ height: '500px', width: '100%' }}
 notMerge={true}
 lazyUpdate={true}
 />
 </div>
 </div>
 )}

 {mapError && (
 <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
 <p className="text-yellow-800 dark:text-yellow-200">⚠️ Map loading error: {mapError}</p>
 </div>
 )}
 </div>
 );
}

export default SearchQueryPage;
