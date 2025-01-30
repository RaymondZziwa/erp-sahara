import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { ActivityParamenterResult } from "../types/projects/ParameterResults";

const initialState: DataState<ActivityParamenterResult[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectActivityParametersResults = createSlice({
  name: "projectActivityParametersResults",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ActivityParamenterResult[]>) {
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
  projectActivityParametersResults.actions;
export default projectActivityParametersResults.reducer;
