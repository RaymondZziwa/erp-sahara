import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { JobDistribution } from "../types/recruitment/types";

const initialState: DataState<JobDistribution[]> = {
  data: [],
  loading: false,
  error: null,
};

const jobDistributionlice = createSlice({
  name: "jobDistribution",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JobDistribution[]>) {
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
 jobDistributionlice.actions;
export default jobDistributionlice.reducer;
