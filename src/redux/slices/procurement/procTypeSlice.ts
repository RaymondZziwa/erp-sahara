import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { ProcurementType } from "../types/procurement/ProcurementTypes";

const initialState: DataState<ProcurementType[]> = {
  data: [],
  loading: false,
  error: null,
};

const procTypeSlice = createSlice({
  name: "proctypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ProcurementType[]>) {
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
  procTypeSlice.actions;
export default procTypeSlice.reducer;
