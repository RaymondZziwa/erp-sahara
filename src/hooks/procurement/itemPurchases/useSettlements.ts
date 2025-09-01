import { useEffect } from "react";
import { ITEMPURCHASES_ENDPOINTS } from "../../../api/itemPurchasesEndpoints";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from "../../../redux/slices/procurement/settlementSlice";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";
import useAuth from "../../useAuth";
import { Settlement } from "../../../redux/slices/types/itemPurchases/purchase";

const useSettlements = (status?: string) => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async (statusFilter?: string) => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    
    dispatch(fetchDataStart());
    try {
      let endpoint = ITEMPURCHASES_ENDPOINTS.SETTLEMENTS.GET_SETTLEMENTS;
      if (statusFilter && statusFilter !== 'all') {
        // Remove status parameter for 'all' tab
        endpoint = `/purchases/settlements?status=${statusFilter}`;
      } else {
        endpoint = `/purchases/settlements`;
      }

      const response = await apiRequest<ServerResponse<Settlement[]>>(
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
  }, [status, isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.settlement);

  return { ...data, refresh: fetchDataFromApi };
};

export default useSettlements;