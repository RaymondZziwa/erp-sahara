import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { JournalType } from "../../types/ledgers/JournalType";

const initialState: DataState<JournalType[]> = {
  data: [],
  loading: false,
  error: null,
};

const generalLedgersSlice = createSlice({
  name: "journalTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JournalType[]>) {
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
  generalLedgersSlice.actions;
export default generalLedgersSlice.reducer;
