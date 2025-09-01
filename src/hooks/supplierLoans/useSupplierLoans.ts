import { useEffect } from "react";
import { SupplierLoanRequest } from "../../redux/slices/types/supplierLoans/supplierLoans";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from "../../redux/slices/supplier_loans/supplierLoanSlice";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../utils/api";
import useAuth from "../useAuth";
import { SUPPLIER_LOAN_ENDPOINTS } from "../../api/supplierLoanEndpoints";

const useSupplierLoans = (status?: string) => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async (statusFilter?: string) => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    
    dispatch(fetchDataStart());
    try {
      let endpoint = SUPPLIER_LOAN_ENDPOINTS.SUPPLIER_LOANS.GET_ALL;
      if (statusFilter && statusFilter !== 'all') {
        endpoint = `/supplierloans/status/${statusFilter}`;
      }

      const response = await apiRequest<ServerResponse<SupplierLoanRequest[]>>(
        endpoint,
        "GET",
        token.access_token
      );

      if (response.success) {
        dispatch(fetchDataSuccess(response.data));
      }
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      );
    }
  };

  useEffect(() => {
    fetchDataFromApi(status);
  }, [isFetchingLocalToken, token.access_token, status]);

  const data = useAppSelector((state) => state.supplierLoans);

  return { 
    ...data, 
    refresh: () => fetchDataFromApi(status) 
  };
};

export default useSupplierLoans;