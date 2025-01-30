import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Supplier } from "../types/inventory/Suppliers";

const initialState: DataState<Supplier[]> = {
  data: [],
  loading: false,
  error: null,
};

const suppliersSlice = createSlice({
  name: "inventory_suppliers",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Supplier[]>) {
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
  suppliersSlice.actions;
export default suppliersSlice.reducer;
