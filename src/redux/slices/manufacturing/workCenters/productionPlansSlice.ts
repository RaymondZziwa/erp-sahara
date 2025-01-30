import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionPlan } from "../../types/manufacturing/ProductionPlan";

const initialState: DataState<ProductionPlan[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionPlansSlice = createSlice({
  name: "productionPlans",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionPlan[]>) {
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
  productionPlansSlice.actions;
export default productionPlansSlice.reducer;
