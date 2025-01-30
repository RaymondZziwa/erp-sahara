import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { LeaveApplication } from "../types/hr/LeaveApplication";

const initialState: DataState<LeaveApplication[]> = {
  data: [],
  loading: false,
  error: null,
};

const leaveApplicationsSlice = createSlice({
  name: "leaveApllications",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<LeaveApplication[]>) {
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
  leaveApplicationsSlice.actions;
export default leaveApplicationsSlice.reducer;
