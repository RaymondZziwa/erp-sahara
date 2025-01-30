import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { CustomerOrder } from "../types/sales/CustomerOrder";

const initialState: DataState<CustomerOrder[]> = {
  data: [],
  loading: false,
  error: null,
};

const customerOrdersSlice = createSlice({
  name: "customerOrders",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CustomerOrder[]>) {
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
  customerOrdersSlice.actions;
export default customerOrdersSlice.reducer;
