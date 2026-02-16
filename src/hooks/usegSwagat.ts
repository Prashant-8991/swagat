// @ts-nocheck
import { useSelector, useDispatch } from "react-redux";
import { setgSwagatData } from "../redux/features/globalfilters";
import type { RootState } from "../redux/store";
import { GlobalFilterInterface } from "../redux/features/globalfilters";
import { useQuery } from "@apollo/client/react";
import { GET_GLOBAL_QUERY_FILTER } from "../pages/SubjectCategory/graphql/gSwagatquery";


interface GswagatAPiDataInterface {
 globalFilters: {
 programTypes: string[],
 subStatuses: string[],
 disposeChannels: string[],
 departments: string[],
 districts: string[],
 talukas: string[],
 grievanceStatuses: string[],
 }
}


export const useGSwagat = () => {
 const gSwagat = useSelector((state: RootState) => state.gSwagat);
 const dispatch = useDispatch();

 return {
 gSwagat,
 setgSwagatData: (data: GlobalFilterInterface) => dispatch(setgSwagatData({ ...gSwagat, ...data })),
 };
};


export const useFetchGSwagatData = () => {
 const { loading, error, data } = useQuery<GswagatAPiDataInterface>(GET_GLOBAL_QUERY_FILTER);
 return {
 gSwagatLoading: loading,
 gSwagatError: error,
 gSwagatData: data?.globalFilters,
 }
}
