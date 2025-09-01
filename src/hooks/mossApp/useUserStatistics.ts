import { useEffect, useCallback } from "react";
import { MOSS_APP_ENDPOINTS } from "../../api/mossAppEndpoints";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from "../../redux/slices/mossApp/userStatisticSlice";
import { UserStatistics } from "../../redux/slices/types/mossApp/userStats";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { mossAppApiRequest } from "../../utils/api";
import useAuth from "../useAuth";

const useUserStatistics = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = useCallback(async () => {
    if (isFetchingLocalToken) return;
    if (!token?.access_token) return;
    
    dispatch(fetchDataStart());
    try {
      const response = await mossAppApiRequest<ServerResponse<UserStatistics>>(
        MOSS_APP_ENDPOINTS.DASHBOARD.USER_STATISTICS,
        "GET",
        token.access_token
      );
      dispatch(fetchDataSuccess(response.data));
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      );
    }
  }, [dispatch, isFetchingLocalToken, token?.access_token]); // ← Important dependencies

  useEffect(() => {
    fetchDataFromApi();
  }, [fetchDataFromApi]); // ← Now this will update when fetchDataFromApi changes

  const data = useAppSelector((state) => state.userStats);

  return { ...data, refresh: fetchDataFromApi };
};

export default useUserStatistics