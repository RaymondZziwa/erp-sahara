import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Payroll } from "../types/hr/salary/PayRollPeriod";

const initialState: DataState<Payroll[]> = {
  data: [],
  loading: false,
  error: null,
};

const payRollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Payroll[]>) {
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
  payRollSlice.actions;
export default payRollSlice.reducer;
