import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/roles/roleSlice.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import useAuth from "../useAuth.ts";

const useRoles = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await fetch('https://tfc-api.efinanci.co.tz/api/roles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`
        },
      });
      const data = await response.json();
      dispatch(fetchDataSuccess(data.data));
    } catch (error) {
      dispatch(
        fetchDataFailure(
          error instanceof Error ? error.message : "An error occurred"
        )
      ); // Dispatch action with error message on failure
    }
  };

  // Add the deleteRole function
  const deleteRole = async (roleId: number) => {
    if (isFetchingLocalToken || token.access_token === "") {
      return;
    }
    try {
      const response = await fetch(`https://tfc-api.efinanci.co.tz/api/roles/${roleId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete role");
      }

      // Refresh the roles list after deletion
      fetchDataFromApi();
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error; // Re-throw the error to handle it in the component
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.roles);

  return { ...data, refresh: fetchDataFromApi, deleteRole };
};

export default useRoles;