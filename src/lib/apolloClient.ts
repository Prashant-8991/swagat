// @ts-nocheck
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const dateFilterLink = new ApolloLink((operation, forward) => {
 try {
 const stored = sessionStorage.getItem('userDateFilter');
 if (stored) {
 const { fromDate, toDate } = JSON.parse(stored);
 
 if (fromDate || toDate) {
 const variables = operation.variables || {};

 const newVariables = {
 ...variables,
 };
 
 if (fromDate) {
 newVariables.fromDate = fromDate;
 }
 
 if (toDate) {
 newVariables.toDate = toDate;
 }
 
 operation.variables = newVariables;
 
 
 }
 }
 } catch (error) {
 console.error('❌ [Apollo Link] Failed to inject date filter:', error);
 }
 
 return forward(operation);
});

const httpLink = new HttpLink({
 uri: import.meta.env.VITE_GRAPHQL_API_URL,
 keepalive: false,
});

export const apolloClient = new ApolloClient({
 link: ApolloLink.from([dateFilterLink, httpLink]),
 cache: new InMemoryCache({
 typePolicies: {
 Query: {
 fields: {
 dashboardPage6: {
 keyArgs: ['district', 'taluka', 'departmentName', 'disposeChannel', 'subjectCategory', 'subject', 'programTypeGroup', 'escalatedByCitizen', 'IsReviewed', 'levelNo', 'forwardedToDesignation', 'month', 'aiCategory', 'grievanceStatus', 'grievanceReviewType', 'subStatusName'],
 merge(existing, incoming) {
 return incoming;
 }
 }
 }
 }
 }
 }),
 defaultOptions: {
 watchQuery: {
 fetchPolicy: 'cache-and-network',
 errorPolicy: 'ignore',
 },
 query: {
 fetchPolicy: 'network-only',
 errorPolicy: 'all',
 },
 },
});