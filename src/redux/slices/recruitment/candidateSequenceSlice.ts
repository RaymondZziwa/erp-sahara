import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { CandidateSequence } from "../types/recruitment/types";

const initialState: DataState<CandidateSequence[]> = {
  data: [],
  loading: false,
  error: null,
};

const candidateSequenceSlice = createSlice({
  name: "candidateSequence",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CandidateSequence[]>) {
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
candidateSequenceSlice.actions;
export default candidateSequenceSlice.reducer;
