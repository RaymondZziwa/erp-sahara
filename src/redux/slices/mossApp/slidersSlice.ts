import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { SliderItem } from "../types/mossApp/Slider";

const initialState: DataState<SliderItem[]> = {
  data: [],
  loading: false,
  error: null,
};

const slidersSlice = createSlice({
  name: "sliders",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SliderItem[]>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
  slidersSlice.actions;
export default slidersSlice.reducer;
