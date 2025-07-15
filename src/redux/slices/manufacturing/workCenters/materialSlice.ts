import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";

import { Material } from "../../types/manufacturing/WorkCenter";

const initialState: DataState<Material[]> = {
  data: [],
  loading: false,
  error: null,
};

const materialSlice = createSlice({
  name: "material",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Material[]>) {
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
materialSlice.actions;
export default materialSlice.reducer;
