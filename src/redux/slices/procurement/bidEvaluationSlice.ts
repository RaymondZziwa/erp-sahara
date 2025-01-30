import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { BidEvaluation } from "../types/procurement/BidEvaluation";

const initialState: DataState<BidEvaluation[]> = {
  data: [],
  loading: false,
  error: null,
};

const bidsSlice = createSlice({
  name: "bidevaluations",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<BidEvaluation[]>) {
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
  bidsSlice.actions;
export default bidsSlice.reducer;
