import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/inventory/warehousesSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";

import { INVENTORY_ENDPOINTS } from "../../api/inventoryEndpoints.ts";
import { Warehouse } from "../../redux/slices/types/inventory/Warehouse.ts";

const useWarehouses = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<Warehouse[]>>(
        INVENTORY_ENDPOINTS.WARE_HOUSES.GET_ALL,
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

  const data = useAppSelector((state) => state.warehouses);

  return { ...data, refresh: fetchDataFromApi };
};

export default useWarehouses;
