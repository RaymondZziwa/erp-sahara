import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionOrder } from "../../types/manufacturing/productionOrder";

const initialState: DataState<ProductionOrder[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionOrderSlice = createSlice({
  name: "productionOrder",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionOrder[]>) {
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
productionOrderSlice.actions;
export default productionOrderSlice.reducer;
