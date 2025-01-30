import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ActivityPlan } from "../types/projects/ActivityPlan";

const initialState: DataState<ActivityPlan[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectActivityPlans = createSlice({
  name: "projectActivityPlans",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ActivityPlan[]>) {
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
  projectActivityPlans.actions;
export default projectActivityPlans.reducer;
