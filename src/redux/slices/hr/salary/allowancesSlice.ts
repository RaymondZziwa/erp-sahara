import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { Allowance } from "../../types/hr/salary/Allowances";

const initialState: DataState<Allowance[]> = {
  data: [],
  loading: false,
  error: null,
};

const allowancesSlice = createSlice({
  name: "allowances",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Allowance[]>) {
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
  allowancesSlice.actions;
export default allowancesSlice.reducer;
