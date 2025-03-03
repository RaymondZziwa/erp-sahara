import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { balanceSheetType } from "../../types/reports/balanceSheet";

const initialState: DataState<balanceSheetType> = {
  data: {
    assets: [],
    equity: [],
    liabilities: [],
    current_profit_or_loss: 0,
    total_assets: 0,
    total_liabilities_equity: 0,
  },
  loading: false,
  error: null,
};

const balanceSheetSlice = createSlice({
  name: "balanceSheet", // Fix: Corrected slice name
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<balanceSheetType>) {
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
  balanceSheetSlice.actions;
export default balanceSheetSlice.reducer;
