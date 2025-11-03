import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BankAccount } from "../../types/accounts/bankReconciliation/bank";
import { DataState } from "../../types/DataState";

const initialState: DataState<BankAccount[]> = {
  data: [],
  loading: false,
  error: null,
};

const bankAccountSlice = createSlice({
  name: "bankAccount",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<BankAccount[]>) {
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
  bankAccountSlice.actions;
export default bankAccountSlice.reducer;
