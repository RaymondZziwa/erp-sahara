import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Inventory } from "../types/inventory/Inventory";

const initialState: DataState<Inventory[]> = {
  data: [],
  loading: false,
  error: null,
};

const inventoriesSlice = createSlice({
  name: "inventories",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Inventory[]>) {
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
  inventoriesSlice.actions;
export default inventoriesSlice.reducer;
