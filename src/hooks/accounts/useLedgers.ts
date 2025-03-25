import { useEffect, useState } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/accounts/expenseAccountsSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest, baseURL } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { ChartofAccount } from "../../redux/slices/types/accounts/ChartOfAccounts.ts";

const useLedgers = () => {
  const [accounts, setAccounts] = useState<ChartofAccount[]>([]);
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token === "") {
      return;
    }

    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<ChartofAccount[]>>(
        `${baseURL}/erp//accounts/get-expense-accounts`,
        "GET",
        token.access_token
      );

      dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
      setAccounts(response.data);
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
  }, [isFetchingLocalToken, token.access_token]); // Include accountType in dependencies

  const data = useAppSelector((state) => state.expensesAccounts);

  return { ...data, refresh: fetchDataFromApi, data: accounts };
}; 

export default useLedgers;
