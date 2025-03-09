import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { AssetCategory } from "../types/mossApp/assets/asset";

const initialState: DataState<AssetCategory[]> = {
  data: [],
  loading: false,
  error: null,
};

const assetCategoriesSlice = createSlice({
  name: "assetCategories",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AssetCategory[]>) {
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
  assetCategoriesSlice.actions;
export default assetCategoriesSlice.reducer;
