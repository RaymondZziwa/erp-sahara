import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { CommunicationTemplate } from "../types/recruitment/types";

const initialState: DataState<CommunicationTemplate[]> = {
  data: [],
  loading: false,
  error: null,
};

const communicationTemplateSlice = createSlice({
  name: "communicationTemplate",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CommunicationTemplate[]>) {
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
communicationTemplateSlice.actions;
export default communicationTemplateSlice.reducer;
