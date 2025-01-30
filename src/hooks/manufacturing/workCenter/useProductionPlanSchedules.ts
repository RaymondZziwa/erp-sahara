import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../../redux/slices/manufacturing/workCenters/productionPlanScheduleSlice.ts"; // Import actions from your data reducer
import useAuth from "../../useAuth.ts";
import { apiRequest } from "../../../utils/api.ts";

import { ServerResponse } from "../../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";

import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints.ts";
import { ProductionPlanSchedule } from "../../../redux/slices/types/manufacturing/ProductionPlanSchedule.ts";

const useProductionPlanSchedule = ({
  productionPlanId,
}: {
  productionPlanId: string;
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
        ServerResponse<ProductionPlanSchedule[]>
      >(
        MANUFACTURING_ENDPOINTS.PRODUCTION_PLAN_SCHEDULES.GET_ALL(
          productionPlanId
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

  const data = useAppSelector((state) => state.productionPlansSchedules);

  return { ...data, refresh: fetchDataFromApi };
};

export default useProductionPlanSchedule;
