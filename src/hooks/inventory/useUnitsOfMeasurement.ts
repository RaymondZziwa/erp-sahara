import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/inventory/unitsOfMeasurementSlice"; // Import actions from your data reducer
import useAuth from "../useAuth";
import { apiRequest } from "../../utils/api";

import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { UnitOfMeasurement } from "../../redux/slices/types/inventory/units";
import { INVENTORY_ENDPOINTS } from "../../api/inventoryEndpoints";

const useUnitsOfMeasurement = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<UnitOfMeasurement[]>>(
        INVENTORY_ENDPOINTS.UOM.GET_ALL,
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

  const data = useAppSelector((state) => state.inventoryUnits);

  return { ...data, refresh: fetchDataFromApi };
};

export default useUnitsOfMeasurement;
