import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionMaterialRequest } from "../../types/manufacturing/materialRequest";

const initialState: DataState<ProductionMaterialRequest[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionMaterialRequestSlice = createSlice({
  name: "productionMaterialRequestSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionMaterialRequest[]>) {
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
productionMaterialRequestSlice.actions;
export default productionMaterialRequestSlice.reducer;
