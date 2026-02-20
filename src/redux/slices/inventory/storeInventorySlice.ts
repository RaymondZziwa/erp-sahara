import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { StoreInventoryItem } from "../types/inventory/Items";
import { DataState } from "../types/DataState";


const initialState: DataState<StoreInventoryItem[]> = {
  data: [],
  loading: false,
  error: null,
};

const itemsSlice = createSlice({
  name: "storeInventory",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<StoreInventoryItem[]>) {
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
