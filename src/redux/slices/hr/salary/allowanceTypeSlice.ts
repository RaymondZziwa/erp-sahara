import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { AllowanceType } from "../../types/hr/salary/AllowanceType";

const initialState: DataState<AllowanceType[]> = {
  data: [],
  loading: false,
  error: null,
};

const allowanceTypesSlice = createSlice({
  name: "allowanceType",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AllowanceType[]>) {
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
  allowanceTypesSlice.actions;
export default allowanceTypesSlice.reducer;
