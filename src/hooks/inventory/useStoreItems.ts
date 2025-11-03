import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "../useAuth";
import { StoreInventoryItem } from "../../redux/slices/types/inventory/Items";
import { fetchDataStart, fetchDataSuccess, fetchDataFailure } from "../../redux/slices/inventory/storeInventorySlice";
import { ServerResponse } from "../../redux/slices/types/ServerResponse";
import { RootState } from "../../redux/store";
import { apiRequest } from "../../utils/api";


const useStoreInventory = () => {
  const dispatch = useDispatch();
  

  const { token, isFetchingLocalToken } = useAuth();
 const storeId = localStorage.getItem("selectedWarehouse") || "1";
  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<StoreInventoryItem[]>>(
        `/inventories/${storeId}/storeinventory`,
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
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token, storeId]);

  const data = useSelector((state: RootState) => state.items);

  return { ...data, refresh: fetchDataFromApi };
};

export default useStoreInventory;
