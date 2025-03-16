import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { WarehouseType } from "../types/inventory/Warehouse";

const initialState: DataState<WarehouseType[]> = {
  data: [],
  loading: false,
  error: null,
};

const warehouseTypesSlice = createSlice({
  name: "warehouseTypes",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<WarehouseType[]>) {
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
  warehouseTypesSlice.actions;
export default warehouseTypesSlice.reducer;
