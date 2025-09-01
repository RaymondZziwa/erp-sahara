import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { QaSetting } from "../../types/itemPurchases/qaSettings";
import { DataState } from "../../types/DataState";

const initialState: DataState<QaSetting[]> = {
  data: [],
  loading: false,
  error: null,
};

const qaSettingsSlice = createSlice({
  name: "qaSettings",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<QaSetting[]>) {
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
qaSettingsSlice.actions;
export default qaSettingsSlice.reducer;
