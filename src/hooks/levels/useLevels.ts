import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/approval_levels/levelSlice.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import useAuth from "../useAuth.ts";


const useLevels = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await fetch('https://tfc-api.efinanci.co.tz/api/erp/accounts/requisitions-approval-level', {
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
  useEffect(() => {
    fetchDataFromApi();
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.levels.data);

  return { ...data, refresh: fetchDataFromApi };
};

export default useLevels;
