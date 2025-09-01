import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { SupplierLoanRequest } from "../types/supplierLoans/supplierLoans";

const initialState: DataState<SupplierLoanRequest[]> = {
  data: [],
  loading: false,
  error: null,
};

const supplierLoanSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SupplierLoanRequest[]>) {
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
supplierLoanSlice.actions;
export default supplierLoanSlice.reducer;
