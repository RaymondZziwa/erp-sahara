import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { AssetMaintenance } from "../types/mossApp/assets/asset";

const initialState: DataState<AssetMaintenance[]> = {
  data: [],
  loading: false,
  error: null,
};

const assetMaintenanceSlice = createSlice({
  name: "assetMaintenance",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AssetMaintenance[]>) {
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
 assetMaintenanceSlice.actions;
export default assetMaintenanceSlice.reducer;
