import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { User } from "../types/mossApp/Users";

const initialState: DataState<User[]> = {
  data: [],
  loading: false,
  error: null,
};

const healthWorkersSlice = createSlice({
  name: "healthWorkers",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<User[]>) {
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
  healthWorkersSlice.actions;
export default healthWorkersSlice.reducer;
