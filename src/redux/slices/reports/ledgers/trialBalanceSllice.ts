import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { TrialBalance } from "../../types/reports/TrialBalance";

const initialState: DataState<TrialBalance> = {
  data: {
    financial_year: {
      id: 0,
      financial_year: "",
      start_date: "2024-10-22",
      end_date: "2024-12-31",
      organisation_id: 0,
      status: 1,
      remaining_days: 0,
      should_alert: false,
    },
    trial_balance: [],
  },
  loading: false,
  error: null,
};

const trialBalanceSlice = createSlice({
  name: "journalTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<TrialBalance>) {
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
  trialBalanceSlice.actions;
export default trialBalanceSlice.reducer;
