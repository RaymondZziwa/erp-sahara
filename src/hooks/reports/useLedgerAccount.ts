import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/reports/ledgers/generalLedgersSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";

import { REPORTS_ENDPOINTS } from "../../api/reportsEndpoints.ts";
import { GeneralLedgerResponse } from "../../redux/slices/types/ledgers/Ledger.ts";

const useLedgerAccount = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<GeneralLedgerResponse>>(
        REPORTS_ENDPOINTS.GENERAL_LEDGERS.GET_ALL,
        "GET",
        token.access_token
      );

      if (response.data !== null) dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
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

  const data = useAppSelector((state) => state.generalLedgers);

  return { ...data, refresh: fetchDataFromApi };
};

export default useLedgerAccount;
