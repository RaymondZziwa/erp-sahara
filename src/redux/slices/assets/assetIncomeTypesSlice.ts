import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { AssetIncomeType } from "../types/mossApp/assets/asset";

const initialState: DataState<AssetIncomeType[]> = {
  data: [],
  loading: false,
  error: null,
};

const assetIncomeTypesSlice = createSlice({
  name: "assetIncomeTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AssetIncomeType[]>) {
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
 assetIncomeTypesSlice.actions;
export default assetIncomeTypesSlice.reducer;
