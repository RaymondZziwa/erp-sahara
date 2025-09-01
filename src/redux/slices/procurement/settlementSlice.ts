import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { Settlement } from "../types/itemPurchases/purchase";

const initialState: DataState<Settlement[]> = {
  data: [],
  loading: false,
  error: null,
};

const settlementSlice = createSlice({
  name: "settlemet",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Settlement[]>) {
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
settlementSlice.actions;
export default settlementSlice.reducer;
