// @ts-nocheck
import { useQuery } from '@apollo/client/react';
import {
 GET_FILTER_OPTIONS,
} from '../../graphql/queries';

interface ProgramTypeFilterProps {
 activeProgramTypes: string[] | null;
 onProgramTypeClick: (type: string) => void;

 hasActiveFilters: boolean;
 onClearAllFilters: () => void;
}

const PROGRAM_TYPES = [
 { value: 'GS', label: 'GS', color: 'from-blue-600 to-blue-700' },
 { value: 'TS', label: 'TS', color: 'from-green-600 to-green-700' },
 { value: 'DS', label: 'DS', color: 'from-teal-600 to-teal-700' },
 { value: 'LF', label: 'LF', color: 'from-orange-600 to-orange-700' },
 { value: 'RLF', label: 'RLF', color: 'from-red-600 to-red-700' },
 { value: 'WTC', label: 'WTC', color: 'from-pink-600 to-pink-700' },
];

export default function ProgramTypeFilter({
 activeProgramTypes,
 onProgramTypeClick,
 hasActiveFilters,
 onClearAllFilters,
}: ProgramTypeFilterProps) {

 const { data: filterOptionsData, loading: filterOptionsLoading } = useQuery(GET_FILTER_OPTIONS, {
 fetchPolicy: 'cache-first',
 });


 const activeFilterCount = (activeProgramTypes?.length || 0)

 return (
 <>
 
 </>
 );
}
