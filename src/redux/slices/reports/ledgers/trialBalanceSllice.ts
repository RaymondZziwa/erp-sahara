import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { TrialBalance } from "../../types/reports/TrialBalance";

const initialState: DataState<TrialBalance[]> = {
  data: [],
  loading: false,
  error: null,
};

const trialBalanceSlice = createSlice({
  name: "trialBalance",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<TrialBalance[]>) {
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
