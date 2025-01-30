import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/inventory/attributesValueSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { INVENTORY_ENDPOINTS } from "../../api/inventoryEndpoints.ts";
import { ItemAttributeValue } from "../../redux/slices/types/inventory/Attribute.ts";

const useItemAttributeValues = ({ attributeId }: { attributeId: string }) => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (attributeId == "") return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<ItemAttributeValue[]>>(
        INVENTORY_ENDPOINTS.ITEM_ATTRIBUTE_VALUES.GET_ALL(attributeId),
        "GET",
        token.access_token
      );

      dispatch(fetchDataSuccess(response.success ? response.data : [])); // Dispatch action with fetched data on success
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
  }, [isFetchingLocalToken, token.access_token, attributeId]);

  const data = useAppSelector((state) => state.itemsAttributesValues);

  return { ...data, refresh: fetchDataFromApi };
};

export default useItemAttributeValues;
