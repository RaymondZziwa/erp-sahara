import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { AssetDisposal } from "../types/mossApp/assets/asset";

const initialState: DataState<AssetDisposal[]> = {
  data: [],
  loading: false,
  error: null,
};

const assetDisposalSlice = createSlice({
  name: "assetDisposal",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AssetDisposal[]>) {
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
 assetDisposalSlice.actions;
export default assetDisposalSlice.reducer;
