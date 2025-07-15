import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../../redux/slices/manufacturing/workCenters/materialSlice.ts";
import useAuth from "../../useAuth.ts";
import { apiRequest } from "../../../utils/api.ts";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { MANUFACTURING_ENDPOINTS } from "../../../api/manufacturingEndpoints.ts";
import { Material } from "../../../redux/slices/types/manufacturing/WorkCenter.ts";

const useMaterials = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart());
    try {
      const response = await apiRequest<ServerResponse<Material[]>>(
        MANUFACTURING_ENDPOINTS.MATERIALS.GET_ALL,
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

  const data = useAppSelector((state) => state.materials);

  return { ...data, refresh: fetchDataFromApi };
};

export default useMaterials;
