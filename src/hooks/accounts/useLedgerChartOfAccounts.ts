import { useEffect, useState } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/accounts/ledgerChartOfAccountsSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { ACCOUNTS_ENDPOINTS } from "../../api/accountsEndpoints.ts";
import { ChartofAccount } from "../../redux/slices/types/accounts/ChartOfAccounts.ts";
import { AccountType } from "../../redux/slices/types/accounts/accountTypes.ts";

const useLedgerChartOfAccounts = ({
  accountType,
}: {
  accountType: AccountType;
}) => {
  const [accounts, setAccounts] = useState<ChartofAccount[]>([]);
  const [balances, setBalances] = useState<any[]>([])
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  // Define endpoint based on account type
  let endpoint = "";
  switch (accountType) {
    case AccountType.ASSETS:
      endpoint = ACCOUNTS_ENDPOINTS.GET_ASSET_ACCOUNTS;
      break;
    case AccountType.LIABILITIES:
      endpoint = ACCOUNTS_ENDPOINTS.GET_LIABILITY_ACCOUNTS;
      break;
    case AccountType.EXPENSES:
      endpoint = ACCOUNTS_ENDPOINTS.GET_EXPENSE_ACCOUNTS;
      break;
    case AccountType.INCOME:
      endpoint = ACCOUNTS_ENDPOINTS.GET_INCOME_ACCOUNTS;
      break;
    case AccountType.CASH:
      endpoint = ACCOUNTS_ENDPOINTS.GET_CASH_ACCOUNTS;
      break;
    case AccountType.RECEIVABLE:
      endpoint = ACCOUNTS_ENDPOINTS.GET_RECEIVABLE_ACCOUNTS;
      break;
    case AccountType.PREPAID:
      endpoint = ACCOUNTS_ENDPOINTS.GET_PREPAID_ACCOUNTS;
      break;
    case AccountType.ALL:
      endpoint = ACCOUNTS_ENDPOINTS.GET_ALL_ACCOUNTS;
      break;
    // Add other cases as needed
    default:
      break;
  }

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token === "") {
      return;
    }

    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<ChartofAccount[]>>(
        endpoint, // Use the determined endpoint here
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

  const fetchAccountBalances = async () => {
    try {
      const response = await apiRequest<ServerResponse<any[]>>(
        ACCOUNTS_ENDPOINTS.GET_ACCOUNT_BALANCES,
        "GET",
        token.access_token
      );
      setBalances(response.data)
    } catch (error) {
      console.log('error while fetching balances', error)
    }
  }

  useEffect(() => {
    fetchDataFromApi();
    fetchAccountBalances()
  }, [isFetchingLocalToken, token.access_token, accountType]); // Include accountType in dependencies

  const data = useAppSelector((state) => state.ledgerChartOfAccounts);

  return { ...data, refresh: fetchDataFromApi, data: accounts, balances };
};

export default useLedgerChartOfAccounts;
