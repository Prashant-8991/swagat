import { gql } from "@apollo/client";

export const GET_GLOBAL_QUERY_FILTER = gql`
 query GET_GLOBAL_QUERY {
 globalFilters {
 programTypes,
 subStatuses,
 disposeChannels,
 departments,
 districts,
 talukas,
 grievanceStatuses
 }
}
`;