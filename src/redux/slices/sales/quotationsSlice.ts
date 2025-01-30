import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Quotation } from "../types/sales/Quotation";

const initialState: DataState<Quotation[]> = {
  data: [],
  loading: false,
  error: null,
};

const quotationsSlice = createSlice({
  name: "salesQuotations",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Quotation[]>) {
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
  quotationsSlice.actions;
export default quotationsSlice.reducer;
