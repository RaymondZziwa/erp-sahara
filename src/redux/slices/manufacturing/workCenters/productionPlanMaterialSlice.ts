import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ProductionPlanMaterial } from "../../types/manufacturing/ProductionPlanMaterials";

const initialState: DataState<ProductionPlanMaterial[]> = {
  data: [],
  loading: false,
  error: null,
};

const productionPlanMaterialsSlice = createSlice({
  name: "productionPlanMaterialsSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProductionPlanMaterial[]>) {
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
  productionPlanMaterialsSlice.actions;
export default productionPlanMaterialsSlice.reducer;
