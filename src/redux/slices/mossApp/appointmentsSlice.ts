import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Appointment } from "../types/mossApp/Appointments";

const initialState: DataState<Appointment[]> = {
  data: [],
  loading: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: "appontments",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Appointment[]>) {
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
  appointmentsSlice.actions;
export default appointmentsSlice.reducer;
