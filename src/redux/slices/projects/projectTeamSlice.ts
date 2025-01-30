import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ProjectTeamMember } from "../types/projects/Team";

const initialState: DataState<ProjectTeamMember[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectTeam = createSlice({
  name: "projectTeam",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProjectTeamMember[]>) {
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
  projectTeam.actions;
export default projectTeam.reducer;
