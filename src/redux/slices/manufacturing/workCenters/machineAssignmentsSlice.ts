import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { MachineAssignment } from "../../types/manufacturing/MachineAssignment";

const initialState: DataState<MachineAssignment[]> = {
  data: [],
  loading: false,
  error: null,
};

const machineAssignmeentsSlice = createSlice({
  name: "machineAssignements",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<MachineAssignment[]>) {
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
  machineAssignmeentsSlice.actions;
export default machineAssignmeentsSlice.reducer;
