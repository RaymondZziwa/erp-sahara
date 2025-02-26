import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Crop } from "../types/crops/Crop";

const initialState: DataState<Crop[]> = {
  data: [],
  loading: false,
  error: null,
};

const cropsSlice = createSlice({
  name: "crops",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Crop[]>) {
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
  cropsSlice.actions;
export default cropsSlice.reducer;
