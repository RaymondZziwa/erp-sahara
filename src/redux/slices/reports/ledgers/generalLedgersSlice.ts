import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { GeneralLedgerResponse } from "../../types/ledgers/Ledger";

const initialState: DataState<GeneralLedgerResponse> = {
  data: {
    summaries: [],
    total_credit: 0,
    total_debit: 0,
  },
  loading: false,
  error: null,
};

const generalLedgersSlice = createSlice({
  name: "generalLedgers",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<GeneralLedgerResponse>) {
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
  generalLedgersSlice.actions;
export default generalLedgersSlice.reducer;
