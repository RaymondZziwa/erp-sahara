import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../../redux/slices/manufacturing/workCenters/productionStepSlice.ts";
import useAuth from "../../useAuth.ts";
import { apiRequest } from "../../../utils/api.ts";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints.ts";
import { ProductionOrderStep } from "../../../redux/slices/types/manufacturing/productionOrder.ts";

const useProductionStep = (id: string) => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (!token.access_token || !id) return;

    dispatch(fetchDataStart());
      try {
      const response = await apiRequest<ServerResponse<ProductionOrderStep[]>>(
        MANUFACTURING_ENDPOINTS.PRODUCTION_STEPS.GET_ALL(id.id),
        "GET",
        token.access_token
      );

      dispatch(
        fetchDataSuccess(response.success && response.data.length > 0 ? response.data : [])
      );
    } catch (error) {
      dispatch(
        fetchDataFailure(error instanceof Error ? error.message : "An error occurred")
      );
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [token.access_token, isFetchingLocalToken]);

  const data = useAppSelector((state) => state.productionSteps.data);

  return { data, refresh: fetchDataFromApi };
};

export default useProductionStep;
