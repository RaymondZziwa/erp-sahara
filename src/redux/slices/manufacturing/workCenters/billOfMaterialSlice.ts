import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { BillOfMaterial } from "../../types/manufacturing/BillOfMaterial";

const initialState: DataState<BillOfMaterial[]> = {
  data: [],
  loading: false,
  error: null,
};

const billOfMaterialSlice = createSlice({
  name: "billOfMaterial",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<BillOfMaterial[]>) {
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
  billOfMaterialSlice.actions;
export default billOfMaterialSlice.reducer;
