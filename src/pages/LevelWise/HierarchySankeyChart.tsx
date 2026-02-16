//@ts-nocheck
import { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import {
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { TreeNode } from 'primereact/treenode';
import { useTheme } from '../../context/ThemeContext';

echarts.use([
 SankeyChart,
 TooltipComponent,
 TitleComponent,
 LegendComponent,
 GridComponent,
 CanvasRenderer
]);

const LEVEL_CONFIG = {
 department: { depth: 0, color: '#8b5cf6', label: 'Department', icon: '🏛️'},
 district: { depth: 1, color: '#3b82f6', label: 'District', icon: '🏙️' },
 taluka: { depth: 2, color: '#10b981', label: 'Taluka', icon: '🏘️' },
 designation: { depth: 3, color: '#f59e0b', label: 'Designation', icon: '👤' }
};

const NODE_COLORS = {
 department: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#9333ea', '#a855f7'],
 district: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#0ea5e9', '#06b6d4'],
 taluka: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#14b8a6', '#2dd4bf'],
 designation: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#f97316', '#fb923c']
};

type DrillLevel = 'all' | 'department' | 'district' | 'taluka';

interface DrillState {
 level: DrillLevel;
 department?: string;
 district?: string;
 taluka?: string;
}

interface HierarchySankeyChartProps {
 treeData: TreeNode[];
 onLoadDistricts: (deptName: string) => Promise<any[]>;
 onLoadTalukas: (deptName: string, distName: string) => Promise<any[]>;
 onLoadDesignations: (deptName: string, distName: string, talName: string) => Promise<any[]>;
 onContextMenu?: (params: any, filterKey: string) => void;
 loading: boolean;
}

export default function HierarchySankeyChart({
 treeData,
 onLoadDistricts,
 onLoadTalukas,
 onLoadDesignations,
 onContextMenu,
 loading: externalLoading
}: HierarchySankeyChartProps) {
 const chartRef = useRef<any>(null);
 const { theme } = useTheme();
 
 const [drillState, setDrillState] = useState<DrillState>({ level: 'all' });
 const [loading, setLoading] = useState(false);
 
 const [districtCache, setDistrictCache] = useState<Record<string, any[]>>({});
 const [talukaCache, setTalukaCache] = useState<Record<string, any[]>>({});
 const [designationCache, setDesignationCache] = useState<Record<string, any[]>>({});

 const getBreadcrumb = () => {
 const crumbs: { label: string; level: DrillLevel; data?: any }[] = [
 { label: 'All Departments', level: 'all' }
 ];
 
 if (drillState.department) {
 crumbs.push({ label: `${drillState.department}`, level: 'department', data: drillState.department });
 }
 if (drillState.district) {
 crumbs.push({ label: `${drillState.district}`, level: 'district', data: drillState.district });
 }
 if (drillState.taluka) {
 crumbs.push({ label: `${drillState.taluka}`, level: 'taluka', data: drillState.taluka });
 }
 
 return crumbs;
 };

 const handleNodeClick = useCallback(async (nodeKey: string, nodeData: any) => {
 
 if (drillState.level === 'all') {
 if (nodeKey.startsWith('dept-')) {
 const deptName = nodeData.name;
 setLoading(true);
 
 try {
 if (!districtCache[deptName]) {
 const districts = await onLoadDistricts(deptName);
 setDistrictCache(prev => ({ ...prev, [deptName]: districts }));
 }
 setDrillState({ level: 'department', department: deptName });
 } finally {
 setLoading(false);
 }
 }
 } else if (drillState.level === 'department') {
 if (nodeKey.includes('-dist-')) {
 const distName = nodeData.name;
 const deptName = drillState.department!;
 const cacheKey = `${deptName}|${distName}`;
 setLoading(true);
 
 try {
 if (!talukaCache[cacheKey]) {
 const talukas = await onLoadTalukas(deptName, distName);
 setTalukaCache(prev => ({ ...prev, [cacheKey]: talukas }));
 }
 setDrillState({ level: 'district', department: deptName, district: distName });
 } finally {
 setLoading(false);
 }
 }
 } else if (drillState.level === 'district') {
 if (nodeKey.includes('-tal-')) {
 const talName = nodeData.name;
 const deptName = drillState.department!;
 const distName = drillState.district!;
 const cacheKey = `${deptName}|${distName}|${talName}`;
 setLoading(true);
 
 try {
 if (!designationCache[cacheKey]) {
 const designations = await onLoadDesignations(deptName, distName, talName);
 setDesignationCache(prev => ({ ...prev, [cacheKey]: designations }));
 }
 setDrillState({ level: 'taluka', department: deptName, district: distName, taluka: talName });
 } finally {
 setLoading(false);
 }
 }
 }
 }, [drillState, districtCache, talukaCache, designationCache, onLoadDistricts, onLoadTalukas, onLoadDesignations]);

 const handleNodeContextMenu = useCallback((nodeKey: string, nodeData: any, event: any) => {
 if (!onContextMenu) return;
 
 let filterKey: string;
 let contextData: { name: string; value: number; parentDept?: string; parentDist?: string; parentTal?: string };
 
 if (nodeKey.includes('-desig-')) {
 filterKey = 'forwardedToDesignation';
 contextData = {
 name: nodeData.name,
 value: nodeData.count || 0,
 parentDept: drillState.department,
 parentDist: drillState.district,
 parentTal: drillState.taluka
 };
 } else if (nodeKey.includes('-tal-')) {
 filterKey = 'taluka';
 contextData = {
 name: nodeData.name,
 value: nodeData.count || 0,
 parentDept: drillState.department,
 parentDist: drillState.district
 };
 } else if (nodeKey.includes('-dist-')) {
 filterKey = 'district';
 contextData = {
 name: nodeData.name,
 value: nodeData.count || 0,
 parentDept: drillState.department
 };
 } else if (nodeKey.startsWith('dept-')) {
 filterKey = 'departmentName';
 contextData = {
 name: nodeData.name,
 value: nodeData.count || 0
 };
 } else {
 return;
 }
 onContextMenu({ ...contextData, event }, filterKey);
 }, [onContextMenu, drillState]);

 const navigateTo = useCallback((level: DrillLevel) => {
 if (level === 'all') {
 setDrillState({ level: 'all' });
 } else if (level === 'department' && drillState.department) {
 setDrillState({ level: 'department', department: drillState.department });
 } else if (level === 'district' && drillState.department && drillState.district) {
 setDrillState({ level: 'district', department: drillState.department, district: drillState.district });
 }
 }, [drillState]);

 const { nodes, links, stats } = useMemo(() => {
 const nodes: any[] = [];
 const links: any[] = [];
 const visited = new Set<string>();
 const stats = { departments: 0, districts: 0, talukas: 0, designations: 0, totalCount: 0 };

 const addNode = (key: string, name: string, count: number, levelType: string, index: number, nodeData: any) => {
 if (visited.has(key)) return;
 visited.add(key);
 
 const palette = NODE_COLORS[levelType as keyof typeof NODE_COLORS];
 const config = LEVEL_CONFIG[levelType as keyof typeof LEVEL_CONFIG];
 
 nodes.push({
 name: key,
 displayName: name,
 value: Math.max(count || 1, 1),
 depth: config.depth,
 itemStyle: {
 color: palette[index % palette.length],
 borderColor: theme === 'dark' ? '#374151' : '#ffffff',
 borderWidth: 2
 },
 levelType,
 nodeData,
 clickable: levelType !== 'designation' && (
 (drillState.level === 'all' && levelType === 'department') ||
 (drillState.level === 'department' && levelType === 'district') ||
 (drillState.level === 'district' && levelType === 'taluka')
 )
 });
 
 if (levelType === 'department') stats.departments++;
 else if (levelType === 'district') stats.districts++;
 else if (levelType === 'taluka') stats.talukas++;
 else if (levelType === 'designation') stats.designations++;
 };

 if (drillState.level === 'all') {
 treeData.forEach((dept, deptIdx) => {
 const deptKey = `dept-${dept.data.name}`;
 addNode(deptKey, dept.data.name, dept.data.count, 'department', deptIdx, dept.data);
 stats.totalCount += dept.data.count || 0;
 });
 
 } else if (drillState.level === 'department') {
 const deptName = drillState.department!;
 const deptNode = treeData.find(d => d.data.name === deptName);
 
 if (deptNode) {
 const deptKey = `dept-${deptName}`;
 addNode(deptKey, deptName, deptNode.data.count, 'department', 0, deptNode.data);
 stats.totalCount = deptNode.data.count || 0;
 
 const districts = districtCache[deptName] || [];
 districts.forEach((dist, idx) => {
 const distKey = `${deptKey}-dist-${dist.levelValue}`;
 addNode(distKey, dist.levelValue, dist.count, 'district', idx, { name: dist.levelValue, count: dist.count, avgDisposalDays: dist.avgDisposalDays });
 
 links.push({
 source: deptKey,
 target: distKey,
 value: Math.max(dist.count || 1, 1)
 });
 });
 }
 
 } else if (drillState.level === 'district') {
 const deptName = drillState.department!;
 const distName = drillState.district!;
 const deptNode = treeData.find(d => d.data.name === deptName);
 const cacheKey = `${deptName}|${distName}`;
 
 if (deptNode) {
 const deptKey = `dept-${deptName}`;
 addNode(deptKey, deptName, deptNode.data.count, 'department', 0, deptNode.data);
 
 const districts = districtCache[deptName] || [];
 const distInfo = districts.find(d => d.levelValue === distName);
 const distKey = `${deptKey}-dist-${distName}`;
 addNode(distKey, distName, distInfo?.count || 0, 'district', 0, { name: distName, count: distInfo?.count, avgDisposalDays: distInfo?.avgDisposalDays });
 stats.totalCount = distInfo?.count || 0;
 
 links.push({
 source: deptKey,
 target: distKey,
 value: Math.max(distInfo?.count || 1, 1)
 });
 
 const talukas = talukaCache[cacheKey] || [];
 talukas.forEach((tal, idx) => {
 const talKey = `${distKey}-tal-${tal.levelValue}`;
 addNode(talKey, tal.levelValue, tal.count, 'taluka', idx, { name: tal.levelValue, count: tal.count, avgDisposalDays: tal.avgDisposalDays });
 
 links.push({
 source: distKey,
 target: talKey,
 value: Math.max(tal.count || 1, 1)
 });
 });
 }
 
 } else if (drillState.level === 'taluka') {
 const deptName = drillState.department!;
 const distName = drillState.district!;
 const talName = drillState.taluka!;
 const deptNode = treeData.find(d => d.data.name === deptName);
 const talukaCacheKey = `${deptName}|${distName}`;
 const desigCacheKey = `${deptName}|${distName}|${talName}`;
 
 if (deptNode) {
 const deptKey = `dept-${deptName}`;
 addNode(deptKey, deptName, deptNode.data.count, 'department', 0, deptNode.data);
 
 const districts = districtCache[deptName] || [];
 const distInfo = districts.find(d => d.levelValue === distName);
 const distKey = `${deptKey}-dist-${distName}`;
 addNode(distKey, distName, distInfo?.count || 0, 'district', 0, { name: distName, count: distInfo?.count });
 
 links.push({
 source: deptKey,
 target: distKey,
 value: Math.max(distInfo?.count || 1, 1)
 });
 
 const talukas = talukaCache[talukaCacheKey] || [];
 const talInfo = talukas.find(t => t.levelValue === talName);
 const talKey = `${distKey}-tal-${talName}`;
 addNode(talKey, talName, talInfo?.count || 0, 'taluka', 0, { name: talName, count: talInfo?.count, avgDisposalDays: talInfo?.avgDisposalDays });
 stats.totalCount = talInfo?.count || 0;
 
 links.push({
 source: distKey,
 target: talKey,
 value: Math.max(talInfo?.count || 1, 1)
 });
 
 const designations = designationCache[desigCacheKey] || [];
 designations.forEach((desig, idx) => {
 const desigKey = `${talKey}-desig-${desig.levelValue}`;
 addNode(desigKey, desig.levelValue, desig.count, 'designation', idx, { name: desig.levelValue, count: desig.count, avgDisposalDays: desig.avgDisposalDays });
 
 links.push({
 source: talKey,
 target: desigKey,
 value: Math.max(desig.count || 1, 1)
 });
 });
 }
 }

 return { nodes, links, stats };
 }, [treeData, drillState, districtCache, talukaCache, designationCache, theme]);

 const chartHeight = useMemo(() => {
 const maxNodes = Math.max(stats.departments, stats.districts, stats.talukas, stats.designations, 1);
 return Math.min(800, Math.max(400, maxNodes * 40));
 }, [stats]);

 const option = useMemo(() => {
 if (links.length === 0) return null;
 
 const isDark = theme === 'dark';
 
 return {
 backgroundColor: 'transparent',
 tooltip: {
 trigger: 'item',
 triggerOn: 'mousemove',
 confine: true,
 backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.98)',
 borderColor: isDark ? '#4b5563' : '#e5e7eb',
 borderWidth: 1,
 borderRadius: 8,
 padding: [10, 14],
 textStyle: { color: isDark ? '#f9fafb' : '#1f2937', fontSize: 12 },
 formatter: (params: any) => {
 if (params.dataType === 'node') {
 const d = params.data;
 const config = LEVEL_CONFIG[d.levelType as keyof typeof LEVEL_CONFIG];
 const avgDays = d.nodeData?.avgDisposalDays;
 const clickHint = d.clickable ? `<div style="margin-top:8px;font-size:11px;color:${config.color}">Click to drill down</div>` : '';
 const rightClickHint = `<div style="font-size:11px;color:#8B5CF6;font-style:italic">Right-click to drill through</div>`;
 return `
 <div>
 <div style="font-weight:600;margin-bottom:6px">${config.icon} ${d.displayName}</div>
 <div style="font-size:11px;color:#888;margin-bottom:4px">${config.label}</div>
 <div>Count: <b style="color:${config.color}">${(d.nodeData?.count || 0).toLocaleString()}</b></div>
 ${avgDays != null ? `<div>Avg Disposal: <b style="color:#f59e0b">${avgDays.toFixed(1)} days</b></div>` : ''}
 ${clickHint}
 ${rightClickHint}
 </div>
 `;
 }
 return `<div>Flow: <b>${(params.value || 0).toLocaleString()}</b></div>`;
 }
 },
 series: [{
 type: 'sankey',
 layout: 'none',
 layoutIterations: 32,
 emphasis: { focus: 'adjacency', lineStyle: { opacity: 0.5 } },
 nodeAlign: 'left',
 orient: 'horizontal',
 data: nodes,
 links: links,
 left: 60,
 right: 180,
 top: 20,
 bottom: 20,
 nodeWidth: 20,
 nodeGap: 14,
 draggable: true,
 lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.3 },
 label: {
 show: true,
 position: 'right',
 distance: 10,
 fontSize: 11,
 fontWeight: 500,
 color: isDark ? '#e5e7eb' : '#374151',
 formatter: (p: any) => {
 const name = p.data?.displayName || '';
 return name.length > 20 ? name.substring(0, 18) + '...' : name;
 }
 },
 levels: [
 { depth: 0, label: { position: 'left', distance: 10 }, lineStyle: { opacity: 0.35 } },
 { depth: 1, lineStyle: { opacity: 0.3 } },
 { depth: 2, lineStyle: { opacity: 0.25 } },
 { depth: 3, label: { position: 'right' }, lineStyle: { opacity: 0.2 } }
 ]
 }]
 };
 }, [nodes, links, theme]);

 const onEvents = useMemo(() => ({
 click: (params: any) => {
 if (params.dataType === 'node' && params.data.clickable) {
 handleNodeClick(params.data.name, params.data.nodeData);
 }
 },
 contextmenu: (params: any) => {
 if (params.dataType === 'node') {
 params.event?.event?.preventDefault?.();
 params.event?.event?.stopPropagation?.();
 handleNodeContextMenu(params.data.name, params.data.nodeData, params.event);
 }
 }
 }), [handleNodeClick, handleNodeContextMenu]);

 useEffect(() => {
 if (chartRef.current && option) {
 const chart = chartRef.current.getEchartsInstance();
 if (chart) chart.setOption(option, true);
 }
 }, [option]);

 const isLoading = loading || externalLoading;
 const breadcrumb = getBreadcrumb();
 const showDepartmentCards = drillState.level === 'all' && links.length === 0;

 return (
 <div className="relative">
 <div className="flex flex-wrap items-center gap-2 mb-4 px-2 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
 {breadcrumb.map((crumb, idx) => (
 <div key={idx} className="flex items-center">
 {idx > 0 && <span className="mx-2 text-gray-400">→</span>}
 <button
 onClick={() => navigateTo(crumb.level)}
 disabled={idx === breadcrumb.length - 1}
 className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
 idx === breadcrumb.length - 1
 ? 'bg-slate-100 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 cursor-default'
 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-teal-600'
 }`}
 >
 {crumb.label}
 </button>
 </div>
 ))}
 {isLoading && (
 <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
 <div className="animate-spin h-4 w-4 border-2 border-slate-200 border-t-teal-600 rounded-full"></div>
 <span>Loading...</span>
 </div>
 )}
 </div>

 {/* Stats */}
 <div className="flex flex-wrap items-center gap-4 mb-4 px-2">
 {stats.departments > 0 && (
 <div className="flex items-center gap-2">
 <span className="text-lg"></span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.departments} Dept</span>
 </div>
 )}
 {stats.districts > 0 && (
 <>
 <span className="text-gray-400">→</span>
 <div className="flex items-center gap-2">
 <span className="text-lg"></span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.districts} Districts</span>
 </div>
 </>
 )}
 {stats.talukas > 0 && (
 <>
 <span className="text-gray-400">→</span>
 <div className="flex items-center gap-2">
 <span className="text-lg"></span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.talukas} Talukas</span>
 </div>
 </>
 )}
 {stats.designations > 0 && (
 <>
 <span className="text-gray-400">→</span>
 <div className="flex items-center gap-2">
 <span className="text-lg"></span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.designations} Designations</span>
 </div>
 </>
 )}
 </div>

 {/* Department Cards (initial state) */}
 {showDepartmentCards && (
 <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
 <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
 <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
 
 <span><strong>Click on a department</strong> to see its districts and drill down further.</span>
 </p>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
 {treeData.map((dept, idx) => (
 <button
 key={dept.key}
 onClick={() => handleNodeClick(`dept-${dept.data.name}`, dept.data)}
 onContextMenu={(e) => {
 e.preventDefault();
 handleNodeContextMenu(`dept-${dept.data.name}`, dept.data, { event: e });
 }}
 disabled={isLoading}
 className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 border border-gray-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-all text-left group disabled:opacity-50"
 >
 <div className="w-3 h-10 rounded-sm flex-shrink-0" style={{ backgroundColor: NODE_COLORS.department[idx % NODE_COLORS.department.length] }} />
 <div className="flex-1 min-w-0">
 <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm group-hover:text-slate-700 dark:group-hover:text-slate-300">
 {dept.data.name}
 </div>
 <div className="text-xs text-gray-500 dark:text-gray-400">
 {(dept.data.count || 0).toLocaleString()} grievances
 </div>
 </div>
 <svg className="w-5 h-5 text-gray-400 group-hover:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Sankey Chart */}
 {!showDepartmentCards && links.length > 0 && (
 <div 
 className="w-full bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative"
 style={{ height: `${chartHeight}px` }}
 >
 {isLoading && (
 <div className="absolute inset-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/40 backdrop-blur-sm z-10 flex items-center justify-center">
 <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm dark:bg-gray-700/40 px-4 py-2 rounded-lg shadow-sm border">
 <div className="animate-spin h-5 w-5 border-2 border-slate-200 border-t-teal-600 rounded-full"></div>
 <span className="text-sm text-gray-600 dark:text-gray-300">Loading...</span>
 </div>
 </div>
 )}
 {option && (
 <ReactEChartsCore
 ref={chartRef}
 echarts={echarts}
 option={option}
 onEvents={onEvents}
 style={{ height: '100%', width: '100%' }}
 notMerge={true}
 lazyUpdate={false}
 />
 )}
 </div>
 )}

 {/* Empty state when no data */}
 {!showDepartmentCards && links.length === 0 && !isLoading && (
 <div className="flex flex-col items-center justify-center h-[300px] bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
 <div className="text-5xl mb-4"></div>
 <p className="text-gray-500 dark:text-gray-400">No data to display</p>
 </div>
 )}

 {/* Footer */}
 <div className="mt-3 px-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
 <div className="flex items-center gap-4">
 <span>Click to drill down</span>
 <span>Right-click to drill through</span>
 {links.length > 0 && <span>↔️ Drag to rearrange</span>}
 </div>
 <span>{nodes.length} nodes • {links.length} connections</span>
 </div>
 </div>
 );
}