import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

// Permission Interface
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

// Initial State
const initialState: DataState<Permission[]> = {
  data: [],
  loading: false,
  error: null,
};

// Permission Slice
const PermissionSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Permission[]>) {
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

// Export Actions & Reducer
export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
  PermissionSlice.actions;
export default PermissionSlice.reducer;
