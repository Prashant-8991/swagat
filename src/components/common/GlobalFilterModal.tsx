// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { HiFunnel, HiXMark, HiMagnifyingGlass, HiChevronDown, HiChevronUp, HiCheck, HiTrash } from 'react-icons/hi2';
import { useQuery } from '@apollo/client/react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setgSwagatData } from '../../redux/features/globalfilters';
import {
  GET_ALL_FILTER_OPTIONS,
  GET_UNIQUE_TALUKAS
} from '../../graphql/globalQueries';

interface GlobalFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROGRAM_TYPES = [
  { value: 'GS', label: 'GS', color: 'from-blue-600 to-blue-700' },
  { value: 'TS', label: 'TS', color: 'from-green-600 to-green-700' },
  { value: 'DS', label: 'DS', color: 'from-purple-600 to-purple-700' },
  { value: 'LF', label: 'LF', color: 'from-orange-600 to-orange-700' },
  { value: 'RLF', label: 'RLF', color: 'from-red-600 to-red-700' },
  { value: 'WTC', label: 'WTC', color: 'from-pink-600 to-pink-700' },
];

export default function GlobalFilterModal({ isOpen, onClose }: GlobalFilterModalProps) {
  const dispatch = useAppDispatch();
  const globalFilters = useAppSelector((state) => state.gSwagat);

  const [districtSearch, setDistrictSearch] = useState('');
  const [talukaSearch, setTalukaSearch] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('programType');

  const { data: filterOptionsData, loading: filterOptionsLoading } = useQuery(GET_ALL_FILTER_OPTIONS, {
    fetchPolicy: 'cache-first',
  });

  const { data: talukaData, loading: talukaLoading } = useQuery(GET_UNIQUE_TALUKAS, {
    variables: { district: globalFilters.districts[0] || "" },
    skip: !globalFilters.districts[0],
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const updateGlobalFilters = (updates: Partial<typeof globalFilters>) => {
    dispatch(setgSwagatData({
      ...globalFilters,
      ...updates
    }));
  };

  const handleProgramTypeClick = (type: string) => {
    const currentTypes = globalFilters.programTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateGlobalFilters({ programTypes: newTypes });
  };

  const handleDistrictClick = (district: string) => {
    const isSelected = globalFilters.districts.includes(district);
    if (isSelected) {
      updateGlobalFilters({
        districts: [],
        talukas: []
      });
    } else {
      updateGlobalFilters({
        districts: [district],
        talukas: []
      });
    }
  };

  const handleTalukaClick = (taluka: string) => {
    const currentTalukas = globalFilters.talukas;
    const newTalukas = currentTalukas.includes(taluka)
      ? currentTalukas.filter(t => t !== taluka)
      : [...currentTalukas, taluka];
    updateGlobalFilters({ talukas: newTalukas });
  };

  const handleDepartmentClick = (department: string) => {
    const isSelected = globalFilters.departments.includes(department);
    updateGlobalFilters({
      departments: isSelected ? [] : [department]
    });
  };

  const handleGrievanceStatusClick = (status: string) => {
    const isSelected = globalFilters.grievanceStatuses.includes(status);
    updateGlobalFilters({
      grievanceStatuses: isSelected ? [] : [status]
    });
  };

  const handleSubStatusClick = (status: string) => {
    const currentStatuses = globalFilters.subStatuses;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateGlobalFilters({ subStatuses: newStatuses });
  };

  const handleDisposeChannelClick = (channel: string) => {
    const isSelected = globalFilters.disposeChannels.includes(channel);
    updateGlobalFilters({
      disposeChannels: isSelected ? [] : [channel]
    });
  };

  const clearAllFilters = () => {
    updateGlobalFilters({
      programTypes: [],
      districts: [],
      talukas: [],
      departments: [],
      grievanceStatuses: [],
      subStatuses: [],
      disposeChannels: []
    });
  };

  const filteredDistricts = useMemo(() => {
    const districts = filterOptionsData?.globalFilters?.districts || [];
    return districts.filter((d: string) =>
      d.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [filterOptionsData, districtSearch]);

  const filteredTalukas = useMemo(() => {
    const talukas = talukaData?.globalFilters?.talukas || [];
    return talukas.filter((t: string) =>
      t.toLowerCase().includes(talukaSearch.toLowerCase())
    );
  }, [talukaData, talukaSearch]);

  const filteredDepartments = useMemo(() => {
    const departments = filterOptionsData?.globalFilters?.departments || [];
    return departments.filter((d: string) =>
      d.toLowerCase().includes(departmentSearch.toLowerCase())
    );
  }, [filterOptionsData, departmentSearch]);

  const grievanceStatuses = filterOptionsData?.globalFilters?.grievanceStatuses || [];
  const subStatuses = filterOptionsData?.globalFilters?.subStatuses || [];
  const disposeChannels = filterOptionsData?.globalFilters?.disposeChannels || [];

  const activeFilterCount = 
    globalFilters.programTypes.length +
    globalFilters.districts.length +
    globalFilters.talukas.length +
    globalFilters.departments.length +
    globalFilters.grievanceStatuses.length +
    globalFilters.subStatuses.length +
    globalFilters.disposeChannels.length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <>
      <div
        className={`
          fixed inset-0 z-[300] bg-black/10 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      <div
        className={`
          fixed inset-y-0 right-0 z-[300] w-full sm:w-[400px] bg-white dark:bg-gray-900 
          shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-l border-gray-200 dark:border-gray-800
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                <HiFunnel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Global Filters</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Apply filters across all pages</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <HiXMark className="w-6 h-6" />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-800"
            >
              <HiTrash className="w-4 h-4" />
              Clear All Filters ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-white dark:bg-gray-900">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => toggleSection('programType')}
              className="w-full flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Program Type
                </h3>
                {globalFilters.programTypes.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    {globalFilters.programTypes.length} Selected
                  </span>
                )}
              </div>
              {expandedSection === 'programType' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSection === 'programType' && (
              <div className="grid grid-cols-3 gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {PROGRAM_TYPES.map((type) => {
                  const isActive = globalFilters.programTypes.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleProgramTypeClick(type.value)}
                      className={`
                        relative px-2 py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 flex items-center justify-center overflow-hidden group
                        ${isActive
                          ? `bg-gradient-to-br ${type.color} text-white shadow-lg shadow-indigo-500/20`
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute top-0.5 right-0.5">
                          <HiCheck className="w-3 h-3 text-white/80" />
                        </div>
                      )}
                      {type.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => toggleSection('status')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Grievance Status
                </h3>
                {globalFilters.grievanceStatuses.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    {globalFilters.grievanceStatuses[0]}
                  </span>
                )}
              </div>
              {expandedSection === 'status' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSection === 'status' && (
              <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {filterOptionsLoading && grievanceStatuses.length === 0 ? (
                  <div className="text-gray-400 text-xs italic">Loading statuses...</div>
                ) : grievanceStatuses.length > 0 ? (
                  <>
                    {grievanceStatuses.map((status: string) => (
                      <button
                        key={status}
                        onClick={() => handleGrievanceStatusClick(status)}
                        className={`
                          px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-200 border
                          ${globalFilters.grievanceStatuses.includes(status)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                          }
                        `}
                      >
                        {status}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">No statuses found</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => toggleSection('subStatusName')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Sub Status
                </h3>
                {globalFilters.subStatuses.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    {globalFilters.subStatuses.length} Selected
                  </span>
                )}
              </div>
              {expandedSection === 'subStatusName' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSection === 'subStatusName' && (
              <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {filterOptionsLoading && subStatuses.length === 0 ? (
                  <div className="text-gray-400 text-xs italic">Loading sub statuses...</div>
                ) : subStatuses.length > 0 ? (
                  <>
                    {subStatuses.filter((status: string) => status !== '-').map((status: string) => (
                      <button
                        key={status}
                        onClick={() => handleSubStatusClick(status)}
                        className={`
                          px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-200 border
                          ${globalFilters.subStatuses.includes(status)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                          }
                        `}
                      >
                        {status}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">No sub statuses found</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => toggleSection('channel')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Dispose Channel
                </h3>
                {globalFilters.disposeChannels.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    {globalFilters.disposeChannels[0]}
                  </span>
                )}
              </div>
              {expandedSection === 'channel' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSection === 'channel' && (
              <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {filterOptionsLoading && disposeChannels.length === 0 ? (
                  <div className="text-gray-400 text-xs italic">Loading channels...</div>
                ) : disposeChannels.length > 0 ? (
                  <>
                    {disposeChannels.map((channel: string) => (
                      <button
                        key={channel}
                        onClick={() => handleDisposeChannelClick(channel)}
                        className={`
                          px-3 py-1.5 rounded-full font-medium text-xs transition-all duration-200 border
                          ${globalFilters.disposeChannels.includes(channel)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'
                          }
                        `}
                      >
                        {channel}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">No channels found</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => toggleSection('district')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  District
                </h3>
                {globalFilters.districts.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                    {globalFilters.districts[0]}
                  </span>
                )}
              </div>
              {expandedSection === 'district' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSection === 'district' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="relative mb-3">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search district..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
                  {filterOptionsLoading ? (
                    <div className="text-center py-4 text-gray-400 text-xs">Loading districts...</div>
                  ) : filteredDistricts.length > 0 ? (
                    <>
                      {globalFilters.districts.length > 0 && (
                        <button
                          onClick={() => updateGlobalFilters({ districts: [], talukas: [] })}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium"
                        >
                          <HiXMark className="w-4 h-4" /> Clear Selection
                        </button>
                      )}
                      {filteredDistricts.map((district: string) => (
                        <button
                          key={district}
                          onClick={() => handleDistrictClick(district)}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                            ${globalFilters.districts.includes(district)
                              ? 'bg-indigo-600 text-white font-medium shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {district}
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">No districts found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {globalFilters.districts.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => toggleSection('taluka')}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    Taluka
                  </h3>
                  {globalFilters.talukas.length > 0 && (
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                      {globalFilters.talukas.length} Selected
                    </span>
                  )}
                </div>
                {expandedSection === 'taluka' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expandedSection === 'taluka' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative mb-3">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search taluka..."
                      value={talukaSearch}
                      onChange={(e) => setTalukaSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
                    {talukaLoading ? (
                      <div className="text-center py-4 text-gray-400 text-xs">Loading talukas...</div>
                    ) : filteredTalukas.length > 0 ? (
                      <>
                        {globalFilters.talukas.length > 0 && (
                          <button
                            onClick={() => updateGlobalFilters({ talukas: [] })}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium"
                          >
                            <HiXMark className="w-4 h-4" /> Clear Selection
                          </button>
                        )}
                        {filteredTalukas.map((taluka: string) => (
                          <button
                            key={taluka}
                            onClick={() => handleTalukaClick(taluka)}
                            className={`
                              w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200
                              ${globalFilters.talukas.includes(taluka)
                                ? 'bg-indigo-600 text-white font-medium shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }
                            `}
                          >
                            {taluka}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-xs">No talukas found for this district</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
            <button
              onClick={() => toggleSection('department')}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                  Department
                </h3>
                {globalFilters.departments.length > 0 && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium truncate max-w-[100px]">
                    {globalFilters.departments[0]}
                  </span>
                )}
              </div>
              {expandedSection === 'department' ? <HiChevronUp className="w-4 h-4 text-gray-400" /> : <HiChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedSection === 'department' && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="relative mb-3">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search department..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
                  {filterOptionsLoading && filteredDepartments.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">Loading departments...</div>
                  ) : filteredDepartments.length > 0 ? (
                    <>
                      {globalFilters.departments.length > 0 && (
                        <button
                          onClick={() => updateGlobalFilters({ departments: [] })}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium"
                        >
                          <HiXMark className="w-4 h-4" /> Clear Selection
                        </button>
                      )}
                      {filteredDepartments.map((department: string) => (
                        <button
                          key={department}
                          onClick={() => handleDepartmentClick(department)}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 truncate
                            ${globalFilters.departments.includes(department)
                              ? 'bg-indigo-600 text-white font-medium shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                          `}
                          title={department}
                        >
                          {department}
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">No departments found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-20"></div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
