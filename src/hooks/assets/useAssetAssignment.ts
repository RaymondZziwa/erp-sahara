import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/assets/assetAssignmentSlice"; // Import actions from your assets reducer
import useAuth from "../useAuth";
import { apiRequest } from "../../utils/api";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { ASSETSENDPOINTS } from "../../api/assetEndpoints";
import { AssetAssignment } from "../../redux/slices/types/mossApp/assets/asset";

const useAssetAssignments = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    // Don't proceed if still fetching the token or if the token is empty
    if (isFetchingLocalToken || token.access_token === "") {
      return;
    }

    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started

    try {
      const response = await apiRequest<ServerResponse<AssetAssignment[]>>(
        ASSETSENDPOINTS.ASSETS.ASSIGNMENTS.GET_ALL, 
        "GET",
        token.access_token
      );

      dispatch(
        fetchDataSuccess(
          response.success && response.data.length > 0 ? response.data : []
        )
      ); // Dispatch action with fetched data on success
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      ); // Dispatch action with error message on failure
    }
  };

  // Fetch data when the component mounts or when the token changes
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  // Get the assets data from the Redux store
  const data = useAppSelector((state) => state.assetAssignment);

  // Return the data and a refresh function
  return { ...data, refresh: fetchDataFromApi };
};

export default useAssetAssignments