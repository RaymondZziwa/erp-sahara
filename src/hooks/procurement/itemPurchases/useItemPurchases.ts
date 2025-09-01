import { useEffect } from "react";
import { SupplierDelivery } from "../../../redux/slices/types/itemPurchases/purchase";
import { ITEMPURCHASES_ENDPOINTS } from "../../../api/itemPurchasesEndpoints";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from "../../../redux/slices/procurement/itemPurchases/itemPurchaseSlice";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";
import useAuth from "../../useAuth";
const useBids = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<SupplierDelivery[]>>(
        ITEMPURCHASES_ENDPOINTS.ITEM_PURCHASES.GET_ITEM_PURCHASES,
        "GET",
        token.access_token
      );

      response.success && dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
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

  const data = useAppSelector((state) => state.supplierDelivery);

  return { ...data, refresh: fetchDataFromApi };
};

export default useBids;
