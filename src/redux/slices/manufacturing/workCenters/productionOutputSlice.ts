import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { ProductionOutput } from "../../types/manufacturing/ProductionLine";

const initialState: DataState<ProductionOutput[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionOutputSlice = createSlice({
  name: "productionOutput",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionOutput[]>) {
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
  productionOutputSlice.actions;
export default productionOutputSlice.reducer;
