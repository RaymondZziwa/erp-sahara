import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { UserStatistics } from "../types/mossApp/userStats";

const initialState: DataState<UserStatistics | null> = {
  data: null,
  loading: false,
  error: null,
};

const userStatsSlice = createSlice({
  name: "userStats",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<UserStatistics>) {
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
  userStatsSlice.actions;
export default userStatsSlice.reducer;
