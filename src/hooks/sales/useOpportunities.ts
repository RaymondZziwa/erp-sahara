import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/sales/opportunitiesSlice.ts";
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { SALES_ENDPOINTS } from "../../api/salesEndpoints.ts";
import { Opportunity } from "../../redux/slices/types/sales/Opportunities.ts";

const useOpportunities = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<Opportunity[]>>(
        SALES_ENDPOINTS.OPPORTUNITIES.GET_ALL,
        "GET",
        token.access_token
      );

      dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      ); // Dispatch action with error message on failure
    }
  };
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.opportunities);

  return { ...data, refresh: fetchDataFromApi };
};

export default useOpportunities;
