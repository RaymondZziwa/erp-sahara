import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

const initialState: DataState<unknown> = {
  data: null,
  loading: false,
  error: null,
};

const balanceSheetComparisonSlice = createSlice({
  name: "balanceSheetComparison",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<any>) {
      state.loading = false;
      state.data = action.payload; // Fix: Expecting an array of IncomeStatement
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
  balanceSheetComparisonSlice.actions;
export default balanceSheetComparisonSlice.reducer;
