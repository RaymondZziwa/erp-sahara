import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { AppointmentType } from "../types/mossApp/AppointmentType";

const initialState: DataState<AppointmentType[]> = {
  data: [],
  loading: false,
  error: null,
};

const appointmentTypesSlice = createSlice({
  name: "appontmentTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AppointmentType[]>) {
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
  appointmentTypesSlice.actions;
export default appointmentTypesSlice.reducer;
