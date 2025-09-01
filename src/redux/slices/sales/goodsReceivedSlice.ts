import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { GoodsReceivedNote } from "../types/sales/goodsReceived";

const initialState: DataState<GoodsReceivedNote[]> = {
  data: [],
  loading: false,
  error: null,
};

const goodsReceivedNoteSlice = createSlice({
  name: "goodsReceivedSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<GoodsReceivedNote[]>) {
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
goodsReceivedNoteSlice.actions;
export default goodsReceivedNoteSlice.reducer;
