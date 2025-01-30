import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ChartofAccount } from "../types/accounts/ChartOfAccounts";

const initialState: DataState<ChartofAccount[]> = {
  data: [],
  loading: false,
  error: null,
};

const chartOfAccountsSlice = createSlice({
  name: "coaccounts",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ChartofAccount[]>) {
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
  chartOfAccountsSlice.actions;
export default chartOfAccountsSlice.reducer;
