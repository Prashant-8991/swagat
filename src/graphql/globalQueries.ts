//@ts-nocheck
import { gql } from '@apollo/client';

export const GET_ALL_FILTER_OPTIONS = gql`
 query GetAllFilterOptions {
 globalFilters {
 programTypes
 subStatuses
 disposeChannels
 departments
 districts
 grievanceStatuses
 }
 }
`;

export const GET_UNIQUE_TALUKAS = gql`
 query GetUniqueTalukas($district: String!) {
 globalFilters(district: $district) {
 talukas
 }
 }
`;

export const GET_UNIQUE_DISTRICTS = gql`
 query GetUniqueDistricts {
 globalFilters {
 districts
 }
 }
`;

export const GET_UNIQUE_DEPARTMENTS = gql`
 query GetUniqueDepartments {
 globalFilters {
 departments
 }
 }
`;

export const GET_UNIQUE_GRIEVANCE_STATUSES = gql`
 query GetUniqueGrievanceStatuses {
 globalFilters {
 grievanceStatuses
 }
 }
`;

export const GET_UNIQUE_SUB_STATUSES = gql`
 query GetUniqueSubStatuses {
 globalFilters {
 subStatuses
 }
 }
`;

export const GET_UNIQUE_DISPOSE_CHANNELS = gql`
 query GetUniqueDisposeChannels {
 globalFilters {
 disposeChannels
 }
 }
`;
