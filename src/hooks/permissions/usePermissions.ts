import { useEffect } from "react";
import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/permissions/permissionSlice"; // Adjust path as needed
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import useAuth from "../useAuth";

const usePermissions = () => {
  const dispatch = useAppDispatch();
  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken || !token.access_token) return;

    dispatch(fetchDataStart());

    try {
      const response = await fetch('https://tfc-api.efinanci.co.tz/api/permissions/services', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      dispatch(fetchDataSuccess(data.data)); // Assuming API returns { data: [...] }
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

  const data = useAppSelector((state) => state.permissions);

  return { ...data, refresh: fetchDataFromApi };
};

export default usePermissions;
