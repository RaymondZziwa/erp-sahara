import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../../redux/slices/manufacturing/workCenters/productionMaterialRequestSlice.ts";
import useAuth from "../../useAuth.ts";
import { apiRequest } from "../../../utils/api.ts";

import { ServerResponse } from "../../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";

import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints.ts";
import { ProductionMaterialRequest } from "../../../redux/slices/types/manufacturing/materialRequest.ts";

const useProductionMaterialRequests = ({
  id,
}: {
  id: string;
}) => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<
        ServerResponse<ProductionMaterialRequest[]>
      >(
        MANUFACTURING_ENDPOINTS.PRODUCTION_MATERIALS_REQUESTS.GET_ALL(
          id
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

  const data = useAppSelector((state) => state.productionMaterialRequests);

  return { ...data, refresh: fetchDataFromApi };
};

export default useProductionMaterialRequests
