import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionPlanSchedule } from "../../types/manufacturing/ProductionPlanSchedule";

const initialState: DataState<ProductionPlanSchedule[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionPlanSchedulesSlice = createSlice({
  name: "productionPlanSchedulesSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionPlanSchedule[]>) {
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
  productionPlanSchedulesSlice.actions;
export default productionPlanSchedulesSlice.reducer;
