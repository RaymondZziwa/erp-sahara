import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { DistributionOrder } from "../types/sales/DistributionOrder";

const initialState: DataState<DistributionOrder[]> = {
  data: [],
  loading: false,
  error: null,
};

const distributionOrdersSlice = createSlice({
  name: "distributionOrders",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<DistributionOrder[]>) {
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
  distributionOrdersSlice.actions;
export default distributionOrdersSlice.reducer;
