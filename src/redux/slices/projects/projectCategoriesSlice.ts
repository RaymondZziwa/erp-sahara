import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ProjectCategory } from "../types/projects/Category";

const initialState: DataState<ProjectCategory[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectCategoriesSlice = createSlice({
  name: "projectCategories",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProjectCategory[]>) {
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
  projectCategoriesSlice.actions;
export default projectCategoriesSlice.reducer;
