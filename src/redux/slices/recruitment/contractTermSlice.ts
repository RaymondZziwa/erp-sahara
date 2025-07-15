import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { JobContractTerms } from "../types/recruitment/types";

const initialState: DataState<JobContractTerms[]> = {
  data: [],
  loading: false,
  error: null,
};

const contractTermSlice = createSlice({
  name: "contractTerm",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<JobContractTerms[]>) {
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
contractTermSlice.actions;
export default contractTermSlice.reducer;
