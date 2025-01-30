import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Truck } from "../types/mossApp/Trucks";

const initialState: DataState<Truck[]> = {
  data: [],
  loading: false,
  error: null,
};

const trucksSlice = createSlice({
  name: "trucks",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Truck[]>) {
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
  trucksSlice.actions;
export default trucksSlice.reducer;
