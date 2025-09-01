import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { JobOrder } from "../types/recruitment/types";

const initialState: DataState<JobOrder[]> = {
  data: [],
  loading: false,
  error: null,
};

const jobOrderSlice = createSlice({
  name: "jobOrder",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JobOrder[]>) {
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
    jobOrderSlice.actions;
export default jobOrderSlice.reducer;
