import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { PurchaseOrder } from "../types/procurement/PurchaseOrders";

const initialState: DataState<PurchaseOrder[]> = {
  data: [],
  loading: false,
  error: null,
};

const purchaseOrders = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<PurchaseOrder[]>) {
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
  purchaseOrders.actions;
export default purchaseOrders.reducer;
