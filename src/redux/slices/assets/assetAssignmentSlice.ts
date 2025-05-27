import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { AssetAssignment } from "../types/mossApp/assets/asset";

const initialState: DataState<AssetAssignment[]> = {
  data: [],
  loading: false,
  error: null,
};

const assetAssignmentSlice = createSlice({
  name: "assetAssignment",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AssetAssignment[]>) {
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
 assetAssignmentSlice.actions;
export default assetAssignmentSlice.reducer;
