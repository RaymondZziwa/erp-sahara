import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { MaintainanceLog } from "../../types/manufacturing/maintainanceLog";

const initialState: DataState<MaintainanceLog[]> = {
  data: [],
  loading: false,
  error: null,
};

const maintainanceLogSlice = createSlice({
  name: "maintannaceLog",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<MaintainanceLog[]>) {
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
  maintainanceLogSlice.actions;
export default maintainanceLogSlice.reducer;
