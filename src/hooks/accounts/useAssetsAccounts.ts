import { useEffect, useState } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/accounts/assetsAccountsSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";

import { ACCOUNTS_ENDPOINTS } from "../../api/accountsEndpoints.ts";
import { ChartofAccount } from "../../redux/slices/types/accounts/ChartOfAccounts.ts";

const useAssetsAccounts = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([])
  const [cashAccounts, setCashAccounts] = useState<any[]>([])
  const [incomeAccounts, setIncomeAccounts] = useState<any[]>([])

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<ChartofAccount[]>>(
        ACCOUNTS_ENDPOINTS.CHART_OF_ACCOUNTS.GET_ALL,
        //ACCOUNTS_ENDPOINTS.GET_ALL_ACCOUNTS,
        "GET",
        token.access_token
      );

      const resOne = await apiRequest<ServerResponse<ChartofAccount[]>>(
        "/accounts/get-expense-accounts",
        //ACCOUNTS_ENDPOINTS.GET_ALL_ACCOUNTS,
        "GET",
        token.access_token
      );

      const resTwo = await apiRequest<ServerResponse<ChartofAccount[]>>(
        "/accounts/get-cash-accounts",
        //ACCOUNTS_ENDPOINTS.GET_ALL_ACCOUNTS,
        "GET",
        token.access_token
      );

      const resThree = await apiRequest<ServerResponse<ChartofAccount[]>>(
        "/accounts/get-income-accounts",
        //ACCOUNTS_ENDPOINTS.GET_ALL_ACCOUNTS,
        "GET",
        token.access_token
      );

      setIncomeAccounts(resThree.data)
      setExpenseAccounts(resOne.data)
      setCashAccounts(resTwo.data)

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

  const data = useAppSelector((state) => state.assetsAccounts.data);

  return { cashAccounts, expenseAccounts, incomeAccounts, data, refresh: fetchDataFromApi };
};

export default useAssetsAccounts;
