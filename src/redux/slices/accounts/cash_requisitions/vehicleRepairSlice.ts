import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { VehicleRepair } from "../../types/accounts/cash_requisitions/vehicleRepair";

const initialState: DataState<VehicleRepair[]> = {
  data: [],
  loading: false,
  error: null,
};

const vehicleRepairSlice = createSlice({
  name: "vehicleRequisition",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<VehicleRepair[]>) {
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
  vehicleRepairSlice.actions;
export default vehicleRepairSlice.reducer;
