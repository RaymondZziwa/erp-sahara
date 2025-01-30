import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ProjectRole } from "../types/projects/ProjectRole";

const initialState: DataState<ProjectRole[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectRoles = createSlice({
  name: "projectRoles",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProjectRole[]>) {
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
  projectRoles.actions;
export default projectRoles.reducer;
