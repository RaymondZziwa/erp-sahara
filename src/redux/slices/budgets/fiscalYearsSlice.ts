import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { FiscalYear } from "../types/budgets/FiscalYear";

const initialState: DataState<FiscalYear[]> = {
  data: [],
  loading: false,
  error: null,
};

const fiscalYearsSlice = createSlice({
  name: "years",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<FiscalYear[]>) {
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
  fiscalYearsSlice.actions;
export default fiscalYearsSlice.reducer;
