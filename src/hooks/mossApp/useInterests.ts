import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/mossApp/interestsSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { mossAppApiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";

import { MOSS_APP_ENDPOINTS } from "../../api/mossAppEndpoints.ts";
import { Interest } from "../../redux/slices/types/mossApp/Interest.ts";

const useInterests = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await mossAppApiRequest<ServerResponse<Interest[]>>(
        MOSS_APP_ENDPOINTS.INTERESTS.GET_ALL,
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

  const data = useAppSelector((state) => state.interests);

  return { ...data, refresh: fetchDataFromApi };
};

export default useInterests;
