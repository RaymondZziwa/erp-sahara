import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { Opportunity } from "../types/sales/Opportunities";

const initialState: DataState<Opportunity[]> = {
  data: [],
  loading: false,
  error: null,
};

const opportunitySlice = createSlice({
  name: "opportunities",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Opportunity[]>) {
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
opportunitySlice.actions;
export default opportunitySlice.reducer;
