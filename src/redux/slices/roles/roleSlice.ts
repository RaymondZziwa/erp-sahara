import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";


export interface Role {
    id: number,
    organisation_id: number,
    branch_id: number,
    name: string,
    guard_name: string,
    permissions: []
}

const initialState: DataState<Role[]> = {
  data: [],
  loading: false,
  error: null,
};

const RoleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<Role[]>) {
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
  RoleSlice.actions;
export default RoleSlice.reducer;
