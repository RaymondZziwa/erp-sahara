import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { IncomeStatement } from "../../types/reports/IncomeStatement";

const initialState: DataState<IncomeStatement[]> = {
  data: [], // Fix: Store an array of IncomeStatement
  loading: false,
  error: null,
};

const incomeStatementSlice = createSlice({
  name: "incomeStatement", // Fix: Corrected slice name
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IncomeStatement[]>) {
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
  incomeStatementSlice.actions;
export default incomeStatementSlice.reducer;
