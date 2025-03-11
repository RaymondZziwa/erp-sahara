import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { FarmGroup } from "../types/farmGroups/FarmGroup";

const initialState: DataState<FarmGroup[]> = {
  data: [],
  loading: false,
  error: null,
};

const farmGroupsSlice = createSlice({
  name: "farmGroups",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<FarmGroup[]>) {
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
farmGroupsSlice.actions;
export default farmGroupsSlice.reducer;
