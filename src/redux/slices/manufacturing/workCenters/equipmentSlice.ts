import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { Equipment } from "../../types/manufacturing/Equipment";

const initialState: DataState<Equipment[]> = {
  data: [],
  loading: false,
  error: null,
};

const equpmentSlice = createSlice({
  name: "workEquipment",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Equipment[]>) {
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
  equpmentSlice.actions;
export default equpmentSlice.reducer;
