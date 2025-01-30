import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { LeaveType } from "../types/hr/Leave";

const initialState: DataState<LeaveType[]> = {
  data: [],
  loading: false,
  error: null,
};

const salaryStructureSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<LeaveType[]>) {
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
  salaryStructureSlice.actions;
export default salaryStructureSlice.reducer;
