import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { InvoiceSequence } from "../types/recruitment/types";

const initialState: DataState<InvoiceSequence[]> = {
  data: [],
  loading: false,
  error: null,
};

const invoiceSequenceSlice = createSlice({
  name: "invoiceSequence",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<InvoiceSequence[]>) {
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
invoiceSequenceSlice.actions;
export default invoiceSequenceSlice.reducer;
