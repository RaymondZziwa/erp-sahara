import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/reports/ledgers/balanceSheetComparisonSlice.ts";

import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints.ts";
import { balanceSheetType } from "../../redux/slices/types/reports/balanceSheet.ts";

const useBalanceSheetComparison = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) {
      return;
    }
    if (!token.access_token) {
      return;
    }

    dispatch(fetchDataStart());

    try {
      console.log('aapppiiii')
      const response = await apiRequest<ServerResponse<balanceSheetType>>(
        REPORTS_ENDPOINTS.COMPARISON_BALANCE_SHEET.GET_ALL,
        "GET",
        token.access_token
      );

      console.log("API response:", response.data);
      dispatch(fetchDataSuccess(response.data));
    } catch (error) {
      console.error("API error:", error);
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      );
    }
  };

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("isFetchingLocalToken:", isFetchingLocalToken);
    console.log("token.access_token:", token.access_token);
    fetchDataFromApi();
  }, []);

  const data = useAppSelector((state) => state.balanceSheetComparison);

  return { ...data, refresh: fetchDataFromApi };
};

export default useBalanceSheetComparison;