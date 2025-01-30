import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { ProductionLine } from "../../types/manufacturing/ProductionLine";

const initialState: DataState<ProductionLine[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionLinesSlice = createSlice({
  name: "productionLines",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionLine[]>) {
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
  productionLinesSlice.actions;
export default productionLinesSlice.reducer;
