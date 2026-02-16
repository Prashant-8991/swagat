import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterState, ContextMenuState } from '../types';
import { buildDrillThroughUrl } from '../../../utils/drillthrough';
import { convertMonthToFilter } from '../utils/dateHelpers';

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
    const handleContextMenuEvent = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.chart-container')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenuEvent);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenuEvent);
    };
  }, []);

  const handleContextMenu = (
    params: any,
    filterKey: 'district' | 'taluka' | 'subjectCategory' | 'month' | 'aiCategory' | 'departmentName'
  ) => {
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
      sourcePage: 'temporal-analysis'
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null) {
        if (key === 'programTypes') {
          drillThroughContext.programTypes = value;
        } else {
          drillThroughContext[key] = value;
        }
      }
    });

    const clickedValue = contextMenu.data.name;
    const clickedKey = contextMenu.filterKey;

    if (clickedKey === 'month') {
      const monthFilter = convertMonthToFilter(clickedValue);
      drillThroughContext[clickedKey] = monthFilter;
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
