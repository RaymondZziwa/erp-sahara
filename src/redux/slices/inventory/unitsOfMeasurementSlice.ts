import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { UnitOfMeasurement } from "../types/procurement/units";

const initialState: DataState<UnitOfMeasurement[]> = {
  data: [],
  loading: false,
  error: null,
};

const unitsSlice = createSlice({
  name: "inventory_uom",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<UnitOfMeasurement[]>) {
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
  unitsSlice.actions;
export default unitsSlice.reducer;
