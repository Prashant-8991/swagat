//@ts-nocheck
import { RootState } from "../redux/store";
import { useSelector, useDispatch } from 'react-redux';
import {
    GlobalSearchStateInterface,
    setSearchQuery,
    clearSearchQuery
} from '../redux/features/globalsearch';


export const useGSearch = () => {
    const query_selector_value = useSelector((state: RootState) => state.gSearch.query);
    const dispatch = useDispatch();

    return {
        query_selector_value,
        setSearchQuery: (data: GlobalSearchStateInterface) => dispatch(setSearchQuery({ query: data.query })),
        clearSearchQuery: () => dispatch(clearSearchQuery())
    }
}