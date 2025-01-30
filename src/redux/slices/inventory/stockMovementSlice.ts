import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { StockMovement } from "../types/inventory/StockMovement";

const initialState: DataState<StockMovement[]> = {
  data: [],
  loading: false,
  error: null,
};

const stockMovementSlice = createSlice({
  name: "stckMovementSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<StockMovement[]>) {
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
  stockMovementSlice.actions;
export default stockMovementSlice.reducer;
