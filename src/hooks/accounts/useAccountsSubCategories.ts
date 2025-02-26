import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/accounts/accountSubCategoriesSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { apiRequest } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";

import { ACCOUNTS_ENDPOINTS } from "../../api/accountsEndpoints.ts";
import { AccountSubCategory } from "../../redux/slices/types/accounts/subCategories/index.ts";
import { deleteDataFailure, deleteDataStart, deleteDataSuccess } from "../../redux/slices/accounts/accountSubCategoriesSlice.ts";
import { toast } from "react-toastify";

const useAccountSubCategories = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await apiRequest<ServerResponse<AccountSubCategory[]>>(
        ACCOUNTS_ENDPOINTS.SUB_CATEGORIES.GET_ALL,
        "GET",
        token.access_token
      );
      const logging =  console.log(response);

      response.data && dispatch(fetchDataSuccess(response.data)); // Dispatch action with fetched data on success
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      ); // Dispatch action with error message on failure
    }
  };
  // Add the deleteSubcategory function
  const deleteSubCategory = async (subCategoryId: number, is_system_created: number) => {
    if (isFetchingLocalToken || token.access_token === "") {
      return;
    }
  
    dispatch(deleteDataStart()); // Indicate deletion is in progress
  
    try {
      if (is_system_created !== 1) {
        await apiRequest(
          `${ACCOUNTS_ENDPOINTS.SUB_CATEGORIES.DELETE(subCategoryId.toString())}`,
          "DELETE",
          token.access_token
        );
      } else{
        toast.error("Cannot delete system sub category");
      }
      
  
      dispatch(deleteDataSuccess(subCategoryId)); // Update state after deletion
      fetchDataFromApi(); // Refresh the list
    } catch (error) {
      dispatch(
        deleteDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      );
    }
  };
  
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.accountSubCategories);

  return { ...data, refresh: fetchDataFromApi, deleteSubCategory };
};

export default useAccountSubCategories;
