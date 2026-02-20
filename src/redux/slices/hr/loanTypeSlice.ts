import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { LoanType } from "../types/hr/loanType";

const initialState: DataState<LoanType[]> = {
  data: [],
  loading: false,
  error: null,
};

const loanTypeSlice = createSlice({
  name: "loanTypeSlice",
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
  loanTypeSlice.actions;
export default loanTypeSlice.reducer;
