import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Attendence } from "../types/hr/Attendence";

const initialState: DataState<Attendence[]> = {
  data: [],
  loading: false,
  error: null,
};

const attendenciesSlice = createSlice({
  name: "attendencies",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Attendence[]>) {
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
  attendenciesSlice.actions;
export default attendenciesSlice.reducer;
