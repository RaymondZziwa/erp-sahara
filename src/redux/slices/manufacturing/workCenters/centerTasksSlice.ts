import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { CenterTask } from "../../types/manufacturing/CenterTask";

const initialState: DataState<CenterTask[]> = {
  data: [],
  loading: false,
  error: null,
};

const centerTasksSlice = createSlice({
  name: "centerTasks",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<CenterTask[]>) {
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
  centerTasksSlice.actions;
export default centerTasksSlice.reducer;
