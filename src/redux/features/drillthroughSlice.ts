//@ts-nocheck
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { gql } from '@apollo/client';
import { apolloClient } from '../../lib/apolloClient';

export interface DrillThroughFilters {
  district: string | null;
  taluka: string | null;
  departmentName: string | null;
  disposeChannel: string | null;
  subjectCategory: string | null;
  programTypes: string[] | null;
  escalatedByCitizen: string | null;
  IsReviewed: boolean | null;
  levelNo: number | null;
  month: string | null;
  subject: string | null;
  forwardedToDesignation: string | null;
  aiCategory: string | null;
  grievanceStatus: string | null;
  grievanceReviewType: string | null;
  subStatusName: string | null;
}

export interface Page6KPI {
  totalCount: number;
  level1DisposedCount: number;
  level1DisposalPct: number;
}

export interface TalukaDisposeChannelData {
  taluka: string;
  disposeChannel: string;
  count: number;
}

export interface SubjectDetailRow {
  inwardNo: string | null;
  subject: string;
  avgDisposalDays: number;
  firstDepartmentName: string | null;
  firstSubStatusName: string | null;
  firstForwardedToDesignation: string | null;
  firstQuestionDistrict: string | null;
  firstSubjectCategory: string | null;
}

export interface SubjectDetailTable {
  data: SubjectDetailRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DistrictData {
  district: string;
  count: number;
  percentage: number;
}

export interface Page6Dashboard {
  kpi: Page6KPI;
  talukaDisposeChannelChart: TalukaDisposeChannelData[];
  subjectTable: SubjectDetailTable;
  districts: DistrictData[];
}

export interface DrillThroughState {
  data: Page6Dashboard | null;
  filters: DrillThroughFilters;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  sourcePage: string | null;
  isInitialized: boolean;
}

export const GET_PAGE6_DRILLTHROUGH = gql`
  query GetPage6DrillThrough(
    $page: Int!
    $pageSize: Int!
    $district: String
    $taluka: String
    $departmentName: String
    $disposeChannel: String
    $subjectCategory: String
    $subject: String
    $programTypes: [String!]
    $escalatedByCitizen: String
    $IsReviewed: Int
    $levelNo: Int
    $forwardedToDesignation: String
    $month: String
    $aiCategory: String
    $grievanceStatus: String
    $grievanceReviewType: String
    $subStatusName: String
    $fromDate: String
    $toDate: String
  ) {
    dashboardPage6(
      page: $page
      pageSize: $pageSize
      district: $district
      taluka: $taluka
      departmentName: $departmentName
      disposeChannel: $disposeChannel
      subjectCategory: $subjectCategory
      subject: $subject
      programTypes: $programTypes
      escalatedByCitizen: $escalatedByCitizen
      IsReviewed: $IsReviewed
      levelNo: $levelNo
      forwardedToDesignation: $forwardedToDesignation
      month: $month
      aiCategory: $aiCategory
      grievanceStatus: $grievanceStatus
      grievanceReviewType: $grievanceReviewType
      subStatusName: $subStatusName
      fromDate: $fromDate
      toDate: $toDate
    ) {
      kpi {
        totalCount
        level1DisposedCount
        level1DisposalPct
      }
      talukaDisposeChannelChart {
        taluka
        disposeChannel
        count
      }
      subjectTable {
        data {
          inwardNo
          subject
          avgDisposalDays
          firstDepartmentName
          firstSubStatusName
          firstForwardedToDesignation
          firstQuestionDistrict
          firstSubjectCategory
        }
        totalCount
        page
        pageSize
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_DRILLTHROUGH_MAP_DATA = gql`
  query GetDrillThroughMapData(
    $district: String
    $departmentName: String
    $disposeChnl: String
    $grievanceStatus: String
    $programTypes: [String!]
  ) {
    dashboardPage1(
      district: $district
      departmentName: $departmentName
      disposeChnl: $disposeChnl
      grievanceStatus: $grievanceStatus
      programTypes: $programTypes
    ) {
      districts {
        district
        count
        percentage
      }
    }
  }
`;

let fetchTimeout: ReturnType<typeof setTimeout> | null = null;

export const fetchDrillThroughData = createAsyncThunk(
  'drillthrough/fetchData',
  async (_, { getState, signal }) => {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout);
    }

    await new Promise((resolve) => {
      fetchTimeout = setTimeout(resolve, 300);
    });

    const state = getState() as { drillthrough: DrillThroughState; dateFilter: { fromDate: string | null; toDate: string | null } };
    const { filters, currentPage, pageSize } = state.drillthrough;
    const { fromDate, toDate } = state.dateFilter;

    try {
      const [mainResult, mapResult] = await Promise.all([
        apolloClient.query({
          query: GET_PAGE6_DRILLTHROUGH,
          variables: {
            page: currentPage,
            pageSize,
            district: filters.district,
            taluka: filters.taluka,
            departmentName: filters.departmentName,
            disposeChannel: filters.disposeChannel,
            subjectCategory: filters.subjectCategory,
            programTypes: filters.programTypes,
            escalatedByCitizen: filters.escalatedByCitizen,
            IsReviewed: filters.IsReviewed,
            subject: filters.subject,
            forwardedToDesignation: filters.forwardedToDesignation,
            month: filters.month,
            levelNo: filters.levelNo,
            aiCategory: filters.aiCategory,
            grievanceStatus: filters.grievanceStatus,
            grievanceReviewType: filters.grievanceReviewType,
            subStatusName: filters.subStatusName,
            fromDate,
            toDate
          },
          fetchPolicy: 'network-only',
          context: { fetchOptions: { signal } },
        }),
        apolloClient.query({
          query: GET_DRILLTHROUGH_MAP_DATA,
          variables: {
            district: filters.district,
            departmentName: filters.departmentName,
            disposeChnl: filters.disposeChannel,
            grievanceStatus: filters.grievanceStatus,
            programTypes: filters.programTypes
          },
          fetchPolicy: 'network-only',
          context: { fetchOptions: { signal } },
        })
      ]);

      return {
        ...(mainResult.data as any).dashboardPage6,
        districts: (mapResult.data as any).dashboardPage1?.districts || []
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching drillthrough data:', error);
      throw error;
    }
  }
);

const initialState: DrillThroughState = {
  data: null,
  filters: {
    district: null,
    taluka: null,
    departmentName: null,
    disposeChannel: null,
    subjectCategory: null,
    programTypes: null,
    escalatedByCitizen: null,
    IsReviewed: null,
    aiCategory: null,
    levelNo: null,
    month: null,
    subject: null,
    forwardedToDesignation: null,
    grievanceStatus: null,
    grievanceReviewType: null,
    subStatusName: null
  },
  currentPage: 1,
  pageSize: 20,
  searchQuery: '',
  loading: false,
  error: null,
  sourcePage: null,
  isInitialized: false
};

const drillthroughSlice = createSlice({
  name: 'drillthrough',
  initialState,
  reducers: {
    setFiltersFromDrillThrough: (
      state,
      action: PayloadAction<{ filters: Partial<DrillThroughFilters>; sourcePage?: string }>
    ) => {
      Object.keys(state.filters).forEach(key => {
        state.filters[key as keyof DrillThroughFilters] = null;
      });

      state.filters = { ...initialState.filters, ...action.payload.filters };
      state.currentPage = 1;
      state.searchQuery = '';

      if (action.payload.sourcePage) {
        state.sourcePage = action.payload.sourcePage;
      }
    },
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof DrillThroughFilters; value: any }>
    ) => {
      state.filters[action.payload.key] = action.payload.value;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
      state.currentPage = 1;
      state.searchQuery = '';
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    resetDrillThrough: () => {
      return {
        ...initialState,
        data: null,
        loading: true,
        isInitialized: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrillThroughData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrillThroughData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchDrillThroughData.rejected, (state, action) => {
        state.loading = false;
        if (action.error.name !== 'AbortError') {
          state.error = action.error.message || 'Failed to fetch drill-through data';
        }
      });
  }
});

export const {
  setFiltersFromDrillThrough,
  updateFilter,
  clearFilters,
  setCurrentPage,
  setSearchQuery,
  setInitialized,
  resetDrillThrough
} = drillthroughSlice.actions;

export default drillthroughSlice.reducer;