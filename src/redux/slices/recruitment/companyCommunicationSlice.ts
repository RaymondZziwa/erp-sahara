import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { CompanyCommunication } from "../types/recruitment/types";

const initialState: DataState<CompanyCommunication[]> = {
  data: [],
  loading: false,
  error: null,
};

const companyCommunicationSlice = createSlice({
  name: "companyCommunication",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CompanyCommunication[]>) {
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
companyCommunicationSlice.actions;
export default companyCommunicationSlice.reducer;
