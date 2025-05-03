import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { StoreRequisition } from "../../types/accounts/cash_requisitions/CashRequisition";

const initialState: DataState<StoreRequisition[]> = {
  data: [],
  loading: false,
  error: null,
};

const storeRequisitionsSlice = createSlice({
  name: "storeReq",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<StoreRequisition[]>) {
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
  storeRequisitionsSlice.actions;
export default storeRequisitionsSlice.reducer;
