import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ItemAttributeValue } from "../types/inventory/Attribute";

const initialState: DataState<ItemAttributeValue[]> = {
  data: [],
  loading: false,
  error: null,
};

const itemsAttributesValuesSlice = createSlice({
  name: "inventoryValueAtrributes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ItemAttributeValue[]>) {
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
  itemsAttributesValuesSlice.actions;
export default itemsAttributesValuesSlice.reducer;
