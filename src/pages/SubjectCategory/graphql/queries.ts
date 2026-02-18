import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
 query GetPage2Dashboard(
 $programTypes: [String!]
 $district: String
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $subjectCategory: String
 $aiCategory: String
 $month: String
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage2WithForecast(
 programTypes: $programTypes
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 subjectCategory: $subjectCategory
 aiCategory: $aiCategory
 month: $month
 fromDate: $fromDate
 toDate: $toDate
 includeForecast: false
 ) {
 districts {
 district
 count
 percentage
 }
 departments {
 count
 departmentName
 percentage
 }
 talukas {
 taluka
 district
 count
 percentage
 }
 subjectCategories {
 subjectCategory
 aiCategory
 count
 avgDisposalDays
 percentage
 }
 aiCategories {
 aiCategory
 avgDisposalDays
 count
 percentage
 }
 monthlyTrends {
 monthDisplay
 count
 isForecast
 forecastLower
 forecastUpper
 }
 }
 }
`;

export const GET_TRENDS_DATA = gql`
 query GetTrendsData(
 $programTypes: [String!]
 $district: String
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $subjectCategory: String
 $aiCategory: String
 $month: String
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage2WithForecast(
 programTypes: $programTypes
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 subjectCategory: $subjectCategory
 aiCategory: $aiCategory
 month: $month
 fromDate: $fromDate
 toDate: $toDate
 includeForecast: false
 includeTrends: true
 ) {
 increasingTrends {
 category
 slope
 rSquared
 consistencyScore
 avgGrowthRate
 totalIncrease
 periods
 periodValues
 trendPoints
 forecastPoints
 forecastPeriods
 importance
 departmentName
 talukaContributors {
 name
 count
 percentage
 contributorType
 }
 districtContributors {
 name
 count
 percentage
 contributorType
 }
 }
 decreasingTrends {
 category
 slope
 rSquared
 consistencyScore
 avgGrowthRate
 totalIncrease
 periods
 periodValues
 trendPoints
 forecastPoints
 forecastPeriods
 importance
 departmentName
 talukaContributors {
 name
 count
 percentage
 contributorType
 }
 districtContributors {
 name
 count
 percentage
 contributorType
 }
 }
 forecastAvailable
 }
 }
`;

export const GET_FORECAST_DATA = gql`
 query GetPage2Forecast(
 $programTypes: [String!]
 $district: String
 $taluka: String
 $departmentName: String
 $disposeChnl: String
 $grievanceStatus: String
 $subStatusName: String
 $subjectCategory: String
 $aiCategory: String
 $month: String
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage2WithForecast(
 programTypes: $programTypes
 district: $district
 taluka: $taluka
 departmentName: $departmentName
 disposeChnl: $disposeChnl
 grievanceStatus: $grievanceStatus
 subStatusName: $subStatusName
 subjectCategory: $subjectCategory
 aiCategory: $aiCategory
 month: $month
 fromDate: $fromDate
 toDate: $toDate
 includeForecast: true
 ) {
 monthlyTrends {
 monthDisplay
 count
 isForecast
 forecastLower
 forecastUpper
 }
 forecastAvailable
 }
 }
`;

export const GET_FILTER_OPTIONS = gql`
 query GetPage2FilterOptions {
 getPage2FilterOptions {
 years
 districts
 talukas
 departments
 subjectCategories
 programTypes
 }
 }
`;

export const GET_AI_CATEGORIES = gql`
 query GetAICategories(
 $programTypes: [String!]
 $district: String
 $taluka: String
 $subjectCategory: String
 $aiCategory: String
 $month: String
 $includeForecast: Boolean!
 $fromDate: String
 $toDate: String
 ) {
 dashboardPage2WithForecast(
 programTypes: $programTypes
 district: $district
 taluka: $taluka
 subjectCategory: $subjectCategory
 aiCategory: $aiCategory
 month: $month
 includeForecast: $includeForecast
 fromDate: $fromDate
 toDate: $toDate
 ) {
 aiCategories {
 aiCategory
 avgDisposalDays
 count
 percentage
 }
 }
 }
`;



