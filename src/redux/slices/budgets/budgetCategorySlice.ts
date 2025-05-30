import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { BudgetCategory } from "../types/budgets/Budget";

const initialState: DataState<BudgetCategory[]> = {
  data: [],
  loading: false,
  error: null,
};

const budgetCategorySlice = createSlice({
  name: "budgetCategory",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<BudgetCategory[]>) {
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
  budgetCategorySlice.actions;
export default budgetCategorySlice.reducer;
