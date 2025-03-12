import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/reports/ledgers/balanceSheetSlice.tsx";

import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints.ts";
import { balanceSheetType } from "../../redux/slices/types/reports/balanceSheet.ts";

const useBalanceSheet = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (!token.access_token) return;

    dispatch(fetchDataStart());

    try {
      const response = await apiRequest<ServerResponse<balanceSheetType>>(
        REPORTS_ENDPOINTS.DETAILED_BALANCE_SHEET.GET_ALL,
        "GET",
        token.access_token
      );

      dispatch(fetchDataSuccess(response.data));
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      );
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.balanceSheet);

  return { ...data, refresh: fetchDataFromApi };
};

export default useBalanceSheet;
