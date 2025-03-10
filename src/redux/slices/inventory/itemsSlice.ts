import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { InventoryItem } from "../types/inventory/Items";

const initialState: DataState<InventoryItem[]> = {
  data: [],
  loading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: "inventoryItems",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<InventoryItem[]>) {
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
  itemsSlice.actions;
export default itemsSlice.reducer;
