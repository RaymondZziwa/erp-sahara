import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../../redux/slices/accounts/bankReconciliation/bankAccountSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import useAuth from "../../useAuth";
import { BankAccount } from "../../../redux/slices/types/accounts/bankReconciliation/bank";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";
import { ACCOUNTS_ENDPOINTS } from "../../../api/accountsEndpoints";

const useBankAccounts = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<BankAccount[]>>(
        ACCOUNTS_ENDPOINTS.BANKACCOUNTS.GET_ALL,
        "GET",
        token.access_token
      );

      dispatch(
        fetchDataSuccess(
          response.success && response.data.length > 0 ? response.data : []
        )
      ); // Dispatch action with fetched data on success
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

  const data = useAppSelector((state) => state.bankAccount);

  return { ...data, refresh: fetchDataFromApi };
};

export default useBankAccounts;
