import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ItemAttribue } from "../types/inventory/Attribute";

const initialState: DataState<ItemAttribue[]> = {
  data: [],
  loading: false,
  error: null,
};

const itemsAttributesSlice = createSlice({
  name: "inventoryAtrributes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ItemAttribue[]>) {
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
  itemsAttributesSlice.actions;
export default itemsAttributesSlice.reducer;
