import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../../redux/slices/accounts/cash_requisitions/storeRequisition.ts"; // Import actions from your data reducer
import useAuth from "../../useAuth.ts";
import { apiRequest } from "../../../utils/api.ts";

import { ServerResponse } from "../../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";

import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints.ts";
import { StoreRequisition } from "../../../redux/slices/types/accounts/cash_requisitions/CashRequisition.ts";

const useStoreRequisitions = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<StoreRequisition[]>>(
        ACCOUNTS_ENDPOINTS.STORE_REQUISITIONS.GET_ALL,
        "GET",
        token.access_token
      );
      response.data.length && dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
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

  const data = useAppSelector((state) => state.storeRequisition);

  return { ...data, refresh: fetchDataFromApi };
};

export default useStoreRequisitions;
