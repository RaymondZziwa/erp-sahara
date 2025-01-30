import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ActivityProgram } from "../types/projects/ActivityProgram";

const initialState: DataState<ActivityProgram[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectActivityPrograms = createSlice({
  name: "projectActivityPrograms",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ActivityProgram[]>) {
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
  projectActivityPrograms.actions;
export default projectActivityPrograms.reducer;
