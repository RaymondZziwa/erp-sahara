import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { WorkOrder } from "../../types/manufacturing/WorkOrder";

const initialState: DataState<WorkOrder[]> = {
  data: [],
  loading: false,
  error: null,
};

const workCenterOrderssSlice = createSlice({
  name: "workCenterOrders",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<WorkOrder[]>) {
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
  workCenterOrderssSlice.actions;
export default workCenterOrderssSlice.reducer;
