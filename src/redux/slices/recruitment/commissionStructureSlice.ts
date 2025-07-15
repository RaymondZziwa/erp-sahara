import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { CommissionStructure } from "../types/recruitment/types";

const initialState: DataState<CommissionStructure[]> = {
  data: [],
  loading: false,
  error: null,
};

const commissionStructureSlice = createSlice({
  name: "commissionStructure",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CommissionStructure[]>) {
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
commissionStructureSlice.actions;
export default commissionStructureSlice.reducer;
