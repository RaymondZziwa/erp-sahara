import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionOrderStep } from "../../types/manufacturing/productionOrder";

const initialState: DataState<ProductionOrderStep[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionStepSlice = createSlice({
  name: "productionSteps",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionOrderStep[]>) {
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
productionStepSlice.actions;
export default productionStepSlice.reducer;
