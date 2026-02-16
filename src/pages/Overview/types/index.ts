
export interface FilterState {
 district: string | null;
 taluka: string | null;
 departmentName: string | null;
 forwardedToDesignation: string | null;
 disposeChnl: string | null;
 grievanceStatus: string | null;
 programTypes: string[] | null;
 fromDate?: string | null;
 toDate?: string | null;
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

export interface ChartData {
 district?: string;
 taluka?: string;
 departmentName?: string;
 disposeChnl?: string;
 grievanceStatus?: string;
 programType?: string;
 forwardedToDesignation?: string;
 count: number;
 percentage: number;
}

export interface DisposalDaysKpi {
 kpiValue: number;
 trendValue: number;
 targetValue: number;
 totalRecords: number;
 minDisposalDays: number;
 maxDisposalDays: number;
}

export interface DashboardData {
 dashboardPage1: {
 kpi: {
 totalCount: number;
 disposalDaysKpi: DisposalDaysKpi;
 selectedProgramTypes: string[];
 };
 districts: ChartData[];
 talukas?: ChartData[];
 departments: ChartData[];
 designations?: ChartData[];
 disposeChannels: ChartData[];
 grievanceStatuses: ChartData[];
 programTypes: ChartData[];
 };
}

export interface DownloadCsvParams {
 data: any[];
 columns: { key: string; label: string }[];
 filename: string;
}

export interface ChartEventParams {
 componentType: string;
 name: string;
 value?: number;
 data?: any;
 dataIndex: number;
 event?: {
 event?: MouseEvent;
 clientX?: number;
 clientY?: number;
 pageX?: number;
 pageY?: number;
 };
}
