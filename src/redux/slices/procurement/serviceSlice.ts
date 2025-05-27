import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { Service } from "../types/procurement/ProcurementTypes";


const initialState: DataState<Service[]> = {
  data: [],
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: "serviceSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Service[]>) {
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
  serviceSlice.actions;
export default serviceSlice.reducer;
