import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/projects/activityServicesSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";

import { PROJECTS_ENDPOINTS } from "../../api/projectsEndpoints.ts";

import { useEffect } from "react";
import { ActivityService } from "../../redux/slices/types/projects/ActivityService.ts";

const useProjectActivityServices = (projectId: string, activityId: string) => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<ActivityService[]>>(
        PROJECTS_ENDPOINTS.PROJECT_ACTIVITY_SERVICES.GET_ALL(
          projectId,
          activityId
        ),
        "GET",
        token.access_token
      );

      dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
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

  const data = useAppSelector((state) => state.projectActivityServices);

  return { ...data, refresh: fetchDataFromApi };
};

export default useProjectActivityServices;
