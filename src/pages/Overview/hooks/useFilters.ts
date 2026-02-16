//@ts-nocheck
import { useState } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { setgSwagatData } from '../../../redux/features/globalfilters';
import { FilterState } from '../types';

export function useFilters() {
 const dispatch = useAppDispatch();

 const [filters, setFilters] = useState<FilterState>({
 district: null,
 departmentName: null,
 disposeChnl: null,
 grievanceStatus: null,
 programTypes: null
 });

 const [activeProgramTypes, setActiveProgramTypes] = useState<string[]>([]);

 const updateFilter = (key: keyof FilterState, value: string | string[] | null) => {
 setFilters(prev => ({ ...prev, [key]: value }));
 };

 const handleProgramTypeClick = (type: string | null) => {
 if (type === null) {

 setActiveProgramTypes([]);
 updateFilter('programTypes', null);
 return;
 }

 setActiveProgramTypes(prev => {
 const newTypes = prev.includes(type)
 ? prev.filter(t => t !== type)
 : [...prev, type];


 updateFilter('programTypes', newTypes.length > 0 ? newTypes : null);

 return newTypes;
 });
 };

 const clearAllFilters = () => {

 setFilters({
 district: null,
 departmentName: null,
 disposeChnl: null,
 grievanceStatus: null,
 programTypes: null
 });
 setActiveProgramTypes([]);

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

 const hasActiveFilters = Object.values(filters).some(v => v !== null);

 return {
 filters,
 activeProgramTypes,
 updateFilter,
 handleProgramTypeClick,
 clearAllFilters,
 hasActiveFilters
 };
}
