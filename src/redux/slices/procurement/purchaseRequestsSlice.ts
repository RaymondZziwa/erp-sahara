import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { PurchaseRequest } from "../types/procurement/PurchaseRequests";

const initialState: DataState<PurchaseRequest[]> = {
  data: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "purchaseRequests",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<PurchaseRequest[]>) {
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
  categoriesSlice.actions;
export default categoriesSlice.reducer;
