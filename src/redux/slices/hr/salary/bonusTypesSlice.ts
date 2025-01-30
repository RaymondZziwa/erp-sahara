import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BonusType } from "../../types/hr/salary/BonusType";
import { DataState } from "../../types/DataState";

const initialState: DataState<BonusType[]> = {
  data: [],
  loading: false,
  error: null,
};

const bonusTypesSlice = createSlice({
  name: "bonusType",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<BonusType[]>) {
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
  bonusTypesSlice.actions;
export default bonusTypesSlice.reducer;
