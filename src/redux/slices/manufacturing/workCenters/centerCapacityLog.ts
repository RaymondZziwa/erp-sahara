import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { CapapcityLog } from "../../types/manufacturing/CapacityLog";

const initialState: DataState<CapapcityLog[]> = {
  data: [],
  loading: false,
  error: null,
};

const centerCapacityLog = createSlice({
  name: "centerCapacityLog",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CapapcityLog[]>) {
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
  centerCapacityLog.actions;
export default centerCapacityLog.reducer;
