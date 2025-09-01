import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { DeliveryNote } from "../types/sales/deliveryNotes";

const initialState: DataState<DeliveryNote[]> = {
  data: [],
  loading: false,
  error: null,
};

const deliveryNoteSlice = createSlice({
  name: "deliveryNoteSlice",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<DeliveryNote[]>) {
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
deliveryNoteSlice.actions;
export default deliveryNoteSlice.reducer;
