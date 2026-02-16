//@ts-nocheck
import { useMemo } from 'react';
import { useAppSelector } from '../redux/hooks';

export function useGlobalFilters(localFilters?: Record<string, string | string[] | null>) {
 const globalFilters = useAppSelector((state) => state.gSwagat || {});

 const combinedFilters = useMemo(() => {
 const filters: Record<string, string | string[] | null | undefined> = {
 ...localFilters,
 };

 if (globalFilters.programTypes?.length > 0) {
 filters.programTypes = globalFilters.programTypes;
 }

 if (globalFilters.districts?.length > 0) {
 filters.district = globalFilters.districts[0];
 }

 if (globalFilters.talukas?.length > 0) {
 filters.taluka = globalFilters.talukas[0];
 }

 if (globalFilters.departments?.length > 0) {
 filters.departmentName = globalFilters.departments[0];
 }

 if (globalFilters.grievanceStatuses?.length > 0) {
 filters.grievanceStatus = globalFilters.grievanceStatuses[0];
 }

 if (globalFilters.subStatuses?.length > 0) {
 filters.subStatusName = globalFilters.subStatuses[0];
 }

 if (globalFilters.disposeChannels?.length > 0) {
 filters.disposeChnl = globalFilters.disposeChannels[0];
 }

 return filters;
 }, [globalFilters, localFilters]);

 return {
 filters: combinedFilters,
 globalFilters,
 hasGlobalFilters: 
 (globalFilters.programTypes?.length || 0) > 0 ||
 (globalFilters.districts?.length || 0) > 0 ||
 (globalFilters.talukas?.length || 0) > 0 ||
 (globalFilters.departments?.length || 0) > 0 ||
 (globalFilters.grievanceStatuses?.length || 0) > 0 ||
 (globalFilters.subStatuses?.length || 0) > 0 ||
 (globalFilters.disposeChannels?.length || 0) > 0
 };
}
