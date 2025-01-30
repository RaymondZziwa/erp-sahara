import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { ProjectActivityParameter } from "../types/projects/ProjectParameter";

const initialState: DataState<ProjectActivityParameter[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectActivityParameters = createSlice({
  name: "projectActivityParameters",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProjectActivityParameter[]>) {
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
  projectActivityParameters.actions;
export default projectActivityParameters.reducer;
