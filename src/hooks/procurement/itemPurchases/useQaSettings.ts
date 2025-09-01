import { useEffect } from "react";
import { ITEMPURCHASES_ENDPOINTS } from "../../../api/itemPurchasesEndpoints";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from "../../../redux/slices/procurement/itemPurchases/qaSettingsSlice";
import { QaSetting } from "../../../redux/slices/types/itemPurchases/qaSettings";
import { ServerResponse } from "../../../redux/slices/types/ServerResponse";
import { apiRequest } from "../../../utils/api";
import useAuth from "../../useAuth";

const useQaSettings = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<QaSetting[]>>(
        ITEMPURCHASES_ENDPOINTS.SETTINGS.GET_SETTINGS,
        "GET",
        token.access_token
      );

      response.success && dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
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

  const data = useAppSelector((state) => state.qaSettings);

  return { ...data, refresh: fetchDataFromApi };
};

export default useQaSettings;
