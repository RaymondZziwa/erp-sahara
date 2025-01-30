import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { Deduction } from "../../types/hr/salary/Deduction";

const initialState: DataState<Deduction[]> = {
  data: [],
  loading: false,
  error: null,
};

const deductionsSlice = createSlice({
  name: "deductions",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Deduction[]>) {
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
  deductionsSlice.actions;
export default deductionsSlice.reducer;
