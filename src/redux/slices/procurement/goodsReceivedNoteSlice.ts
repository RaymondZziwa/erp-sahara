import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { GoodReceivedNote } from "../types/procurement/GoodsReceivedNote";

const initialState: DataState<GoodReceivedNote[]> = {
  data: [],
  loading: false,
  error: null,
};

const goodsReceivedSlice = createSlice({
  name: "goodsreceived",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<GoodReceivedNote[]>) {
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
  goodsReceivedSlice.actions;
export default goodsReceivedSlice.reducer;
