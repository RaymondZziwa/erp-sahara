import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { CashRequisition } from "../../types/accounts/cash_requisitions/CashRequisition";

const initialState: DataState<CashRequisition[]> = {
  data: [],
  loading: false,
  error: null,
};

const cashRequisitionsSlice = createSlice({
  name: "cashReq",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CashRequisition[]>) {
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
  cashRequisitionsSlice.actions;
export default cashRequisitionsSlice.reducer;
