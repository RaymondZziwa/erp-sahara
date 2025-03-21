import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Condition } from "../types/mossApp/Conditions";

const initialState: DataState<Condition[]> = {
  data: [],
  loading: false,
  error: null,
};

const healthConditionsSlice = createSlice({
  name: "healthconditions",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Condition[]>) {
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
  healthConditionsSlice.actions;
export default healthConditionsSlice.reducer;
