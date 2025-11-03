import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Bank } from "../../types/accounts/bankReconciliation/bank";
import { DataState } from "../../types/DataState";

const initialState: DataState<Bank[]> = {
  data: [],
  loading: false,
  error: null,
};

const bankSlice = createSlice({
  name: "bank",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Bank[]>) {
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
  bankSlice.actions;
export default bankSlice.reducer;
