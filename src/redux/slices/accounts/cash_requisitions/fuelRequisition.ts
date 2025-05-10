import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { FuelRequisition } from "../../types/accounts/cash_requisitions/CashRequisition";

const initialState: DataState<FuelRequisition[]> = {
  data: [],
  loading: false,
  error: null,
};

const fuelRequisitionsSlice = createSlice({
  name: "fuelReq",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<FuelRequisition[]>) {
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
  fuelRequisitionsSlice.actions;
export default fuelRequisitionsSlice.reducer;
