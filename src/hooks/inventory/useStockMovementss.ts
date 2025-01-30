import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/inventory/brandsSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { INVENTORY_ENDPOINTS } from "../../api/inventoryEndpoints.ts";
import { Brand } from "../../redux/slices/types/inventory/Brands.ts";

const useStockMovements = ({
  endDate,
  startDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<Brand[]>>(
        INVENTORY_ENDPOINTS.STOCK_MOVEMENTS.GET_ALL,
        "POST",
        token.access_token,
        {
          start_date: startDate,
          end_date: endDate,
        }
      );

      dispatch(fetchDataSuccess(response.success ? response.data : [])); // Dispatch action with fetched data on success
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
  }, [isFetchingLocalToken, token.access_token, startDate, endDate]);

  const data = useAppSelector((state) => state.stockMovements);

  return { ...data, refresh: fetchDataFromApi };
};

export default useStockMovements;
