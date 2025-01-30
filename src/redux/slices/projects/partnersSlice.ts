import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Partner } from "../types/projects/Partner";

const initialState: DataState<Partner[]> = {
  data: [],
  loading: false,
  error: null,
};

const partnersSlice = createSlice({
  name: "projectPartners",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Partner[]>) {
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
  partnersSlice.actions;
export default partnersSlice.reducer;
