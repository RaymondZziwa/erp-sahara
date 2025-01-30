import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../../types/DataState";
import { ApprovalLevel } from "../../types/accounts/cash_requisitions/ApprovalLevels";

const initialState: DataState<ApprovalLevel[]> = {
  data: [],
  loading: false,
  error: null,
};

const cashRequisitionsApprovalLevelsSlice = createSlice({
  name: "cashReqapprovalLevel",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ApprovalLevel[]>) {
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
  cashRequisitionsApprovalLevelsSlice.actions;
export default cashRequisitionsApprovalLevelsSlice.reducer;
