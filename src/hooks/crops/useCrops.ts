import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/crops/cropsSlice"; // Removed .ts extension
import useAuth from "../useAuth";
import { apiRequest } from "../../utils/api";

import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

import { CROPS_ENDPOINTS } from "../../api/cropsEndpoints";
import { Crop } from "../../redux/slices/types/crops/Crop";

const useCrops = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token?.access_token) return;

    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started

    try {
      const response = await apiRequest<ServerResponse<Crop[]>>(
        CROPS_ENDPOINTS.CROPS.GET_ALL,
        "GET",
        token.access_token
      );

      if (response.success) {
        dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data
      } else {
        throw new Error(response.message || "Failed to fetch crops.");
      }
    } catch (error) {
      console.error("Failed to fetch crops:", error);
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An unknown error occurred."
        )
      );
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token?.access_token]);

  const data = useAppSelector((state) => state.crops);

  return { ...data, refresh: fetchDataFromApi };
};

export default useCrops;
