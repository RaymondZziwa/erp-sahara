import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/recruitment/jobBoardSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { RECRUITMENT_ENDPOINTS } from "../../api/recruitmentEndpoints.ts";
import { JobBoard } from "../../redux/slices/types/recruitment/types.ts";

const useJobBoard = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart());
    try {
      const response = await apiRequest<ServerResponse<JobBoard[]>>(
        RECRUITMENT_ENDPOINTS.JOB_BOARDS.GET_ALL,
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
  };
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.jobBoard);

  return { ...data, refresh: fetchDataFromApi };
};

export default useJobBoard;
