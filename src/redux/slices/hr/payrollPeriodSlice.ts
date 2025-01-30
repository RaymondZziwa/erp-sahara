import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { PayRollPeriod } from "../types/hr/salary/PayRollPeriod";

const initialState: DataState<PayRollPeriod[]> = {
  data: [],
  loading: false,
  error: null,
};

const payRollPeriodsSlice = createSlice({
  name: "attendencies",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<PayRollPeriod[]>) {
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
  payRollPeriodsSlice.actions;
export default payRollPeriodsSlice.reducer;
