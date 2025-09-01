import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { JobBoard } from "../types/recruitment/types";

const initialState: DataState<JobBoard[]> = {
  data: [],
  loading: false,
  error: null,
};

const jobBoardSlice = createSlice({
  name: "jobBoard",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JobBoard[]>) {
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
    jobBoardSlice.actions;
export default jobBoardSlice.reducer;
