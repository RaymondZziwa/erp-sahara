import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { EvaluationCriteria } from "../types/procurement/EvaluationCriteria";

const initialState: DataState<EvaluationCriteria[]> = {
  data: [],
  loading: false,
  error: null,
};

const bidEvaluationCriteria = createSlice({
  name: "bidEvaluationCriteria",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<EvaluationCriteria[]>) {
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
  bidEvaluationCriteria.actions;
export default bidEvaluationCriteria.reducer;
