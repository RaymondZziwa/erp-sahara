import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";

export interface ApprovalLevel {
    id: number;
    organisation_id: number;
    branch_id: number;
    name: string;
    level: string;
    isactive: string;
    mandate: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null; 
    approvers: any[];
  }

const initialState: DataState<ApprovalLevel[]> = {
  data: [],
  loading: false,
  error: null,
};

const ApprovalLevelSlice = createSlice({
  name: "levels",
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
    ApprovalLevelSlice .actions;
export default ApprovalLevelSlice .reducer;
