import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { SupplierDelivery } from "../../types/itemPurchases/purchase";
import { DataState } from "../../types/DataState";

const initialState: DataState<SupplierDelivery[]> = {
  data: [],
  loading: false,
  error: null,
};

const supplierDeliverySlice = createSlice({
  name: "itemPurchases",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SupplierDelivery[]>) {
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
supplierDeliverySlice.actions;
export default supplierDeliverySlice.reducer;
