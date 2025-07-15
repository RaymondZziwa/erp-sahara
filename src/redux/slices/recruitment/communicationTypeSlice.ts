import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { CommunicationType } from "../types/recruitment/types";

const initialState: DataState<CommunicationType[]> = {
  data: [],
  loading: false,
  error: null,
};

const communicationTypeSlice = createSlice({
  name: "communicationType",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CommunicationType[]>) {
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
communicationTypeSlice.actions;
export default communicationTypeSlice.reducer;
