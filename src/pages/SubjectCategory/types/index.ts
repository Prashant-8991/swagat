
export interface FilterState {
  programTypes: string[] | null;
  district: string | null;
  taluka: string | null;
  subjectCategory: string | null;
  subStatusName: string | null;
  aiCategory: string | null;
  month: string | null;
  departmentName: string | null;
  grievanceStatus: string | null;
  disposeChnl: string | null;
}

export interface DistrictData {
  district: string;
  count: number;
  percentage: number;
}

export interface TalukaData {
  taluka: string;
  district: string;
  count: number;
  percentage: number;
}

export interface DepartmentData {
  departmentName: string;
  count: number;
  percentage: number;
}

export interface SubjectData {
  subjectCategory: string;
  aiCategory: string;
  count: number;
  avgDisposalDays: number;
  percentage: number;
}

export interface AICategoryData {
  aiCategory: string;
  avgDisposalDays: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  monthDisplay: string;
  count: number;
  isForecast: boolean;
  forecastLower: number | null;
  forecastUpper: number | null;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  data: {
    name: string;
    value: number;
  } | null;
  filterKey: 'district' | 'taluka' | 'subjectCategory' | 'aiCategory' | 'month' | 'departmentName' | null;
}

export interface DashboardData {
  districts: DistrictData[];
  talukas: TalukaData[];
  subjects: SubjectData[];
  departments: DepartmentData[];
  aiCategories: AICategoryData[];
  monthlyTrends: MonthlyTrend[];
  forecastAvailable: boolean;
}

export interface CsvDownloadConfig {
  data: any[];
  columns: Array<{
    key: string;
    label: string;
  }>;
  filename: string;
}

export interface ContributorData {
  name: string;
  count: number;
  percentage: number;
  contributor_type: string;
}

export interface TrendAnalysisResult {
  category: string;
  slope: number;
  rSquared: number;
  consistencyScore: number;
  avgGrowthRate: number;
  totalIncrease: number;
  periods: string[];
  periodValues: number[];
  trendPoints: number[];
  forecastPoints: number[];
  forecastPeriods: string[];
  importance: number;
  talukaContributors: ContributorData[];
  departmentName: string;
}
