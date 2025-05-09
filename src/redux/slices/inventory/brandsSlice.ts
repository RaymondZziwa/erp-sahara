import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Brand } from "../types/inventory/Brands";

const initialState: DataState<Brand[]> = {
  data: [],
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: "inventoryBrands",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Brand[]>) {
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
  brandsSlice.actions;
export default brandsSlice.reducer;
