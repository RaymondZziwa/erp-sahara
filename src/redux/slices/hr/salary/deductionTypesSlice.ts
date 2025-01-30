import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { DataState } from "../../types/DataState";
import { DeductionType } from "../../types/hr/salary/DeductionTypes";

const initialState: DataState<DeductionType[]> = {
  data: [],
  loading: false,
  error: null,
};

const deductionTypesSlice = createSlice({
  name: "deductionTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<DeductionType[]>) {
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
  deductionTypesSlice.actions;
export default deductionTypesSlice.reducer;
