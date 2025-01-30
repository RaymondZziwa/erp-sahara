import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { CenterDownTimeLog } from "../../types/manufacturing/DownTimeLog";

const initialState: DataState<CenterDownTimeLog[]> = {
  data: [],
  loading: false,
  error: null,
};

const centerDownTimeLog = createSlice({
  name: "centerDownTimeLog",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CenterDownTimeLog[]>) {
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
  centerDownTimeLog.actions;
export default centerDownTimeLog.reducer;
