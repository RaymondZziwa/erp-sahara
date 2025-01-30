import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

import { IAccountType } from "../types/accounts/AccountType";

const initialState: DataState<IAccountType[]> = {
  data: [],
  loading: false,
  error: null,
};

const accountCategoriesSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IAccountType[]>) {
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
  accountCategoriesSlice.actions;
export default accountCategoriesSlice.reducer;
