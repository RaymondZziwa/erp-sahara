import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { LoanType } from "../../types/hr/salary/LoanType";

const initialState: DataState<LoanType[]> = {
  data: [],
  loading: false,
  error: null,
};

const loanTypessSlice = createSlice({
  name: "loanTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<LoanType[]>) {
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
  loanTypessSlice.actions;
export default loanTypessSlice.reducer;
