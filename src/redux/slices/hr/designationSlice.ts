import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Designation } from "../types/hr/Designation";

const initialState: DataState<Designation[]> = {
  data: [],
  loading: false,
  error: null,
};

const designationsSlice = createSlice({
  name: "hrDesignations",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Designation[]>) {
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
  designationsSlice.actions;
export default designationsSlice.reducer;
