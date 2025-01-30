import { useEffect } from "react";

import {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
} from "../../redux/slices/mossApp/slidersSlice.ts"; // Import actions from your data reducer
import useAuth from "../useAuth.ts";
import { mossAppApiRequest, mossAppImageURL } from "../../utils/api.ts";

import { ServerResponse } from "../../redux/slices/types/ServerResponse.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { SliderItem } from "../../redux/slices/types/mossApp/Slider.ts";
import { MOSS_APP_ENDPOINTS } from "../../api/mossAppEndpoints.ts";

const useSliders = () => {
  const dispatch = useAppDispatch();

  const { token, isFetchingLocalToken } = useAuth();

  const fetchDataFromApi = async () => {
    if (isFetchingLocalToken) return;
    if (token.access_token == "") {
      return;
    }
    dispatch(fetchDataStart()); // Dispatch action to indicate data fetching has started
    try {
      const response = await mossAppApiRequest<ServerResponse<SliderItem[]>>(
        MOSS_APP_ENDPOINTS.SLIDERS.GET_ALL,
        "GET",
        token.access_token
      );

      dispatch(
        fetchDataSuccess(
          response.data.map((slider) => ({
            ...slider,
            image: mossAppImageURL + "/sliders/" + slider.image,
          }))
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
  }, [isFetchingLocalToken, token.access_token]);

  const data = useAppSelector((state) => state.sliders);

  return { ...data, refresh: fetchDataFromApi };
};

export default useSliders;
