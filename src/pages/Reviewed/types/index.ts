
export interface FilterState {
  programTypes: string[];
  district: string | null;
  taluka: string | null;
  departmentName: string | null;
  disposeChnl: string | null;
  subjectCategory: string | null;
  forwardedToDesignation: string | null;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  data: {
    name: string;
    value: number;
  } | null;
  filterKey: keyof FilterState | null;
}
