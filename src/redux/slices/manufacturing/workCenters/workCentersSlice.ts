import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { WorkCenter } from "../../types/manufacturing/WorkCenter";

const initialState: DataState<WorkCenter[]> = {
  data: [],
  loading: false,
  error: null,
};

const workCentersSlice = createSlice({
  name: "workCenters",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<WorkCenter[]>) {
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
  workCentersSlice.actions;
export default workCentersSlice.reducer;
