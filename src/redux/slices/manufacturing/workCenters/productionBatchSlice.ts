import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionBatch } from "../../types/manufacturing/productionBatches";

const initialState: DataState<ProductionBatch[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionBatchSlice = createSlice({
  name: "productionBatch",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionBatch[]>) {
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
productionBatchSlice.actions;
export default productionBatchSlice.reducer;
