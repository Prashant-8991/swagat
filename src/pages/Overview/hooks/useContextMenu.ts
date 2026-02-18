import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextMenuState, FilterState } from '../types';
import { buildDrillThroughUrl } from '../../../utils/drillthrough';

export function useContextMenu(filters: FilterState) {
 const navigate = useNavigate();

 const [contextMenu, setContextMenu] = useState<ContextMenuState>({
 visible: false,
 x: 0,
 y: 0,
 data: null,
 filterKey: null
 });

 useEffect(() => {
 const handleContextMenu = (e: MouseEvent) => {
 const target = e.target as HTMLElement;
 if (target.closest('.chart-container')) {
 e.preventDefault();
 }
 };

 document.addEventListener('contextmenu', handleContextMenu);
 return () => document.removeEventListener('contextmenu', handleContextMenu);
 }, []);

 const handleContextMenu = (params: any, filterKey: keyof FilterState) => {
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
 };

 const closeContextMenu = () => {
 setContextMenu({
 visible: false,
 x: 0,
 y: 0,
 data: null,
 filterKey: null
 });
 };

 const handleDrillThrough = () => {
 if (!contextMenu.data || !contextMenu.filterKey) return;

 const drillThroughContext: Record<string, any> = {
 sourcePage: 'overview'
 };
 Object.entries(filters).forEach(([key, value]) => {
 if (value !== null) {
 
 if (key === 'disposeChnl') {
 drillThroughContext['disposeChannel'] = value;
 } else if (key === 'programTypeGroup') {
 
 drillThroughContext['programTypeGroup'] = value === 'Other' ? 'Swagat' : value;
 } else if (key === 'grievanceStatus') {
 
 drillThroughContext["grievanceStatus"] = value;
 } else {
 drillThroughContext[key] = value;
 }
 }
 });

 const clickedValue = contextMenu.data.name;
 const clickedKey = contextMenu.filterKey;

 if (clickedKey === 'disposeChnl') {
 drillThroughContext['disposeChannel'] = clickedValue;
 } else {
 drillThroughContext[clickedKey] = clickedValue;
 }

 const url = buildDrillThroughUrl(drillThroughContext);
 navigate(url);
 closeContextMenu();
 };

 return {
 contextMenu,
 handleContextMenu,
 closeContextMenu,
 handleDrillThrough
 };
}
