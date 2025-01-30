import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ActivityService } from "../types/projects/ActivityService";

const initialState: DataState<ActivityService[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectActivityServices = createSlice({
  name: "projectActivityServices",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ActivityService[]>) {
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
  projectActivityServices.actions;
export default projectActivityServices.reducer;
