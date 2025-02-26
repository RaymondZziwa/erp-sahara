import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { AccountSubCategory } from "../types/accounts/subCategories";

const initialState: DataState<AccountSubCategory[]> = {
  data: [],
  loading: false,
  error: null,
};

const accountSubCategoriesSlice = createSlice({
  name: "accountsSubCats",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<AccountSubCategory[]>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete Actions
    deleteDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    deleteDataSuccess(state, action: PayloadAction<number>) {
      state.loading = false;
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
    deleteDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  deleteDataStart,
  deleteDataSuccess,
  deleteDataFailure,
} = accountSubCategoriesSlice.actions;

export default accountSubCategoriesSlice.reducer;
