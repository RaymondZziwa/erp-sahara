import { useEffect, useState } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  Role,
} from "../../redux/slices/roles/roleSlice.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { SETTINGS_ENDPOINTS } from "../../api/settingEndpoints.ts";

const useRoles = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false)

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    setIsLoading(true)
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<Role[]>>(
        SETTINGS_ENDPOINTS.ROLES.GET_ALL,
        "GET",
        token.access_token
      );

      response.data.length && dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      );
    } finally {
        setIsLoading(false)
    }
  };
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.roles);

  return { ...data, refresh: fetchDataFromApi, isLoading };
};

export default useRoles
