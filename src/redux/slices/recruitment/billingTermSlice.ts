import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { BillingTerm } from "../types/recruitment/types";

const initialState: DataState<BillingTerm[]> = {
  data: [],
  loading: false,
  error: null,
};

const billingTermSlice = createSlice({
  name: "billingTerm",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<BillingTerm[]>) {
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
billingTermSlice.actions;
export default billingTermSlice.reducer;
