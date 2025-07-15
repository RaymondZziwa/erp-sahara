import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/recruitment/contractTermSlice.ts"
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { RECRUITMENT_ENDPOINTS } from "../../api/recruitmentEndpoints.ts";
import { JobContractTerms } from "../../redux/slices/types/recruitment/types.ts";

const useContractTerms = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart());
    try {
      const response = await apiRequest<ServerResponse<JobContractTerms[]>>(
        RECRUITMENT_ENDPOINTS.CONTRACT_TERMS.GET_ALL,
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

  const data = useAppSelector((state) => state.contractTerms);

  return { ...data, refresh: fetchDataFromApi };
};

export default useContractTerms;
