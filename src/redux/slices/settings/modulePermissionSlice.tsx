import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { ModulePermission } from "../types/settings/modulePermissions";

const initialState: DataState<ModulePermission[]> = {
  data: [],
  loading: false,
  error: null,
};

const modulePermissionSlice = createSlice({
  name: "modulePermissions",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ModulePermission[]>) {
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
modulePermissionSlice.actions;
export default modulePermissionSlice.reducer;
