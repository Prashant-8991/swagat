import { gql } from '@apollo/client';

export const GET_DASHBOARD_PAGE1 = gql`
 query GetDashboardPage1(
 $district: String
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $programTypes: [String!]
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage1(
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 programTypes: $programTypes
 fromDate: $fromDate
 toDate: $toDate
 ) {
 kpi {
 totalCount
 selectedProgramTypes
 disposalDaysKpi {
 kpiValue
 trendValue
 targetValue
 totalRecords
 minDisposalDays
 maxDisposalDays
 }
 }
 districts {
 district
 count
 percentage
 }
 departments {
 departmentName
 count
 percentage
 }
 disposeChannels {
 disposeChnl
 count
 percentage
 }
 grievanceStatuses {
 grievanceStatus
 count
 percentage
 }
 programTypes {
 programTypeGroup
 count
 percentage
 }
 talukas {
 taluka
 count
 percentage
 }
 designations {
 forwardedToDesignation
 count
 percentage
 }
 }
 }
`;

export const GET_TALUKA_DATA = gql`
 query GetTalukaData(
 $district: String!
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $programTypes: [String!]
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage1(
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 programTypes: $programTypes
 fromDate: $fromDate
 toDate: $toDate
 ) {
 talukas {
 count
 percentage
 taluka
 }
 }
 }
`;

export const GET_DESIGNATION_DATA = gql`
 query GetDesignationData(
 $district: String
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $programTypes: [String!]
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage1(
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 programTypes: $programTypes
 fromDate: $fromDate
 toDate: $toDate
 ) {
 designations {
 count
 percentage
 forwardedToDesignation
 }
 }
 }
`;


