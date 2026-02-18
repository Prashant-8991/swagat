//@ts-nocheck
import { useState } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { setgSwagatData } from '../../../redux/features/globalfilters';
import { FilterState } from '../types';
import { convertMonthToFilter } from '../utils/dateHelpers';

export function useFilters() {
 const dispatch = useAppDispatch();

 const [filters, setFilters] = useState<FilterState>({
 programTypes: null,
 district: null,
 taluka: null,
 subjectCategory: null,
 subStatusName: null,
 aiCategory: null,
 month: null,
 departmentName: null,
 grievanceStatus: null,
 disposeChnl: null
 });

 const updateFilter = (key: keyof FilterState, value: string | string[] | null) => {
 const newFilters = { ...filters, [key]: value };

 
 if (key === 'district' && value === null) {
 newFilters.taluka = null;
 }

 setFilters(newFilters);
 };

 const handleProgramTypeClick = (type: string) => {
 const currentProgramTypes = filters.programTypes || [];

 if (currentProgramTypes.includes(type)) {
 
 const newProgramTypes = currentProgramTypes.filter(t => t !== type);
 updateFilter('programTypes', newProgramTypes.length > 0 ? newProgramTypes : null);
 } else {
 
 updateFilter('programTypes', [...currentProgramTypes, type]);
 }
 };

 const handleDistrictClick = (district: string) => {
 if (filters.district === district) {
 updateFilter('district', null);
 } else {
 updateFilter('district', district);
 }
 };

 const newupdateFilter = (key: keyof FilterState, value: string) => {
 const newFilters = { ...filters, [key]: value };
 setFilters(newFilters);
 };

 const handleTalukaClick = (taluka: string) => {
 if (filters.taluka === taluka) {
 updateFilter('taluka', null);
 } else {
 updateFilter('taluka', taluka);
 }
 };

 const handleDepartmentClick = (departmentName: string) => {
 if (filters.departmentName === departmentName) {
 updateFilter('departmentName', null);
 } else {
 updateFilter('departmentName', departmentName);
 }
 };

 const handleSubjectClick = (subject: string) => {
 if (filters.subjectCategory === subject) {
 updateFilter('subjectCategory', null);
 } else {
 updateFilter('subjectCategory', subject);
 }
 };

 const handleSubStatusClick = (subStatus: string) => {
 if (filters.subStatusName === subStatus) {
 updateFilter('subStatusName', null);
 } else {
 updateFilter('subStatusName', subStatus);
 }
 };

 const handleMonthClick = (monthDisplay: string) => {
 const monthFilter = convertMonthToFilter(monthDisplay);
 if (filters.month === monthFilter) {
 updateFilter('month', null);
 } else {
 updateFilter('month', monthFilter);
 }
 };

 const handleAICategoryClick = (aiCategory: string) => {
 if (filters.aiCategory === aiCategory) {
 updateFilter('aiCategory', null);
 } else {
 updateFilter('aiCategory', aiCategory);
 }
 };

 const handleGrievanceStatusClick = (status: string | null) => {
 updateFilter('grievanceStatus', status);
 };

 const handleDisposeChannelClick = (channel: string | null) => {
 updateFilter('disposeChnl', channel);
 };

 const clearFilters = () => {
 
 setFilters({
 programTypes: null,
 district: null,
 taluka: null,
 subjectCategory: null,
 subStatusName: null,
 aiCategory: null,
 month: null,
 departmentName: null,
 grievanceStatus: null,
 disposeChnl: null
 });

 
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

 const hasActiveFilters = Object.values(filters).some(v => {
 if (Array.isArray(v)) return v.length > 0;
 return v !== null;
 });

 return {
 filters,
 updateFilter,
 handleProgramTypeClick,
 handleDistrictClick,
 handleTalukaClick,
 handleSubjectClick,
 handleAICategoryClick,
 handleMonthClick,
 handleGrievanceStatusClick,
 handleDisposeChannelClick,
 clearFilters,
 hasActiveFilters,
 handleDepartmentClick,
 newupdateFilter
 };
}
