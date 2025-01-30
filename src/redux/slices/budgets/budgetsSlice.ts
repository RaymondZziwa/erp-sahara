import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Budget } from "../types/budgets/Budget";

const initialState: DataState<Budget[]> = {
  data: [],
  loading: false,
  error: null,
};

const budgetsSlice = createSlice({
  name: "budges",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Budget[]>) {
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
  budgetsSlice.actions;
export default budgetsSlice.reducer;
