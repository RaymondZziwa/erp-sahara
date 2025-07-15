import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { JobOffer } from "../types/recruitment/types";

const initialState: DataState<JobOffer[]> = {
  data: [],
  loading: false,
  error: null,
};

const offerSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JobOffer[]>) {
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
offerSlice.actions;
export default offerSlice.reducer;
