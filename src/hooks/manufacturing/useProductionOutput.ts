import { useEffect } from "react";
import { fetchDataFailure, fetchDataStart, fetchDataSuccess } from "../../redux/slices/manufacturing/workCenters/productionOutputSlice";
import { MANUFACTURING_ENDPOINTS } from "../../api/manufacturingEndpoints";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../utils/api";
import useAuth from "../useAuth";
import { ProductionOutput } from "../../redux/slices/types/manufacturing/ProductionLine.ts";

const useProductionOutput = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart());
    try {
      const response = await apiRequest<ServerResponse<ProductionOutput[]>>(
        MANUFACTURING_ENDPOINTS.PRODUCTION_OUTPUT.GET_ALL,
        "GET",
        token.access_token
      );

      dispatch(
        fetchDataSuccess(
          response.success && response.data.length > 0 ? response.data : []
        )
      );
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

  const data = useAppSelector((state) => state.productionOutput);

  return { ...data, refresh: fetchDataFromApi };
};

export default useProductionOutput;
