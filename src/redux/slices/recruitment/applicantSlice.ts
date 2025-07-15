import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { JobApplication } from "../types/recruitment/types";

const initialState: DataState<JobApplication[]> = {
  data: [],
  loading: false,
  error: null,
};

const  applicantSlice = createSlice({
  name: "applicant",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JobApplication[]>) {
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
applicantSlice.actions;
export default applicantSlice.reducer;
