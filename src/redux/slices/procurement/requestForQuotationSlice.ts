import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { RequestForQuotation } from "../types/procurement/RequestForQuotation";

const initialState: DataState<RequestForQuotation[]> = {
  data: [],
  loading: false,
  error: null,
};

const requestForQuotation = createSlice({
  name: "rfq",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<RequestForQuotation[]>) {
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
  requestForQuotation.actions;
export default requestForQuotation.reducer;
