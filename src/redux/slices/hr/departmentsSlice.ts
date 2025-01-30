import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { Department } from "../types/hr/Departments";

const initialState: DataState<Department[]> = {
  data: [],
  loading: false,
  error: null,
};

const departmentssSlice = createSlice({
  name: "hrDepartmentss",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Department[]>) {
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
  departmentssSlice.actions;
export default departmentssSlice.reducer;
