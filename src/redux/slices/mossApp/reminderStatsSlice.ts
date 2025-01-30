import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ReminderStats } from "../types/mossApp/ReminderStats";

const initialState: DataState<ReminderStats | null> = {
  data: null,
  loading: false,
  error: null,
};

const remindersStatsSlice = createSlice({
  name: "reminderStats",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ReminderStats>) {
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
  remindersStatsSlice.actions;
export default remindersStatsSlice.reducer;
