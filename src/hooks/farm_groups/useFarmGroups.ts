import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/farmGroups/farmGroupsSlice";
import useAuth from "../useAuth";
import { apiRequest } from "../../utils/api";

import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";

import { FARM_GROUPS_ENDPOINTS } from "../../api/farmGroupsEndpoints";
import { FarmGroup } from "../../redux/slices/types/farmGroups/FarmGroup";

const useFarmGroups = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token?.access_token) return;

    dispatch(fetchDataStart());

    try {
      const response = await apiRequest<ServerResponse<FarmGroup[]>>(
        FARM_GROUPS_ENDPOINTS.FARM_GROUPS.GET_ALL,
        "GET",
        token.access_token
      );

      if (response.success) {
        dispatch(fetchDataSuccess(response.data));
      } else {
        throw new Error(response.message || "Failed to fetch farm groups.");
      }
    } catch (error) {
      console.error("Failed to fetch farm groups:", error);
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

  const data = useAppSelector((state) => state.farmGroups);

  return { ...data, refresh: fetchDataFromApi };
};

export default useFarmGroups;
