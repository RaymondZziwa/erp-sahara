import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { Interview } from "../types/recruitment/types";

const initialState: DataState<Interview[]> = {
  data: [],
  loading: false,
  error: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Interview[]>) {
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
interviewSlice.actions;
export default interviewSlice.reducer;
